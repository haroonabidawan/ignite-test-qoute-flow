"""Shared FastAPI dependencies (DB session + current user)."""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.user import UserRepository
from config.exceptions import UnauthorizedError
from config.security import decode_access_token
from config.settings import get_settings
from database.connection import get_db

DBSession = Annotated[AsyncSession, Depends(get_db)]

_bearer = HTTPBearer(auto_error=False)


def get_client_ip(request: Request) -> str:
    """Best-effort client IP for rate limiting (supports reverse proxies)."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "unknown"


async def get_current_user(
    db: DBSession,
    request: Request,
    credentials: Annotated[
        HTTPAuthorizationCredentials | None, Depends(_bearer)
    ] = None,
) -> User:
    """Resolve the authenticated user from cookie or Bearer token."""
    settings = get_settings()
    token = request.cookies.get(settings.AUTH_COOKIE_NAME)
    if not token and credentials is not None:
        token = credentials.credentials

    if not token:
        raise UnauthorizedError("Not authenticated")

    try:
        user_id = decode_access_token(token)
    except JWTError as exc:
        raise UnauthorizedError("Could not validate credentials") from exc

    user = await UserRepository(db).get(user_id)
    if user is None:
        raise UnauthorizedError("Could not validate credentials")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
