"""Pytest bootstrap - set test env before application imports."""

from __future__ import annotations

import os

os.environ.update(
    {
        "ENVIRONMENT": "test",
        "APP_NAME": "QuoteFlow Test",
        "APP_VERSION": "0.0.0",
        "DEBUG": "false",
        "DATABASE_URL": "sqlite+aiosqlite:///:memory:",
        "SECRET_KEY": "test_secret_key_minimum_32_characters_long",
        "JWT_ALGORITHM": "HS256",
        "ACCESS_TOKEN_EXPIRE_MINUTES": "60",
        "ALLOWED_ORIGINS": "http://localhost:3000",
        "CURRENCY_CODE": "USD",
        "AI_API_KEY": "",
        "AI_BASE_URL": "https://api.example.com/v1",
        "AI_MODEL": "test-model",
        "AI_TIMEOUT_SECONDS": "30",
        "AI_MAX_REQUEST_CHARS": "4000",
        "AI_COOLDOWN_SECONDS": "2",
        "AI_USER_HOURLY_LIMIT": "3",
        "AI_USER_DAILY_LIMIT": "5",
        "AI_GLOBAL_DAILY_LIMIT": "0",
        "N8N_WEBHOOK_URL": "",
        "N8N_TIMEOUT_SECONDS": "10",
        "AUTH_COOKIE_NAME": "quoteflow_token",
        "AUTH_COOKIE_SECURE": "false",
        "AUTH_COOKIE_SAMESITE": "lax",
        "AUTH_COOKIE_DOMAIN": "",
        "LOGIN_MAX_ATTEMPTS": "10",
        "LOGIN_WINDOW_SECONDS": "300",
        "LOGIN_LOCKOUT_SECONDS": "900",
    }
)

import importlib

from config.settings import get_settings

get_settings.cache_clear()
import database.connection as db_connection

importlib.reload(db_connection)

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

import app.models  # noqa: F401 - register ORM mappers
from app.models.user import User
from bootstrap.app import create_app
from config.security import hash_password
from database.connection import Base, get_db

TEST_PASSWORD = "password123"
TEST_EMAIL = "test@example.com"


@pytest.fixture
async def engine():
    test_engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
    )
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield test_engine
    await test_engine.dispose()


@pytest.fixture
async def session_factory(engine):
    return async_sessionmaker(
        bind=engine, class_=AsyncSession, expire_on_commit=False, autoflush=False
    )


@pytest.fixture
async def seeded_user(session_factory) -> User:
    async with session_factory() as session:
        user = User(
            email=TEST_EMAIL,
            name="Test User",
            password_hash=hash_password(TEST_PASSWORD),
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user


@pytest.fixture
async def client(session_factory, seeded_user):
    async def override_get_db():
        async with session_factory() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise

    app = create_app()
    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
async def auth_headers(client: AsyncClient) -> dict[str, str]:
    response = await client.post(
        "/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
    )
    assert response.status_code == 200
    token = response.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}
