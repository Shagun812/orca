
from app.schemas.ais import AISPosition


def validate_position(position: AISPosition) -> bool:
    return (
        -90 <= position.latitude <= 90
        and -180 <= position.longitude <= 180
        and 0 <= position.speed_knots <= 100
    )
