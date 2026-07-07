"""Quotation helpers - ORM serialization and computed totals."""

from __future__ import annotations

from app.http.dtos.quotation import (
    QuotationItemCreate,
    QuotationItemRead,
    QuotationItemUpsert,
    QuotationRead,
)
from app.models.base import new_id
from app.models.client import Client
from app.models.quotation import Quotation
from app.models.quotation_item import QuotationItem


def item_total(item: QuotationItem) -> float:
    """Line total = quantity * unit_price (0 when price is unknown)."""
    price = float(item.unit_price) if item.unit_price is not None else 0.0
    return round(item.quantity * price, 2)


def new_item_from_create(
    payload: QuotationItemCreate, *, quotation_id: str
) -> QuotationItem:
    return QuotationItem(
        quotation_id=quotation_id,
        title=payload.title,
        description=payload.description,
        quantity=payload.quantity,
        unit_price=payload.unit_price,
        estimated_hours=payload.estimated_hours,
    )


def item_from_upsert(
    payload: QuotationItemUpsert, *, quotation_id: str
) -> QuotationItem:
    return QuotationItem(
        id=payload.id or new_id(),
        quotation_id=quotation_id,
        title=payload.title,
        description=payload.description,
        quantity=payload.quantity,
        unit_price=payload.unit_price,
        estimated_hours=payload.estimated_hours,
    )


def serialize_item(item: QuotationItem) -> QuotationItemRead:
    return QuotationItemRead(
        id=item.id,
        title=item.title,
        description=item.description,
        quantity=item.quantity,
        unit_price=item.unit_price,
        estimated_hours=item.estimated_hours,
        total=item_total(item),
    )


def serialize_quotation(quotation: Quotation) -> QuotationRead:
    items = [serialize_item(item) for item in quotation.items]
    return QuotationRead(
        id=quotation.id,
        client_id=quotation.client_id,
        title=quotation.title,
        status=quotation.status,
        items=items,
        total=round(sum(i.total for i in items), 2),
        created_at=quotation.created_at,
    )


def build_approval_webhook_payload(
    quotation: Quotation,
    *,
    client: Client,
    currency_code: str,
) -> dict[str, object]:
    """Rich payload for n8n - quotation, client snapshot, and currency."""
    read = serialize_quotation(quotation)
    return {
        "event": "quotation.approved",
        "currency_code": currency_code,
        "quotation": read.model_dump(mode="json"),
        "client": {
            "id": client.id,
            "name": client.name,
            "company": client.company,
            "email": client.email,
            "phone": client.phone,
        },
    }
