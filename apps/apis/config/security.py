"""Password hashing, JWT helpers, and auth cookie utilities."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

from fastapi import Response
from jose import JWTError, jwt
from passlib.context import CryptContext

from config.settings import get_settings

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    """Return a bcrypt hash of the plain password."""
    return _pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Return True if the plain password matches the stored hash."""
    return _pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: str) -> str:
    """Return a signed JWT access token for the given subject (user id)."""
    settings = get_settings()
    now = datetime.now(tz=UTC)
    payload = {
        "sub": subject,
        "iat": now,
        "exp": now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        "type": "access",
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> str:
    """Decode a JWT and return its subject. Raises JWTError if invalid/expired."""
    settings = get_settings()
    payload = jwt.decode(
        token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
    )
    if payload.get("type") != "access":
        raise JWTError("Access token required")
    subject = payload.get("sub")
    if not isinstance(subject, str) or not subject:
        raise JWTError("Invalid token subject")
    return subject


def set_auth_cookie(response: Response, token: str) -> None:
    """Attach the JWT as an httpOnly session cookie."""
    settings = get_settings()
    response.set_cookie(
        key=settings.AUTH_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite=settings.AUTH_COOKIE_SAMESITE,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
        domain=settings.AUTH_COOKIE_DOMAIN or None,
    )


def clear_auth_cookie(response: Response) -> None:
    """Remove the auth session cookie."""
    settings = get_settings()
    response.delete_cookie(
        key=settings.AUTH_COOKIE_NAME,
        path="/",
        domain=settings.AUTH_COOKIE_DOMAIN or None,
    )
