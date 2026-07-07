"""Database seeders - idempotent; run via make seed or python -m database.seed."""

from __future__ import annotations

from database.connection import async_session_maker
from database.seeders.base import Seeder
from database.seeders.user import UserSeeder

SEEDERS: list[Seeder] = [UserSeeder()]


async def seed() -> None:
    """Run every registered seeder inside a single transaction."""
    async with async_session_maker() as session:
        for seeder in SEEDERS:
            await seeder.run(session)
        await session.commit()


__all__ = ["SEEDERS", "Seeder", "UserSeeder", "seed"]
