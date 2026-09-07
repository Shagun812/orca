
from dataclasses import dataclass
import os


@dataclass(frozen=True)
class Settings:
    app_name: str = os.getenv("APP_NAME", "orca-intelligence")
    log_level: str = os.getenv("LOG_LEVEL", "INFO")


settings = Settings()
