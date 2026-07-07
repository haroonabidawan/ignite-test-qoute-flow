"""AI draft DTOs."""

from __future__ import annotations

from pydantic import BaseModel, Field


class AiDraftRequest(BaseModel):
    request: str = Field(
        min_length=1,
        max_length=4000,
        description="Free-text client brief",
    )
    locale: str = Field(
        default="en",
        pattern="^(en|ar)$",
        description="Response language for generated draft text",
    )


class AiSuggestedItem(BaseModel):
    title: str
    description: str = ""
    quantity: int = 1
    unit_price: float | None = None
    estimated_hours: float | None = None


class AiDraftResponse(BaseModel):
    project_type: str = ""
    suggested_items: list[AiSuggestedItem] = Field(default_factory=list)
    questions_to_ask_client: list[str] = Field(default_factory=list)
    summary: str = ""
    source: str = "ai"
