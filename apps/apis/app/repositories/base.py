"""Generic async repository with the common persistence operations."""

from __future__ import annotations

from typing import Generic, TypeVar

from sqlalchemy.ext.asyncio import AsyncSession

from database.connection import Base

ModelT = TypeVar("ModelT", bound=Base)


class BaseRepository(Generic[ModelT]):
    """Base class for entity repositories bound to a single session.

    Subclasses set ``model``; shared CRUD lives here so services never touch
    the session directly.
    """

    model: type[ModelT]

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get(self, entity_id: str) -> ModelT | None:
        return await self.session.get(self.model, entity_id)

    def add(self, entity: ModelT) -> ModelT:
        """Stage an entity for insert. Flush happens at commit / on demand."""
        self.session.add(entity)
        return entity

    async def flush(self) -> None:
        await self.session.flush()

    async def delete(self, entity: ModelT) -> None:
        await self.session.delete(entity)
