"""Auth controller - HTTP handlers delegate to services."""

from __future__ import annotations

from fastapi import Request, Response

from app.helpers.response import success_response
from app.http.dtos.auth import LoginRequest, UserRead
from app.http.dtos.response import ApiResponse, empty_data
from app.services.auth import AuthService
from config.dependencies import CurrentUser, DBSession, get_client_ip
from config.security import clear_auth_cookie, set_auth_cookie


class AuthController:
    @staticmethod
    async def login(
        payload: LoginRequest,
        request: Request,
        response: Response,
        db: DBSession,
    ) -> ApiResponse:
        """Authenticate with email + password; sets httpOnly session cookie."""
        result = await AuthService(db).login(
            payload.email,
            payload.password,
            ip_address=get_client_ip(request),
        )
        set_auth_cookie(response, result.access_token)
        return success_response(result, "Login successful")

    @staticmethod
    async def logout(response: Response) -> ApiResponse:
        """Clear the httpOnly session cookie."""
        clear_auth_cookie(response)
        return success_response(empty_data(), "Logged out successfully")

    @staticmethod
    async def me(current_user: CurrentUser) -> ApiResponse:
        """Return the authenticated user's profile."""
        return success_response(
            UserRead.model_validate(current_user),
            "User retrieved successfully",
        )
