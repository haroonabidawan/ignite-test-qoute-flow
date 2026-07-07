"""Client controller - CRUD HTTP handlers."""

from __future__ import annotations

from fastapi import Query

from app.helpers.response import success_response
from app.http.dtos.client import ClientCreate, ClientRead, ClientUpdate
from app.http.dtos.response import ApiResponse, empty_data
from app.services.client import ClientService
from config.dependencies import CurrentUser, DBSession


class ClientController:
    @staticmethod
    async def list(
        db: DBSession,
        _user: CurrentUser,
        page: int = Query(1, ge=1),
        page_size: int = Query(20, ge=1, le=100),
        search: str | None = Query(None, max_length=200),
    ) -> ApiResponse:
        result = await ClientService(db).list(
            page=page,
            page_size=page_size,
            search=search,
        )
        return success_response(result, "Clients retrieved successfully")

    @staticmethod
    async def create(
        payload: ClientCreate, db: DBSession, _user: CurrentUser
    ) -> ApiResponse:
        client = await ClientService(db).create(payload)
        return success_response(
            ClientRead.model_validate(client),
            "Client created successfully",
        )

    @staticmethod
    async def get(client_id: str, db: DBSession, _user: CurrentUser) -> ApiResponse:
        client = await ClientService(db).get(client_id)
        return success_response(
            ClientRead.model_validate(client),
            "Client retrieved successfully",
        )

    @staticmethod
    async def update(
        client_id: str, payload: ClientUpdate, db: DBSession, _user: CurrentUser
    ) -> ApiResponse:
        client = await ClientService(db).update(client_id, payload)
        return success_response(
            ClientRead.model_validate(client),
            "Client updated successfully",
        )

    @staticmethod
    async def delete(client_id: str, db: DBSession, _user: CurrentUser) -> ApiResponse:
        await ClientService(db).delete(client_id)
        return success_response(empty_data(), "Client deleted successfully")
