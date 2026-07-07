"""AI usage monitoring endpoints."""

from __future__ import annotations

from app.helpers.response import success_response
from app.http.dtos.ai_usage import AiUsageRead
from app.http.dtos.response import ApiResponse
from app.services.ai_usage import AiUsageService
from config.dependencies import CurrentUser, DBSession


class AiController:
    @staticmethod
    async def usage(db: DBSession, user: CurrentUser) -> ApiResponse:
        snapshot = await AiUsageService(db).snapshot(user.id)
        return success_response(
            AiUsageRead(
                hourly_used=snapshot.hourly_used,
                hourly_limit=snapshot.hourly_limit,
                hourly_remaining=snapshot.hourly_remaining,
                daily_used=snapshot.daily_used,
                daily_limit=snapshot.daily_limit,
                daily_remaining=snapshot.daily_remaining,
                global_daily_used=snapshot.global_daily_used,
                global_daily_limit=snapshot.global_daily_limit,
                cooldown_seconds=snapshot.cooldown_seconds,
                seconds_until_next_request=snapshot.seconds_until_next_request,
                max_request_chars=snapshot.max_request_chars,
            ),
            "AI usage retrieved successfully",
        )
