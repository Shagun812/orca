
def demo_polygon(bbox: list[float]) -> dict:
    west, south, east, north = bbox
    dx = (east - west) * 0.18
    dy = (north - south) * 0.18

    cx = (west + east) / 2
    cy = (south + north) / 2

    points = [
        [cx - dx, cy - dy],
        [cx + dx, cy - dy * 0.75],
        [cx + dx * 0.8, cy + dy],
        [cx - dx * 0.9, cy + dy * 0.8],
        [cx - dx, cy - dy],
    ]

    return {
        "type": "Polygon",
        "coordinates": [points],
    }
