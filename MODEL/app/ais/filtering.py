
from datetime import datetime, timezone

from app.ais.validation import validate_position
from app.schemas.ais import AISPosition
from app.utils.geo import point_in_or_near_polygon
from app.utils.time import parse_datetime


def filter_positions(
    positions: list[AISPosition],
    origin_zone: dict,
    start: datetime | str,
    end: datetime | str,
    buffer_km: float,
) -> list[AISPosition]:
    start = parse_datetime(start)
    end = parse_datetime(end)
    output = []
    for p in positions:
        if not validate_position(p):
            continue
        t = parse_datetime(p.timestamp)
        if not (start <= t <= end):
            continue
        if point_in_or_near_polygon(
            p.latitude,
            p.longitude,
            origin_zone,
            buffer_km,
        ):
            output.append(p)
    return output
