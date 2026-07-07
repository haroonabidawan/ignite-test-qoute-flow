"""Quotation + line-item DTOs."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.quotation import QuotationStatus


class QuotationItemBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = ""
    quantity: int = Field(default=1, ge=0)
    unit_price: float | None = Field(default=None, ge=0)
    estimated_hours: float | None = Field(default=None, ge=0)


class QuotationItemCreate(QuotationItemBase):
    pass


class QuotationItemUpsert(QuotationItemBase):
    """Line item for create/update - optional id preserves existing rows."""

    id: str | None = None


class QuotationItemRead(QuotationItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    total: float = 0.0


class QuotationCreate(BaseModel):
    client_id: str
    title: str = Field(min_length=1, max_length=255)
    status: QuotationStatus = QuotationStatus.DRAFT
    items: list[QuotationItemCreate] = Field(default_factory=list)


class QuotationUpdate(BaseModel):
    client_id: str | None = None
    title: str | None = Field(default=None, max_length=255)
    status: QuotationStatus | None = None
    items: list[QuotationItemUpsert] | None = None


class QuotationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    client_id: str
    title: str
    status: QuotationStatus
    items: list[QuotationItemRead] = Field(default_factory=list)
    total: float = 0.0
    created_at: datetime


class ApproveData(BaseModel):
    quotation: QuotationRead
    webhook_delivered: bool
    webhook_detail: str


class ApproveResponse(ApproveData):
    """Internal service result - message is promoted to the API envelope."""

    message: str
