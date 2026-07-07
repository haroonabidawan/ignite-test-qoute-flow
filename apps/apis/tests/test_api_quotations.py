"""Quotation API integration tests."""

from __future__ import annotations

import pytest
from httpx import AsyncClient


async def _create_client(client: AsyncClient, headers: dict[str, str]) -> str:
    response = await client.post(
        "/clients",
        headers=headers,
        json={
            "name": "Client",
            "company": "Co",
            "email": "client@test.com",
            "phone": "",
            "notes": "",
        },
    )
    return response.json()["data"]["id"]


@pytest.mark.asyncio
async def test_quotation_crud_with_items(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    client_id = await _create_client(client, auth_headers)

    created = await client.post(
        "/quotations",
        headers=auth_headers,
        json={
            "client_id": client_id,
            "title": "Website redesign",
            "status": "Draft",
            "items": [
                {
                    "title": "Discovery",
                    "description": "Workshop",
                    "quantity": 1,
                    "unit_price": 500,
                    "estimated_hours": 8,
                }
            ],
        },
    )
    assert created.status_code == 201
    quotation_id = created.json()["data"]["id"]
    assert created.json()["data"]["total"] == 500.0

    updated = await client.put(
        f"/quotations/{quotation_id}",
        headers=auth_headers,
        json={
            "items": [
                {
                    "title": "Discovery",
                    "description": "Workshop",
                    "quantity": 2,
                    "unit_price": 500,
                    "estimated_hours": 8,
                }
            ]
        },
    )
    assert updated.status_code == 200
    assert updated.json()["data"]["total"] == 1000.0

    deleted = await client.delete(f"/quotations/{quotation_id}", headers=auth_headers)
    assert deleted.status_code == 200


@pytest.mark.asyncio
async def test_ai_draft_offline(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    response = await client.post(
        "/quotations/ai-draft",
        headers=auth_headers,
        json={"request": "Need a landing page with contact form", "locale": "en"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]["source"] == "offline"
    assert len(body["data"]["suggested_items"]) >= 1


@pytest.mark.asyncio
async def test_ai_usage_endpoint(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    await client.post(
        "/quotations/ai-draft",
        headers=auth_headers,
        json={"request": "Brief one", "locale": "en"},
    )
    usage = await client.get("/ai/usage", headers=auth_headers)
    assert usage.status_code == 200
    data = usage.json()["data"]
    assert data["hourly_used"] == 1
    assert data["hourly_limit"] == 3
    assert data["daily_remaining"] == 4


@pytest.mark.asyncio
async def test_approve_triggers_webhook(
    client: AsyncClient,
    auth_headers: dict[str, str],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    from app.services.n8n import N8nService

    webhook_calls: list[dict[str, object]] = []

    async def fake_notify(
        self: N8nService, payload: dict[str, object]
    ) -> tuple[bool, str]:
        webhook_calls.append(payload)
        return True, "delivered (200)"

    monkeypatch.setattr(N8nService, "notify_quotation_approved", fake_notify)

    client_id = await _create_client(client, auth_headers)
    created = await client.post(
        "/quotations",
        headers=auth_headers,
        json={
            "client_id": client_id,
            "title": "Approve me",
            "status": "Draft",
            "items": [
                {
                    "title": "Work",
                    "description": "",
                    "quantity": 1,
                    "unit_price": 100,
                    "estimated_hours": 2,
                }
            ],
        },
    )
    quotation_id = created.json()["data"]["id"]

    response = await client.post(
        f"/quotations/{quotation_id}/approve",
        headers=auth_headers,
    )
    assert response.status_code == 200
    body = response.json()["data"]
    assert body["quotation"]["status"] == "Approved"
    assert body["webhook_delivered"] is True
    assert len(webhook_calls) == 1
    payload = webhook_calls[0]
    assert payload["event"] == "quotation.approved"
    quotation_payload = payload["quotation"]
    assert isinstance(quotation_payload, dict)
    assert quotation_payload["title"] == "Approve me"


@pytest.mark.asyncio
async def test_approve_idempotent_skips_webhook(
    client: AsyncClient,
    auth_headers: dict[str, str],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    from app.services.n8n import N8nService

    call_count = 0

    async def fake_notify(
        self: N8nService, payload: dict[str, object]
    ) -> tuple[bool, str]:
        nonlocal call_count
        call_count += 1
        return True, "delivered (200)"

    monkeypatch.setattr(N8nService, "notify_quotation_approved", fake_notify)

    client_id = await _create_client(client, auth_headers)
    created = await client.post(
        "/quotations",
        headers=auth_headers,
        json={
            "client_id": client_id,
            "title": "Twice",
            "status": "Draft",
            "items": [],
        },
    )
    quotation_id = created.json()["data"]["id"]

    first = await client.post(
        f"/quotations/{quotation_id}/approve", headers=auth_headers
    )
    assert first.status_code == 200
    assert first.json()["data"]["webhook_delivered"] is True

    second = await client.post(
        f"/quotations/{quotation_id}/approve", headers=auth_headers
    )
    assert second.status_code == 200
    assert second.json()["data"]["webhook_delivered"] is False
    assert call_count == 1


@pytest.mark.asyncio
async def test_cannot_set_approved_via_update(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    client_id = await _create_client(client, auth_headers)
    created = await client.post(
        "/quotations",
        headers=auth_headers,
        json={
            "client_id": client_id,
            "title": "Guard",
            "status": "Draft",
            "items": [],
        },
    )
    quotation_id = created.json()["data"]["id"]

    response = await client.put(
        f"/quotations/{quotation_id}",
        headers=auth_headers,
        json={"status": "Approved"},
    )
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_ai_rate_limit_cooldown(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    first = await client.post(
        "/quotations/ai-draft",
        headers=auth_headers,
        json={"request": "First brief", "locale": "en"},
    )
    assert first.status_code == 200

    second = await client.post(
        "/quotations/ai-draft",
        headers=auth_headers,
        json={"request": "Second brief", "locale": "en"},
    )
    assert second.status_code == 429
    assert second.json()["data"]["code"] == "ai_rate_limited"
