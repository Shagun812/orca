import math
from datetime import datetime, timedelta, timezone

from app.schemas.drift import (
    DriftRequest,
    DriftResponse,
    ProbableOrigin,
    ReleaseTimeWindow,
)


EARTH_RADIUS_M = 6_371_000.0


class DriftEngine:
    """
    Physics-based oil-spill drift / hindcast engine.

    This is NOT a machine-learning model.

    Oil movement is approximated as:

        V_drift = V_current + alpha * V_wind

    where:
        V_current = ocean current velocity
        V_wind    = wind velocity
        alpha     = windage coefficient

    For backward hindcasting, the effective velocity is reversed
    so particles are traced back from the observed spill location.
    """

    # =========================================================
    # Velocity
    # =========================================================

    def calculate_drift_velocity(
        self,
        wind_u: float,
        wind_v: float,
        current_u: float,
        current_v: float,
        windage: float,
    ):
        """
        Calculate effective oil drift velocity.

        u = east-west component in m/s
        v = north-south component in m/s
        """

        drift_u = current_u + windage * wind_u
        drift_v = current_v + windage * wind_v

        return drift_u, drift_v

    # =========================================================
    # Geographic movement
    # =========================================================

    def move_particle(
        self,
        longitude: float,
        latitude: float,
        velocity_u: float,
        velocity_v: float,
        delta_seconds: float,
    ):
        """
        Move a particle using a spherical Earth approximation.

        velocity_u:
            east-west velocity in m/s

        velocity_v:
            north-south velocity in m/s
        """

        displacement_east = (
            velocity_u * delta_seconds
        )

        displacement_north = (
            velocity_v * delta_seconds
        )

        latitude_rad = math.radians(latitude)

        # Convert north/south displacement to latitude
        delta_lat = (
            displacement_north / EARTH_RADIUS_M
        ) * (180.0 / math.pi)

        # Convert east/west displacement to longitude
        cos_lat = math.cos(latitude_rad)

        if abs(cos_lat) < 1e-8:
            cos_lat = 1e-8

        delta_lon = (
            displacement_east
            / (EARTH_RADIUS_M * cos_lat)
        ) * (180.0 / math.pi)

        return (
            longitude + delta_lon,
            latitude + delta_lat,
        )

    # =========================================================
    # Polygon
    # =========================================================

    def get_polygon_points(self, geometry):
        """
        Extract the outer ring from a GeoJSON Polygon.
        """

        if geometry.type != "Polygon":
            raise ValueError(
                "DriftEngine currently supports only Polygon geometry."
            )

        if not geometry.coordinates:
            raise ValueError(
                "Polygon contains no coordinates."
            )

        return geometry.coordinates[0]

    # =========================================================
    # Particle generation
    # =========================================================

    def generate_particles(
        self,
        polygon_coordinates,
        particles_per_side=5,
    ):
        """
        Generate particles across the detected spill bounding box.

        This is an MVP approximation.

        Example:

            particles_per_side = 5

            5 x 5 = 25 particles
        """

        if particles_per_side < 2:
            particles_per_side = 2

        longitudes = [
            point[0]
            for point in polygon_coordinates
        ]

        latitudes = [
            point[1]
            for point in polygon_coordinates
        ]

        min_lon = min(longitudes)
        max_lon = max(longitudes)

        min_lat = min(latitudes)
        max_lat = max(latitudes)

        particles = []

        for i in range(particles_per_side):

            lon_fraction = (
                i / (particles_per_side - 1)
            )

            longitude = (
                min_lon
                + lon_fraction
                * (max_lon - min_lon)
            )

            for j in range(particles_per_side):

                lat_fraction = (
                    j / (particles_per_side - 1)
                )

                latitude = (
                    min_lat
                    + lat_fraction
                    * (max_lat - min_lat)
                )

                particles.append(
                    {
                        "longitude": longitude,
                        "latitude": latitude,
                    }
                )

        return particles

    # =========================================================
    # Simulation
    # =========================================================

    def simulate(self, request: DriftRequest):
        """
        Run the particle simulation.

        Returns particle positions at every timestep.
        """

        environment = request.environment
        simulation = request.simulation

        polygon = self.get_polygon_points(
            request.spill.geometry
        )

        particles = self.generate_particles(
            polygon,
            simulation.particles_per_side,
        )

        # -----------------------------------------------------
        # Calculate effective drift velocity
        # -----------------------------------------------------

        drift_u, drift_v = (
            self.calculate_drift_velocity(
                wind_u=environment.wind_u_mps,
                wind_v=environment.wind_v_mps,
                current_u=environment.current_u_mps,
                current_v=environment.current_v_mps,
                windage=simulation.windage_coefficient,
            )
        )

        # -----------------------------------------------------
        # Direction
        # -----------------------------------------------------

        if simulation.direction == "backward":
            direction_multiplier = -1.0
        else:
            direction_multiplier = 1.0

        effective_u = (
            drift_u * direction_multiplier
        )

        effective_v = (
            drift_v * direction_multiplier
        )

        # -----------------------------------------------------
        # Time configuration
        # -----------------------------------------------------

        timestep_seconds = (
            simulation.time_step_minutes * 60
        )

        total_steps = int(
            simulation.duration_hours
            * 60
            / simulation.time_step_minutes
        )

        observed_time = self.parse_datetime(
            request.spill.observed_at
        )

        # -----------------------------------------------------
        # Store simulation history
        # -----------------------------------------------------

        history = []

        # IMPORTANT:
        # Store the initial spill positions first.
        history.append(
            {
                "timestamp": observed_time.isoformat(),
                "particles": [
                    particle.copy()
                    for particle in particles
                ],
            }
        )

        # -----------------------------------------------------
        # Particle integration
        # -----------------------------------------------------

        for step in range(1, total_steps + 1):

            if simulation.direction == "backward":

                current_time = (
                    observed_time
                    - timedelta(
                        minutes=(
                            step
                            * simulation.time_step_minutes
                        )
                    )
                )

            else:

                current_time = (
                    observed_time
                    + timedelta(
                        minutes=(
                            step
                            * simulation.time_step_minutes
                        )
                    )
                )

            step_positions = []

            for particle in particles:

                new_lon, new_lat = (
                    self.move_particle(
                        longitude=particle["longitude"],
                        latitude=particle["latitude"],
                        velocity_u=effective_u,
                        velocity_v=effective_v,
                        delta_seconds=timestep_seconds,
                    )
                )

                particle["longitude"] = new_lon
                particle["latitude"] = new_lat

                step_positions.append(
                    {
                        "longitude": new_lon,
                        "latitude": new_lat,
                    }
                )

            history.append(
                {
                    "timestamp": current_time.isoformat(),
                    "particles": step_positions,
                }
            )

        return history

    # =========================================================
    # Probable origin
    # =========================================================

    def calculate_origin(self, history):
        """
        Estimate the probable origin from the final particle
        positions.

        MVP approach:
        create a bounding polygon around the final particles.

        Future version:
        probability-density / KDE based origin surface.
        """

        if not history:
            raise ValueError(
                "Simulation history is empty."
            )

        final_positions = history[-1]["particles"]

        if not final_positions:
            raise ValueError(
                "No particle positions available."
            )

        longitudes = [
            particle["longitude"]
            for particle in final_positions
        ]

        latitudes = [
            particle["latitude"]
            for particle in final_positions
        ]

        min_lon = min(longitudes)
        max_lon = max(longitudes)

        min_lat = min(latitudes)
        max_lat = max(latitudes)

        return [
            [min_lon, min_lat],
            [max_lon, min_lat],
            [max_lon, max_lat],
            [min_lon, max_lat],
            [min_lon, min_lat],
        ]

    # =========================================================
    # Origin confidence
    # =========================================================

    def calculate_origin_confidence(
        self,
        spill_confidence,
        particle_positions,
    ):
        """
        Estimate an MVP origin confidence.

        IMPORTANT:
        This is a heuristic score, NOT a calibrated probability.
        """

        if not particle_positions:
            return 0.0

        longitudes = [
            particle["longitude"]
            for particle in particle_positions
        ]

        latitudes = [
            particle["latitude"]
            for particle in particle_positions
        ]

        lon_range = (
            max(longitudes)
            - min(longitudes)
        )

        lat_range = (
            max(latitudes)
            - min(latitudes)
        )

        dispersion = (
            lon_range + lat_range
        )

        dispersion_factor = 1.0 / (
            1.0 + dispersion * 100.0
        )

        confidence = (
            0.7 * spill_confidence
            + 0.3 * dispersion_factor
        )

        return max(
            0.0,
            min(1.0, confidence),
        )

    # =========================================================
    # Datetime
    # =========================================================

    def parse_datetime(self, value):
        """
        Parse ISO-8601 datetime.
        """

        value = value.strip()

        if value.endswith("Z"):
            value = value[:-1] + "+00:00"

        dt = datetime.fromisoformat(value)

        if dt.tzinfo is None:
            dt = dt.replace(
                tzinfo=timezone.utc
            )

        return dt

    # =========================================================
    # Main engine
    # =========================================================

    def run(self, request: DriftRequest):
        """
        Execute complete drift/hindcast calculation.
        """

        if not request.spill.spill_detected:
            raise ValueError(
                "No spill detected. Drift simulation cannot run."
            )

        # -----------------------------------------------------
        # Run simulation
        # -----------------------------------------------------

        history = self.simulate(request)

        # -----------------------------------------------------
        # Calculate probable origin
        # -----------------------------------------------------

        origin_polygon = self.calculate_origin(
            history
        )

        final_particles = (
            history[-1]["particles"]
        )

        # -----------------------------------------------------
        # Origin confidence
        # -----------------------------------------------------

        origin_confidence = (
            self.calculate_origin_confidence(
                spill_confidence=(
                    request.spill.confidence
                ),
                particle_positions=final_particles,
            )
        )

        # -----------------------------------------------------
        # Release time window
        # -----------------------------------------------------

        observed_time = self.parse_datetime(
            request.spill.observed_at
        )

        duration = timedelta(
            hours=request.simulation.duration_hours
        )

        if request.simulation.direction == "backward":

            release_start = (
                observed_time - duration
            )

            release_end = observed_time

        else:

            release_start = observed_time

            release_end = (
                observed_time + duration
            )

        # -----------------------------------------------------
        # Return validated response
        # -----------------------------------------------------

        return DriftResponse(

            prediction_id=(
                request.spill.prediction_id
            ),

            probable_origin=ProbableOrigin(
                type="Polygon",
                coordinates=[
                    origin_polygon
                ],
            ),

            release_time_window=(
                ReleaseTimeWindow(
                    start=release_start.isoformat(),
                    end=release_end.isoformat(),
                )
            ),

            origin_confidence=round(
                origin_confidence,
                4,
            ),

            simulation={
                "direction": (
                    request.simulation.direction
                ),
                "duration_hours": (
                    request.simulation.duration_hours
                ),
                "time_step_minutes": (
                    request.simulation.time_step_minutes
                ),
                "windage_coefficient": (
                    request.simulation.windage_coefficient
                ),
                "particles": len(
                    final_particles
                ),
                "physics_model": (
                    "current + windage"
                ),
            },
        )


# =============================================================
# Standalone test
# =============================================================

if __name__ == "__main__":

    request = DriftRequest(

        spill={
            "prediction_id": "spill_001",

            "spill_detected": True,

            "confidence": 0.86,

            "area_km2": 12.4,

            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [72.31, 18.62],
                        [72.47, 18.62],
                        [72.47, 18.48],
                        [72.31, 18.48],
                        [72.31, 18.62],
                    ]
                ],
            },

            "observed_at": (
                "2019-12-19T03:59:35Z"
            ),
        },

        environment={

            "wind_u_mps": 3.91,
            "wind_v_mps": -1.91,

            "current_u_mps": 0.21,
            "current_v_mps": 0.05,
        },

        simulation={

            "direction": "backward",

            "duration_hours": 48,

            "time_step_minutes": 15,

            "windage_coefficient": 0.03,

            "particles_per_side": 5,
        },
    )

    engine = DriftEngine()

    result = engine.run(request)

    print()
    print("=" * 60)
    print("ORCA DRIFT / HINDCAST RESULT")
    print("=" * 60)

    print(
        result.model_dump_json(indent=4)
    )