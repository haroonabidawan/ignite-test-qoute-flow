"""Seeder interface."""

from __future__ import annotations

from abc import ABC, abstractmethod

from sqlalchemy.ext.asyncio import AsyncSession


class Seeder(ABC):
    """A single, idempotent seeding unit. Do not commit - the runner does."""

    @abstractmethod
    async def run(self, session: AsyncSession) -> None: ...
