"""API route definitions (Laravel ``routes/api.php`` equivalent)."""

from __future__ import annotations

from fastapi import APIRouter, FastAPI, status

from app.helpers.response import success_response
from app.http.controllers.ai import AiController
from app.http.controllers.auth import AuthController
from app.http.controllers.client import ClientController
from app.http.controllers.quotation import QuotationController
from app.http.dtos.response import ApiResponse
from config.settings import get_settings

auth = APIRouter(prefix="/auth", tags=["auth"])
auth.post("/login", response_model=ApiResponse, summary="Login")(AuthController.login)
auth.post("/logout", response_model=ApiResponse, summary="Logout")(
    AuthController.logout
)
auth.get("/me", response_model=ApiResponse, summary="Current user")(AuthController.me)

ai = APIRouter(prefix="/ai", tags=["ai"])
ai.get("/usage", response_model=ApiResponse, summary="AI draft usage & limits")(
    AiController.usage
)

clients = APIRouter(prefix="/clients", tags=["clients"])
clients.get("", response_model=ApiResponse, summary="List clients")(
    ClientController.list
)
clients.post(
    "",
    response_model=ApiResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create client",
)(ClientController.create)
clients.get("/{client_id}", response_model=ApiResponse, summary="Get client")(
    ClientController.get
)
clients.put("/{client_id}", response_model=ApiResponse, summary="Update client")(
    ClientController.update
)
clients.delete(
    "/{client_id}",
    response_model=ApiResponse,
    summary="Delete client",
)(ClientController.delete)

quotations = APIRouter(prefix="/quotations", tags=["quotations"])
quotations.get("", response_model=ApiResponse, summary="List quotations")(
    QuotationController.list
)
quotations.post(
    "",
    response_model=ApiResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create quotation",
)(QuotationController.create)
quotations.post("/ai-draft", response_model=ApiResponse, summary="Generate AI draft")(
    QuotationController.ai_draft
)
quotations.get("/{quotation_id}", response_model=ApiResponse, summary="Get quotation")(
    QuotationController.get
)
quotations.put(
    "/{quotation_id}", response_model=ApiResponse, summary="Update quotation"
)(QuotationController.update)
quotations.post(
    "/{quotation_id}/items",
    response_model=ApiResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add quotation line item",
)(QuotationController.add_item)
quotations.delete(
    "/{quotation_id}",
    response_model=ApiResponse,
    summary="Delete quotation",
)(QuotationController.delete)
quotations.post(
    "/{quotation_id}/approve",
    response_model=ApiResponse,
    summary="Approve quotation (fires n8n webhook)",
)(QuotationController.approve)


def register_routes(app: FastAPI) -> None:
    """Mount all API routers on the application."""
    app.include_router(auth)
    app.include_router(ai)
    app.include_router(clients)
    app.include_router(quotations)

    @app.get("/", tags=["system"], summary="API root")
    async def root() -> ApiResponse:
        settings = get_settings()
        return success_response(
            {
                "name": settings.APP_NAME,
                "version": settings.APP_VERSION,
                "docs": "/docs",
                "redoc": "/redoc",
                "openapi": "/openapi.json",
                "health": "/health",
            },
            "QuoteFlow API",
        )

    @app.get("/config", tags=["system"], summary="Public application configuration")
    async def app_config() -> ApiResponse:
        settings = get_settings()
        return success_response(
            {
                "currency_code": settings.CURRENCY_CODE,
            },
            "Application configuration",
        )

    @app.get("/health", tags=["system"], include_in_schema=False)
    async def health() -> ApiResponse:
        settings = get_settings()
        return success_response(
            {"status": "ok", "version": settings.APP_VERSION},
            "Service is healthy",
        )
