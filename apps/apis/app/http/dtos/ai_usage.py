"""AI usage monitoring DTOs."""

from __future__ import annotations

from pydantic import BaseModel


class AiUsageRead(BaseModel):
    hourly_used: int
    hourly_limit: int
    hourly_remaining: int
    daily_used: int
    daily_limit: int
    daily_remaining: int
    global_daily_used: int
    global_daily_limit: int
    cooldown_seconds: int
    seconds_until_next_request: int
    max_request_chars: int
