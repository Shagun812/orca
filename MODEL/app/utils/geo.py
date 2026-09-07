
import math
from shapely.geometry import Point, shape


def haversine_km(lat1, lon1, lat2, lon2) -> float:
    radius = 6371.0088
    p1 = math.radians(lat1)
    p2 = math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)

    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * radius * math.asin(math.sqrt(a))


def point_in_or_near_polygon(
    latitude: float,
    longitude: float,
    polygon_geojson: dict,
    buffer_km: float,
) -> bool:
    geom = shape(polygon_geojson)
    point = Point(longitude, latitude)

    # Approximate km-to-degree conversion. Good enough for the V1 regional demo.
    buffer_deg = buffer_km / 111.32
    return geom.distance(point) <= buffer_deg
