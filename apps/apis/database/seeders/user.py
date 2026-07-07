"""Seeds the default admin user when the database has no matching account."""

from __future__ import annotations

import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from config.security import hash_password
from database.seeders.base import Seeder

logger = logging.getLogger("quoteflow")


class UserSeeder(Seeder):
    EMAIL = "admin@example.com"
    PASSWORD = "password123"  # noqa: S105 - default seed user password
    NAME = "Admin User"

    async def run(self, session: AsyncSession) -> None:
        existing = await session.scalar(select(User).where(User.email == self.EMAIL))
        if existing is not None:
            logger.info("Seed: admin user already exists (%s)", self.EMAIL)
            return
        session.add(
            User(
                email=self.EMAIL,
                name=self.NAME,
                password_hash=hash_password(self.PASSWORD),
            )
        )
        logger.info("Seed: created admin user (%s)", self.EMAIL)
