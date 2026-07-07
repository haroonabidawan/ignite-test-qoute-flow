"""Authentication business logic."""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.http.dtos.auth import AuthResponse, UserRead
from app.repositories.user import UserRepository
from app.services.login_rate_limit import LoginRateLimitService
from config.exceptions import UnauthorizedError
from config.security import create_access_token, verify_password


class AuthService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.users = UserRepository(session)
        self.rate_limit = LoginRateLimitService(session)

    async def login(
        self,
        email: str,
        password: str,
        *,
        ip_address: str,
    ) -> AuthResponse:
        """Verify credentials and return the user + a signed access token."""
        normalized_email = email.strip().lower()
        await self.rate_limit.enforce(ip_address=ip_address, email=normalized_email)

        user = await self.users.get_by_email(normalized_email)
        if user is None or not verify_password(password, user.password_hash):
            await self.rate_limit.record_failure(
                ip_address=ip_address,
                email=normalized_email,
            )
            await self.session.commit()
            raise UnauthorizedError(
                "Invalid email or password", code="invalid_credentials"
            )

        await self.rate_limit.record_success(
            ip_address=ip_address,
            email=normalized_email,
        )

        return AuthResponse(
            user=UserRead.model_validate(user),
            access_token=create_access_token(user.id),
        )
