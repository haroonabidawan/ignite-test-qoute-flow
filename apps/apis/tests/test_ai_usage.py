"""Tests for AI usage limits."""

from __future__ import annotations

from datetime import timedelta

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

import app.models  # noqa: F401
from app.models.ai_log import AiLog
from app.repositories.ai_log import utc_now
from app.services.ai_usage import AiUsageService
from config.exceptions import AiRateLimitError
from config.settings import Settings
from database.connection import Base


@pytest.fixture
async def usage_session():
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    factory = async_sessionmaker(
        bind=engine, class_=AsyncSession, expire_on_commit=False
    )
    async with factory() as session:
        yield session

    await engine.dispose()


@pytest.fixture
def test_settings() -> Settings:
    return Settings(
        APP_NAME="t",
        APP_VERSION="0",
        ENVIRONMENT="test",
        DEBUG=False,
        DATABASE_URL="sqlite+aiosqlite:///:memory:",
        SECRET_KEY="x" * 32,
        JWT_ALGORITHM="HS256",
        ACCESS_TOKEN_EXPIRE_MINUTES=60,
        ALLOWED_ORIGINS="http://localhost",
        CURRENCY_CODE="USD",
        AI_API_KEY="",
        AI_BASE_URL="https://example.com",
        AI_MODEL="m",
        AI_TIMEOUT_SECONDS=30,
        AI_MAX_REQUEST_CHARS=100,
        AI_COOLDOWN_SECONDS=60,
        AI_USER_HOURLY_LIMIT=2,
        AI_USER_DAILY_LIMIT=3,
        AI_GLOBAL_DAILY_LIMIT=0,
        N8N_WEBHOOK_URL="",
        N8N_TIMEOUT_SECONDS=10,
    )


@pytest.mark.asyncio
async def test_enforce_rejects_long_request(
    usage_session: AsyncSession, test_settings: Settings
) -> None:
    service = AiUsageService(usage_session, settings=test_settings)
    with pytest.raises(AiRateLimitError, match="too long"):
        await service.enforce("user-1", "x" * 101)


@pytest.mark.asyncio
async def test_enforce_hourly_limit(
    usage_session: AsyncSession, test_settings: Settings
) -> None:
    service = AiUsageService(usage_session, settings=test_settings)
    old = utc_now() - timedelta(seconds=test_settings.AI_COOLDOWN_SECONDS + 5)

    for _ in range(test_settings.AI_USER_HOURLY_LIMIT):
        usage_session.add(AiLog(user_id="user-1", request_text="brief", created_at=old))
    await usage_session.flush()

    with pytest.raises(AiRateLimitError, match="Hourly"):
        await service.enforce("user-1", "new request")


@pytest.mark.asyncio
async def test_enforce_cooldown(
    usage_session: AsyncSession, test_settings: Settings
) -> None:
    service = AiUsageService(usage_session, settings=test_settings)
    usage_session.add(
        AiLog(user_id="user-1", request_text="recent", created_at=utc_now())
    )
    await usage_session.flush()

    with pytest.raises(AiRateLimitError, match="Please wait"):
        await service.enforce("user-1", "another")


@pytest.mark.asyncio
async def test_snapshot_remaining(
    usage_session: AsyncSession, test_settings: Settings
) -> None:
    service = AiUsageService(usage_session, settings=test_settings)
    old = utc_now() - timedelta(hours=2)
    usage_session.add(AiLog(user_id="user-1", request_text="old", created_at=old))
    usage_session.add(AiLog(user_id="user-1", request_text="new", created_at=utc_now()))
    await usage_session.flush()

    snapshot = await service.snapshot("user-1")
    assert snapshot.hourly_used == 1
    assert snapshot.hourly_remaining == test_settings.AI_USER_HOURLY_LIMIT - 1
    assert snapshot.daily_used == 2
