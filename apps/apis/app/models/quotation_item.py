"""Quotation line-item entity."""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import new_id
from database.connection import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.quotation import Quotation


class QuotationItem(Base, TimestampMixin):
    __tablename__ = "quotation_items"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    quotation_id: Mapped[str] = mapped_column(
        ForeignKey("quotations.id", ondelete="CASCADE"), index=True
    )
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    unit_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    estimated_hours: Mapped[float | None] = mapped_column(Float, nullable=True)

    quotation: Mapped[Quotation] = relationship(back_populates="items")
