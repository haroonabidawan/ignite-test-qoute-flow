"""Run Alembic migrations programmatically."""

from __future__ import annotations

import asyncio
from pathlib import Path

from alembic import command
from alembic.config import Config

API_ROOT = Path(__file__).resolve().parent.parent


def alembic_config() -> Config:
    return Config(str(API_ROOT / "alembic.ini"))


def upgrade_head() -> None:
    command.upgrade(alembic_config(), "head")


async def run_migrations() -> None:
    """Apply all pending migrations (used on app startup)."""
    from config.settings import get_settings

    if get_settings().ENVIRONMENT == "test":
        return
    await asyncio.to_thread(upgrade_head)
