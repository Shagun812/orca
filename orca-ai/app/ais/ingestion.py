
from app.schemas.ais import AISPosition


def ingest(rows: list[dict]) -> list[AISPosition]:
    return [AISPosition.model_validate(row) for row in rows]
