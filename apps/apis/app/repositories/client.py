"""Client data access."""

from __future__ import annotations

from sqlalchemy import func, or_, select

from app.models.client import Client
from app.repositories.base import BaseRepository


class ClientRepository(BaseRepository[Client]):
    model = Client

    def _filtered(self, search: str | None):
        stmt = select(Client)
        if search:
            term = f"%{search.strip().lower()}%"
            stmt = stmt.where(
                or_(
                    func.lower(Client.name).like(term),
                    func.lower(Client.company).like(term),
                    func.lower(Client.email).like(term),
                )
            )
        return stmt

    async def list(
        self,
        *,
        offset: int = 0,
        limit: int = 20,
        search: str | None = None,
    ) -> list[Client]:
        stmt = (
            self._filtered(search)
            .order_by(Client.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self.session.scalars(stmt)
        return list(result)

    async def count(self, *, search: str | None = None) -> int:
        stmt = select(func.count()).select_from(self._filtered(search).subquery())
        total = await self.session.scalar(stmt)
        return int(total or 0)

    async def exists(self, client_id: str) -> bool:
        return await self.get(client_id) is not None
