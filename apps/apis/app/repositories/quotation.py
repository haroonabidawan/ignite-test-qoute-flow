"""Quotation data access."""

from __future__ import annotations

from sqlalchemy import func, or_, select
from sqlalchemy.orm import selectinload

from app.models.client import Client
from app.models.quotation import Quotation, QuotationStatus
from app.repositories.base import BaseRepository


class QuotationRepository(BaseRepository[Quotation]):
    model = Quotation

    async def get(self, entity_id: str) -> Quotation | None:
        return await self.session.scalar(
            select(Quotation)
            .options(selectinload(Quotation.items), selectinload(Quotation.client))
            .where(Quotation.id == entity_id)
        )

    def _filtered(
        self,
        *,
        search: str | None = None,
        status: QuotationStatus | None = None,
    ):
        stmt = select(Quotation)
        if status is not None:
            stmt = stmt.where(Quotation.status == status)
        if search:
            term = f"%{search.strip().lower()}%"
            stmt = stmt.join(Client, Quotation.client_id == Client.id).where(
                or_(
                    func.lower(Quotation.title).like(term),
                    func.lower(Client.name).like(term),
                    func.lower(Client.company).like(term),
                )
            )
        return stmt

    async def list(
        self,
        *,
        offset: int = 0,
        limit: int = 20,
        search: str | None = None,
        status: QuotationStatus | None = None,
    ) -> list[Quotation]:
        stmt = (
            self._filtered(search=search, status=status)
            .options(selectinload(Quotation.items))
            .order_by(Quotation.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self.session.scalars(stmt)
        return list(result)

    async def count(
        self,
        *,
        search: str | None = None,
        status: QuotationStatus | None = None,
    ) -> int:
        filtered = self._filtered(search=search, status=status)
        stmt = select(func.count()).select_from(
            filtered.with_only_columns(Quotation.id).subquery()
        )
        total = await self.session.scalar(stmt)
        return int(total or 0)
