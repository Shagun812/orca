
from dataclasses import dataclass


@dataclass(frozen=True)
class Particle:
    latitude: float
    longitude: float


def advect(
    particle: Particle,
    hours: float,
    current_u_mps: float,
    current_v_mps: float,
    wind_u_mps: float = 0.0,
    wind_v_mps: float = 0.0,
    windage: float = 0.03,
) -> Particle:
    """Simple equirectangular advection approximation.

    u/v are east/north velocity in m/s. Windage is a small fraction of wind velocity.
    """
    import math

    east_m = (current_u_mps + windage * wind_u_mps) * hours * 3600
    north_m = (current_v_mps + windage * wind_v_mps) * hours * 3600

    lat_deg = north_m / 111_320
    lon_scale = max(1e-6, math.cos(math.radians(particle.latitude)))
    lon_deg = east_m / (111_320 * lon_scale)

    return Particle(
        latitude=particle.latitude + lat_deg,
        longitude=particle.longitude + lon_deg,
    )
