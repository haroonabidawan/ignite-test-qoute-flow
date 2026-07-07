"""Helpers for building the standard API response envelope."""

from __future__ import annotations

from typing import Any

from fastapi import status
from fastapi.responses import JSONResponse

from app.http.dtos.response import ApiResponse


def success_response(
    data: Any,
    message: str,
    *,
    status_code: int = status.HTTP_200_OK,
) -> ApiResponse[Any]:
    return ApiResponse(success=True, message=message, data=data)


def error_response(
    message: str,
    *,
    status_code: int = status.HTTP_400_BAD_REQUEST,
    data: Any | None = None,
    headers: dict[str, str] | None = None,
) -> JSONResponse:
    body = ApiResponse(
        success=False,
        message=message,
        data=data if data is not None else {},
    )
    return JSONResponse(
        status_code=status_code,
        content=body.model_dump(mode="json"),
        headers=headers,
    )
