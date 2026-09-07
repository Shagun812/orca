
from app.utils.geo import haversine_km


def test_haversine_zero():
    assert haversine_km(0, 0, 0, 0) == 0


def test_haversine_reasonable():
    distance = haversine_km(0, 0, 0, 1)
    assert 110 < distance < 112
