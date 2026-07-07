"""Audit trail of AI draft requests (optional, per Technical-Test)."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import new_id
from database.connection import Base


class AiLog(Base):
    __tablename__ = "ai_logs"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    user_id: Mapped[str | None] = mapped_column(String(32), index=True, nullable=True)
    request_text: Mapped[str] = mapped_column(Text)
    response_json: Mapped[str] = mapped_column(Text, default="")
    ok: Mapped[bool] = mapped_column(default=True)
    source: Mapped[str] = mapped_column(String(32), default="ai")
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now())
