"""Quotation business logic: CRUD, items, AI draft, and approval."""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.helpers.quotation import (
    build_approval_webhook_payload,
    item_from_upsert,
    new_item_from_create,
    serialize_item,
    serialize_quotation,
)
from app.http.dtos.ai import AiDraftResponse
from app.http.dtos.pagination import build_paginated_data, pagination_bounds
from app.http.dtos.quotation import (
    ApproveResponse,
    QuotationCreate,
    QuotationItemCreate,
    QuotationItemRead,
    QuotationRead,
    QuotationUpdate,
)
from app.models.ai_log import AiLog
from app.models.quotation import Quotation, QuotationStatus
from app.repositories.client import ClientRepository
from app.repositories.quotation import QuotationRepository
from app.services.ai import AiService
from app.services.ai_usage import AiUsageService
from app.services.n8n import N8nService
from config.exceptions import ConflictError, NotFoundError
from config.settings import get_settings


class QuotationService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.quotations = QuotationRepository(session)
        self.clients = ClientRepository(session)
        self.ai = AiService()
        self.n8n = N8nService()

    async def _get_entity(self, quotation_id: str) -> Quotation:
        quotation = await self.quotations.get(quotation_id)
        if quotation is None:
            raise NotFoundError(f"Quotation {quotation_id} not found")
        return quotation

    async def _ensure_client(self, client_id: str) -> None:
        if not await self.clients.exists(client_id):
            raise NotFoundError(f"Client {client_id} not found")

    async def list(
        self,
        *,
        page: int = 1,
        page_size: int = 20,
        search: str | None = None,
        status: QuotationStatus | None = None,
    ):
        offset, limit = pagination_bounds(page, page_size)
        total = await self.quotations.count(search=search, status=status)
        rows = await self.quotations.list(
            offset=offset,
            limit=limit,
            search=search,
            status=status,
        )
        return build_paginated_data(
            [serialize_quotation(q) for q in rows],
            total=total,
            page=max(page, 1),
            page_size=limit,
        )

    async def get(self, quotation_id: str) -> QuotationRead:
        return serialize_quotation(await self._get_entity(quotation_id))

    async def create(self, payload: QuotationCreate) -> QuotationRead:
        await self._ensure_client(payload.client_id)
        if payload.status == QuotationStatus.APPROVED:
            raise ConflictError(
                "Use POST /quotations/{id}/approve to approve a quotation "
                "and trigger notifications."
            )
        quotation = Quotation(
            client_id=payload.client_id,
            title=payload.title,
            status=payload.status,
        )
        self.quotations.add(quotation)
        await self.quotations.flush()
        for item_payload in payload.items:
            self.session.add(
                new_item_from_create(item_payload, quotation_id=quotation.id)
            )
        await self.quotations.flush()
        return serialize_quotation(await self._get_entity(quotation.id))

    async def update(
        self, quotation_id: str, payload: QuotationUpdate
    ) -> QuotationRead:
        quotation = await self._get_entity(quotation_id)
        if payload.client_id is not None:
            await self._ensure_client(payload.client_id)
            quotation.client_id = payload.client_id
        if payload.title is not None:
            quotation.title = payload.title
        if payload.status is not None:
            if payload.status == QuotationStatus.APPROVED:
                raise ConflictError(
                    "Use POST /quotations/{id}/approve to approve a quotation "
                    "and trigger notifications."
                )
            quotation.status = payload.status
        if payload.items is not None:
            quotation.items.clear()
            await self.quotations.flush()
            for item_payload in payload.items:
                quotation.items.append(
                    item_from_upsert(item_payload, quotation_id=quotation.id)
                )
        await self.quotations.flush()
        return serialize_quotation(await self._get_entity(quotation.id))

    async def delete(self, quotation_id: str) -> None:
        await self.quotations.delete(await self._get_entity(quotation_id))

    async def add_item(
        self, quotation_id: str, payload: QuotationItemCreate
    ) -> QuotationItemRead:
        quotation = await self._get_entity(quotation_id)
        item = new_item_from_create(payload, quotation_id=quotation.id)
        self.session.add(item)
        await self.quotations.flush()
        return serialize_item(item)

    async def approve(self, quotation_id: str) -> ApproveResponse:
        quotation = await self._get_entity(quotation_id)
        if quotation.status == QuotationStatus.APPROVED:
            read = serialize_quotation(quotation)
            return ApproveResponse(
                quotation=read,
                message="Quotation is already approved.",
                webhook_delivered=False,
                webhook_detail="skipped (already approved)",
            )
        quotation.status = QuotationStatus.APPROVED
        await self.quotations.flush()

        read = serialize_quotation(quotation)
        client = await self.clients.get(quotation.client_id)
        webhook_payload = build_approval_webhook_payload(
            quotation,
            client=client,
            currency_code=get_settings().CURRENCY_CODE,
        )
        delivered, detail = await self.n8n.notify_quotation_approved(webhook_payload)
        if delivered:
            message = f"Quotation approved. Webhook {detail}."
        elif detail == "N8N_WEBHOOK_URL not configured":
            message = "Quotation approved. Notification webhook is not configured."
        else:
            message = f"Quotation approved. Webhook failed: {detail}."
        return ApproveResponse(
            quotation=read,
            message=message,
            webhook_delivered=delivered,
            webhook_detail=detail,
        )

    async def generate_ai_draft(
        self, user_id: str, request_text: str, locale: str = "en"
    ) -> AiDraftResponse:
        """Generate a draft after usage checks; persist an audit log."""
        await AiUsageService(self.session).enforce(user_id, request_text)
        try:
            draft = await self.ai.generate_draft(request_text, locale)
        except Exception:
            self.session.add(
                AiLog(user_id=user_id, request_text=request_text, ok=False)
            )
            await self.session.commit()
            raise
        self.session.add(
            AiLog(
                user_id=user_id,
                request_text=request_text,
                response_json=draft.model_dump_json(),
                ok=True,
                source=draft.source,
            )
        )
        return draft
