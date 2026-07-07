"""Login attempt data access."""

from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import func, select

from app.models.login_attempt import LoginAttempt
from app.repositories.base import BaseRepository


class LoginAttemptRepository(BaseRepository[LoginAttempt]):
    model = LoginAttempt

    async def count_failed_since(
        self,
        *,
        ip_address: str,
        email: str,
        since: datetime,
    ) -> tuple[int, int]:
        """Return failed attempt counts for the IP and email since ``since``."""
        ip_count = await self.session.scalar(
            select(func.count())
            .select_from(LoginAttempt)
            .where(
                LoginAttempt.ip_address == ip_address,
                LoginAttempt.succeeded.is_(False),
                LoginAttempt.created_at >= since,
            )
        )
        email_count = await self.session.scalar(
            select(func.count())
            .select_from(LoginAttempt)
            .where(
                LoginAttempt.email == email,
                LoginAttempt.succeeded.is_(False),
                LoginAttempt.created_at >= since,
            )
        )
        return int(ip_count or 0), int(email_count or 0)

    async def record(
        self,
        *,
        ip_address: str,
        email: str,
        succeeded: bool,
    ) -> None:
        attempt = LoginAttempt(
            ip_address=ip_address,
            email=email.lower().strip(),
            succeeded=succeeded,
            created_at=datetime.now(tz=UTC).replace(tzinfo=None),
        )
        self.add(attempt)
        await self.flush()
