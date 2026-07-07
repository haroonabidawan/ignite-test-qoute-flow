"""Standard API response envelope."""

from __future__ import annotations

from typing import Any, Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    """Uniform success/error body: ``{ success, message, data }``."""

    success: bool
    message: str
    data: T


class EmptyData(BaseModel):
    """Explicit empty payload for delete and similar operations."""

    model_config = {"extra": "forbid"}


def empty_data() -> dict[str, Any]:
    return {}
