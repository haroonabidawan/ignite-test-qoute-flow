"""Shared pagination DTOs."""

from __future__ import annotations

import math
from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class PaginatedData(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int
    total_pages: int


def build_paginated_data(
    items: list[T],
    *,
    total: int,
    page: int,
    page_size: int,
) -> PaginatedData[T]:
    total_pages = math.ceil(total / page_size) if total > 0 else 0
    return PaginatedData(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


def pagination_bounds(page: int, page_size: int) -> tuple[int, int]:
    safe_page = max(page, 1)
    safe_size = max(min(page_size, 100), 1)
    offset = (safe_page - 1) * safe_size
    return offset, safe_size
