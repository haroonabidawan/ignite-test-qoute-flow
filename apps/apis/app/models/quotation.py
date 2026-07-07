"""Quotation model + status enum."""

from __future__ import annotations

import enum
from typing import TYPE_CHECKING

from sqlalchemy import Enum as SAEnum
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import new_id
from database.connection import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.client import Client
    from app.models.quotation_item import QuotationItem


class QuotationStatus(str, enum.Enum):
    DRAFT = "Draft"
    SENT = "Sent"
    APPROVED = "Approved"
    REJECTED = "Rejected"


class Quotation(Base, TimestampMixin):
    __tablename__ = "quotations"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    client_id: Mapped[str] = mapped_column(
        ForeignKey("clients.id", ondelete="CASCADE"), index=True
    )
    title: Mapped[str] = mapped_column(String(255))
    status: Mapped[QuotationStatus] = mapped_column(
        SAEnum(
            QuotationStatus,
            values_callable=lambda enum: [member.value for member in enum],
        ),
        default=QuotationStatus.DRAFT,
    )

    client: Mapped[Client] = relationship(back_populates="quotations")
    items: Mapped[list[QuotationItem]] = relationship(
        back_populates="quotation",
        cascade="all, delete-orphan",
        order_by="QuotationItem.created_at",
    )
