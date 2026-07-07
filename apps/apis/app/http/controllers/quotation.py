"""Quotation controller - CRUD, AI draft, and approve handlers."""

from __future__ import annotations

from fastapi import Query

from app.helpers.response import success_response
from app.http.dtos.ai import AiDraftRequest
from app.http.dtos.quotation import (
    ApproveData,
    QuotationCreate,
    QuotationItemCreate,
    QuotationUpdate,
)
from app.http.dtos.response import ApiResponse, empty_data
from app.models.quotation import QuotationStatus
from app.services.quotation import QuotationService
from config.dependencies import CurrentUser, DBSession


class QuotationController:
    @staticmethod
    async def list(
        db: DBSession,
        _user: CurrentUser,
        page: int = Query(1, ge=1),
        page_size: int = Query(20, ge=1, le=100),
        search: str | None = Query(None, max_length=200),
        status: QuotationStatus | None = Query(None),
    ) -> ApiResponse:
        quotations = await QuotationService(db).list(
            page=page,
            page_size=page_size,
            search=search,
            status=status,
        )
        return success_response(quotations, "Quotations retrieved successfully")

    @staticmethod
    async def create(
        payload: QuotationCreate, db: DBSession, _user: CurrentUser
    ) -> ApiResponse:
        quotation = await QuotationService(db).create(payload)
        return success_response(quotation, "Quotation created successfully")

    @staticmethod
    async def ai_draft(
        payload: AiDraftRequest, db: DBSession, user: CurrentUser
    ) -> ApiResponse:
        draft = await QuotationService(db).generate_ai_draft(
            user.id, payload.request, payload.locale
        )
        return success_response(draft, "AI draft generated successfully")

    @staticmethod
    async def get(quotation_id: str, db: DBSession, _user: CurrentUser) -> ApiResponse:
        quotation = await QuotationService(db).get(quotation_id)
        return success_response(quotation, "Quotation retrieved successfully")

    @staticmethod
    async def update(
        quotation_id: str, payload: QuotationUpdate, db: DBSession, _user: CurrentUser
    ) -> ApiResponse:
        quotation = await QuotationService(db).update(quotation_id, payload)
        return success_response(quotation, "Quotation updated successfully")

    @staticmethod
    async def add_item(
        quotation_id: str,
        payload: QuotationItemCreate,
        db: DBSession,
        _user: CurrentUser,
    ) -> ApiResponse:
        item = await QuotationService(db).add_item(quotation_id, payload)
        return success_response(item, "Quotation item added successfully")

    @staticmethod
    async def delete(
        quotation_id: str, db: DBSession, _user: CurrentUser
    ) -> ApiResponse:
        await QuotationService(db).delete(quotation_id)
        return success_response(empty_data(), "Quotation deleted successfully")

    @staticmethod
    async def approve(
        quotation_id: str, db: DBSession, _user: CurrentUser
    ) -> ApiResponse:
        result = await QuotationService(db).approve(quotation_id)
        return success_response(
            ApproveData(
                quotation=result.quotation,
                webhook_delivered=result.webhook_delivered,
                webhook_detail=result.webhook_detail,
            ),
            result.message,
        )
