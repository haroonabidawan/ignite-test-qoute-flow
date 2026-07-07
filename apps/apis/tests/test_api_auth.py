"""Auth API integration tests."""

from __future__ import annotations

import pytest
from httpx import AsyncClient
from tests.conftest import TEST_EMAIL, TEST_PASSWORD


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient) -> None:
    response = await client.post(
        "/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]["access_token"]
    assert body["data"]["user"]["email"] == TEST_EMAIL
    assert "quoteflow_token" in response.cookies


@pytest.mark.asyncio
async def test_login_sets_cookie_session(client: AsyncClient) -> None:
    login = await client.post(
        "/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
    )
    assert login.status_code == 200

    me = await client.get("/auth/me")
    assert me.status_code == 200
    assert me.json()["data"]["email"] == TEST_EMAIL


@pytest.mark.asyncio
async def test_logout_clears_cookie_session(client: AsyncClient) -> None:
    await client.post(
        "/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
    )
    logout = await client.post("/auth/logout")
    assert logout.status_code == 200

    me = await client.get("/auth/me")
    assert me.status_code == 401


@pytest.mark.asyncio
async def test_login_invalid_credentials(client: AsyncClient) -> None:
    response = await client.post(
        "/auth/login",
        json={"email": TEST_EMAIL, "password": "wrong"},
    )
    assert response.status_code == 401
    body = response.json()
    assert body["success"] is False
    assert body["data"]["code"] == "invalid_credentials"


@pytest.mark.asyncio
async def test_login_rate_limit(
    client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    from config.settings import get_settings

    settings = get_settings()
    monkeypatch.setattr(settings, "LOGIN_MAX_ATTEMPTS", 2)
    monkeypatch.setattr(settings, "LOGIN_WINDOW_SECONDS", 300)

    for _ in range(2):
        response = await client.post(
            "/auth/login",
            json={"email": TEST_EMAIL, "password": "wrong"},
        )
        assert response.status_code == 401

    blocked = await client.post(
        "/auth/login",
        json={"email": TEST_EMAIL, "password": "wrong"},
    )
    assert blocked.status_code == 429
    assert blocked.json()["data"]["code"] == "login_rate_limited"


@pytest.mark.asyncio
async def test_me_requires_auth(client: AsyncClient) -> None:
    response = await client.get("/auth/me")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_me_returns_user(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    response = await client.get("/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["data"]["email"] == TEST_EMAIL
