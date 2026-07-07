"""Client API integration tests."""

from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_client_crud_flow(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    create = await client.post(
        "/clients",
        headers=auth_headers,
        json={
            "name": "Acme Corp",
            "company": "Acme",
            "email": "billing@acme.test",
            "phone": "+1 555 0100",
            "notes": "VIP",
        },
    )
    assert create.status_code == 201
    client_id = create.json()["data"]["id"]

    listed = await client.get("/clients", headers=auth_headers)
    assert listed.status_code == 200
    payload = listed.json()["data"]
    assert payload["total"] >= 1
    assert any(row["id"] == client_id for row in payload["items"])

    page_two = await client.get("/clients?page=1&page_size=1", headers=auth_headers)
    assert page_two.status_code == 200
    assert len(page_two.json()["data"]["items"]) == 1

    detail = await client.get(f"/clients/{client_id}", headers=auth_headers)
    assert detail.status_code == 200
    assert detail.json()["data"]["name"] == "Acme Corp"

    updated = await client.put(
        f"/clients/{client_id}",
        headers=auth_headers,
        json={
            "name": "Acme International",
            "company": "Acme",
            "email": "billing@acme.test",
            "phone": "+1 555 0100",
            "notes": "VIP",
        },
    )
    assert updated.status_code == 200
    assert updated.json()["data"]["name"] == "Acme International"

    deleted = await client.delete(f"/clients/{client_id}", headers=auth_headers)
    assert deleted.status_code == 200
    assert deleted.json()["success"] is True
