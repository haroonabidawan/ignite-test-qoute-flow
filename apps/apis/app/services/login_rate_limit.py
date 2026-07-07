"""Login brute-force protection."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.login_attempt import LoginAttemptRepository
from config.exceptions import LoginRateLimitError
from config.settings import get_settings


class LoginRateLimitService:
    def __init__(self, session: AsyncSession) -> None:
        self.attempts = LoginAttemptRepository(session)

    async def enforce(self, *, ip_address: str, email: str) -> None:
        settings = get_settings()
        since = datetime.now(tz=UTC).replace(tzinfo=None) - timedelta(
            seconds=settings.LOGIN_WINDOW_SECONDS
        )
        ip_failed, email_failed = await self.attempts.count_failed_since(
            ip_address=ip_address,
            email=email.lower().strip(),
            since=since,
        )
        if (
            ip_failed >= settings.LOGIN_MAX_ATTEMPTS
            or email_failed >= settings.LOGIN_MAX_ATTEMPTS
        ):
            raise LoginRateLimitError(
                "Too many login attempts. Please try again later.",
                retry_after_seconds=settings.LOGIN_LOCKOUT_SECONDS,
            )

    async def record_failure(self, *, ip_address: str, email: str) -> None:
        await self.attempts.record(
            ip_address=ip_address,
            email=email,
            succeeded=False,
        )

    async def record_success(self, *, ip_address: str, email: str) -> None:
        await self.attempts.record(
            ip_address=ip_address,
            email=email,
            succeeded=True,
        )
