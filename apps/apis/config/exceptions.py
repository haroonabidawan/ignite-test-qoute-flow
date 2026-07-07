"""Typed application errors + FastAPI exception handlers."""

from __future__ import annotations

import logging

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.helpers.response import error_response

logger = logging.getLogger("quoteflow")


class AppError(Exception):
    """Base class for expected, client-facing errors."""

    status_code: int = status.HTTP_400_BAD_REQUEST
    code: str = "app_error"

    def __init__(
        self,
        message: str,
        *,
        code: str | None = None,
        status_code: int | None = None,
    ) -> None:
        self.message = message
        if code is not None:
            self.code = code
        if status_code is not None:
            self.status_code = status_code
        super().__init__(message)


class NotFoundError(AppError):
    status_code = status.HTTP_404_NOT_FOUND
    code = "not_found"


class UnauthorizedError(AppError):
    status_code = status.HTTP_401_UNAUTHORIZED
    code = "unauthorized"


class ConflictError(AppError):
    status_code = status.HTTP_409_CONFLICT
    code = "conflict"


class AiDraftError(AppError):
    """The AI provider failed or returned an invalid response."""

    status_code = status.HTTP_502_BAD_GATEWAY
    code = "ai_draft_failed"


class AiRateLimitError(AppError):
    """AI draft rate limit exceeded - protects provider spend."""

    status_code = status.HTTP_429_TOO_MANY_REQUESTS
    code = "ai_rate_limited"


class LoginRateLimitError(AppError):
    """Login brute-force protection triggered."""

    status_code = status.HTTP_429_TOO_MANY_REQUESTS
    code = "login_rate_limited"

    def __init__(
        self,
        message: str,
        *,
        retry_after_seconds: int | None = None,
    ) -> None:
        self.retry_after_seconds = retry_after_seconds
        super().__init__(message, code="login_rate_limited")


def _validation_message(errors: list[dict[str, object]]) -> str:
    parts: list[str] = []
    for entry in errors:
        loc = entry.get("loc", ())
        field = ".".join(str(part) for part in loc if part != "body")
        msg = entry.get("msg", "Invalid value")
        parts.append(f"{field}: {msg}" if field else str(msg))
    return "; ".join(parts) if parts else "Validation failed."


def register_exception_handlers(app: FastAPI) -> None:
    """Attach JSON handlers using the standard ``{ success, message, data }`` shape."""

    @app.exception_handler(AppError)
    async def _app_error(_request: Request, exc: AppError) -> JSONResponse:
        headers: dict[str, str] | None = None
        if exc.status_code == status.HTTP_401_UNAUTHORIZED:
            headers = {"WWW-Authenticate": "Bearer"}
        if isinstance(exc, LoginRateLimitError) and exc.retry_after_seconds:
            headers = {**(headers or {}), "Retry-After": str(exc.retry_after_seconds)}
        return error_response(
            exc.message,
            status_code=exc.status_code,
            data={"code": exc.code},
            headers=headers,
        )

    @app.exception_handler(RequestValidationError)
    async def _validation_error(
        _request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        errors = exc.errors()
        return error_response(
            _validation_message(errors),
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            data={"code": "validation_error", "errors": errors},
        )

    @app.exception_handler(StarletteHTTPException)
    async def _http_error(
        _request: Request, exc: StarletteHTTPException
    ) -> JSONResponse:
        detail = exc.detail
        message = detail if isinstance(detail, str) else "Request failed."
        return error_response(
            message,
            status_code=exc.status_code,
            data={"code": "http_error"},
        )

    @app.exception_handler(Exception)
    async def _unhandled(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled error on %s %s", request.method, request.url.path)
        return error_response(
            "An unexpected server error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            data={"code": "internal_server_error"},
        )
