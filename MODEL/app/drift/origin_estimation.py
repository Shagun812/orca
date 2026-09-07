
def estimate_origin(latitude: float, longitude: float, buffer_km: float) -> dict:
    # Returns a GeoJSON circle approximation around the hindcast endpoint.
    import math

    radius_deg_lat = buffer_km / 111.32
    radius_deg_lon = buffer_km / max(1e-6, 111.32 * math.cos(math.radians(latitude)))

    points = []
    for i in range(33):
        theta = 2 * math.pi * i / 32
        points.append([
            longitude + radius_deg_lon * math.cos(theta),
            latitude + radius_deg_lat * math.sin(theta),
        ])

    return {
        "type": "Polygon",
        "coordinates": [points],
        "center": {"latitude": latitude, "longitude": longitude},
        "radius_km": buffer_km,
    }
