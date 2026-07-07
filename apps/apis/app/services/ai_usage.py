"""AI usage limits and monitoring - protects provider spend."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.ai_log import AiLogRepository, utc_now
from config.exceptions import AiRateLimitError
from config.settings import Settings, get_settings


@dataclass(frozen=True)
class AiUsageSnapshot:
    user_id: str
    hourly_used: int
    hourly_limit: int
    daily_used: int
    daily_limit: int
    global_daily_used: int
    global_daily_limit: int
    cooldown_seconds: int
    seconds_until_next_request: int
    max_request_chars: int

    @property
    def hourly_remaining(self) -> int:
        return max(0, self.hourly_limit - self.hourly_used)

    @property
    def daily_remaining(self) -> int:
        return max(0, self.daily_limit - self.daily_used)


class AiUsageService:
    def __init__(self, session: AsyncSession, settings: Settings | None = None) -> None:
        self.session = session
        self.settings = settings or get_settings()
        self.logs = AiLogRepository(session)

    async def snapshot(self, user_id: str) -> AiUsageSnapshot:
        now = utc_now()
        hourly_since = now - timedelta(hours=1)
        daily_since = now - timedelta(days=1)

        hourly_used = await self.logs.count_user_since(user_id, hourly_since)
        daily_used = await self.logs.count_user_since(user_id, daily_since)
        global_daily_used = await self.logs.count_global_since(daily_since)
        last_at = await self.logs.last_request_at(user_id)

        seconds_until_next = 0
        if last_at is not None:
            elapsed = (now - last_at).total_seconds()
            remaining = self.settings.AI_COOLDOWN_SECONDS - elapsed
            if remaining > 0:
                seconds_until_next = int(remaining) + 1

        return AiUsageSnapshot(
            user_id=user_id,
            hourly_used=hourly_used,
            hourly_limit=self.settings.AI_USER_HOURLY_LIMIT,
            daily_used=daily_used,
            daily_limit=self.settings.AI_USER_DAILY_LIMIT,
            global_daily_used=global_daily_used,
            global_daily_limit=self.settings.AI_GLOBAL_DAILY_LIMIT,
            cooldown_seconds=self.settings.AI_COOLDOWN_SECONDS,
            seconds_until_next_request=seconds_until_next,
            max_request_chars=self.settings.AI_MAX_REQUEST_CHARS,
        )

    async def enforce(self, user_id: str, request_text: str) -> AiUsageSnapshot:
        """Raise ``AiRateLimitError`` when limits would be exceeded."""
        if len(request_text) > self.settings.AI_MAX_REQUEST_CHARS:
            raise AiRateLimitError(
                "Request is too long "
                f"(max {self.settings.AI_MAX_REQUEST_CHARS} characters)."
            )

        usage = await self.snapshot(user_id)

        if usage.seconds_until_next_request > 0:
            raise AiRateLimitError(
                f"Please wait {usage.seconds_until_next_request}s "
                "before another AI draft."
            )

        if usage.hourly_used >= usage.hourly_limit:
            raise AiRateLimitError(
                f"Hourly AI limit reached ({usage.hourly_limit} requests per hour)."
            )

        if usage.daily_used >= usage.daily_limit:
            raise AiRateLimitError(
                f"Daily AI limit reached ({usage.daily_limit} requests per day)."
            )

        if (
            usage.global_daily_limit > 0
            and usage.global_daily_used >= usage.global_daily_limit
        ):
            raise AiRateLimitError("Global daily AI limit reached. Try again tomorrow.")

        return usage
