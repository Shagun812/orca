
from dataclasses import dataclass


@dataclass(frozen=True)
class Environment:
    current_u_mps: float = 0.20
    current_v_mps: float = 0.05
    wind_u_mps: float = 0.0
    wind_v_mps: float = 0.0


def default_environment() -> Environment:
    return Environment()
