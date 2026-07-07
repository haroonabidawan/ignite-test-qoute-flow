"""Persistence and queries for AI audit logs."""

from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai_log import AiLog


class AiLogRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def count_user_since(self, user_id: str, since: datetime) -> int:
        result = await self.session.scalar(
            select(func.count())
            .select_from(AiLog)
            .where(AiLog.user_id == user_id, AiLog.created_at >= since)
        )
        return int(result or 0)

    async def count_global_since(self, since: datetime) -> int:
        result = await self.session.scalar(
            select(func.count()).select_from(AiLog).where(AiLog.created_at >= since)
        )
        return int(result or 0)

    async def last_request_at(self, user_id: str) -> datetime | None:
        return await self.session.scalar(
            select(AiLog.created_at)
            .where(AiLog.user_id == user_id)
            .order_by(AiLog.created_at.desc())
            .limit(1)
        )


def utc_now() -> datetime:
    return datetime.now(tz=UTC).replace(tzinfo=None)
