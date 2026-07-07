"""Application configuration loaded from environment / .env only."""

from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


def _parse_comma_separated_list(value: object) -> list[str]:
    """Parse comma-separated env values (settings JSON-decodes lists otherwise)."""
    if isinstance(value, str):
        return [item.strip() for item in value.split(",") if item.strip()]
    if isinstance(value, list):
        return value
    raise ValueError("Expected a comma-separated string or list")


class Settings(BaseSettings):
    """Environment-driven settings. All values must be set in ``.env``."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # App
    APP_NAME: str
    APP_VERSION: str
    ENVIRONMENT: Literal["development", "staging", "production", "test"]
    DEBUG: bool

    # Database
    DATABASE_URL: str

    # Auth
    SECRET_KEY: str
    JWT_ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    AUTH_COOKIE_NAME: str = "quoteflow_token"
    AUTH_COOKIE_DOMAIN: str = ""
    AUTH_COOKIE_SECURE: bool = False
    AUTH_COOKIE_SAMESITE: Literal["lax", "strict", "none"] = "lax"

    # Login brute-force protection
    LOGIN_MAX_ATTEMPTS: int = 10
    LOGIN_WINDOW_SECONDS: int = 300
    LOGIN_LOCKOUT_SECONDS: int = 900

    # CORS (comma-separated in .env)
    ALLOWED_ORIGINS: str

    # Currency (ISO 4217 code)
    CURRENCY_CODE: str

    # AI provider (OpenAI-compatible)
    AI_API_KEY: str
    AI_BASE_URL: str
    AI_MODEL: str
    AI_TIMEOUT_SECONDS: int

    # AI usage guards - prevent runaway provider bills
    AI_MAX_REQUEST_CHARS: int = 4_000
    AI_COOLDOWN_SECONDS: int = 15
    AI_USER_HOURLY_LIMIT: int = 10
    AI_USER_DAILY_LIMIT: int = 30
    AI_GLOBAL_DAILY_LIMIT: int = 0  # 0 = no global cap

    # n8n webhook
    N8N_WEBHOOK_URL: str
    N8N_TIMEOUT_SECONDS: int

    @property
    def allowed_origins(self) -> list[str]:
        """CORS origins parsed from the comma-separated env value."""
        return _parse_comma_separated_list(self.ALLOWED_ORIGINS)

    @property
    def ai_enabled(self) -> bool:
        """True when a real AI provider key is configured."""
        return bool(self.AI_API_KEY)


@lru_cache
def get_settings() -> Settings:
    """Return the cached settings singleton."""
    return Settings()
