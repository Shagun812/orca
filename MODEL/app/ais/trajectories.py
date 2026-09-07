
from collections import defaultdict

from app.schemas.ais import AISPosition


def group_by_vessel(positions: list[AISPosition]) -> dict[str, list[AISPosition]]:
    grouped: dict[str, list[AISPosition]] = defaultdict(list)
    for p in positions:
        grouped[p.mmsi].append(p)

    for rows in grouped.values():
        rows.sort(key=lambda x: x.timestamp)

    return dict(grouped)
