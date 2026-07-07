"""Client data access."""

from __future__ import annotations

from sqlalchemy import select

from app.entities.client import Client
from app.repositories.base_repository import BaseRepository


class ClientRepository(BaseRepository[Client]):
    model = Client

    async def list(self) -> list[Client]:
        result = await self.session.scalars(
            select(Client).order_by(Client.created_at.desc())
        )
        return list(result)

    async def exists(self, client_id: str) -> bool:
        return await self.get(client_id) is not None
