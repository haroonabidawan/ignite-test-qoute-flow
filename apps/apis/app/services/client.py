"""Client business logic."""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.http.dtos.client import ClientCreate, ClientRead, ClientUpdate
from app.http.dtos.pagination import build_paginated_data, pagination_bounds
from app.models.client import Client
from app.repositories.client import ClientRepository
from config.exceptions import NotFoundError


class ClientService:
    def __init__(self, session: AsyncSession) -> None:
        self.clients = ClientRepository(session)

    async def list(
        self,
        *,
        page: int = 1,
        page_size: int = 20,
        search: str | None = None,
    ):
        offset, limit = pagination_bounds(page, page_size)
        total = await self.clients.count(search=search)
        rows = await self.clients.list(offset=offset, limit=limit, search=search)
        return build_paginated_data(
            [ClientRead.model_validate(client) for client in rows],
            total=total,
            page=max(page, 1),
            page_size=limit,
        )

    async def get(self, client_id: str) -> Client:
        client = await self.clients.get(client_id)
        if client is None:
            raise NotFoundError(f"Client {client_id} not found")
        return client

    async def create(self, payload: ClientCreate) -> Client:
        client = Client(**payload.model_dump())
        self.clients.add(client)
        await self.clients.flush()
        return client

    async def update(self, client_id: str, payload: ClientUpdate) -> Client:
        client = await self.get(client_id)
        for field, value in payload.model_dump().items():
            setattr(client, field, value)
        await self.clients.flush()
        return client

    async def delete(self, client_id: str) -> None:
        client = await self.get(client_id)
        await self.clients.delete(client)
