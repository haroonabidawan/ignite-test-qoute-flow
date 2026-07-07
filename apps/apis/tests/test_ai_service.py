"""Tests for AI draft parsing and offline fallback."""

from __future__ import annotations

import json

import pytest

from app.services.ai import AiService
from config.exceptions import AiDraftError
from config.settings import Settings


@pytest.fixture
def ai_service() -> AiService:
    return AiService()


def test_parse_valid_json(ai_service: AiService) -> None:
    raw = json.dumps(
        {
            "project_type": "website",
            "suggested_items": [
                {
                    "title": "Discovery",
                    "description": "Scope workshop",
                    "quantity": 1,
                    "unit_price": None,
                    "estimated_hours": 4,
                }
            ],
            "questions_to_ask_client": ["Timeline?"],
            "summary": "Initial draft.",
        }
    )
    draft = ai_service._parse_and_validate(raw)
    assert draft.project_type == "website"
    assert draft.source == "ai"
    assert len(draft.suggested_items) == 1
    assert draft.suggested_items[0].unit_price is None


def test_parse_invalid_json_raises(ai_service: AiService) -> None:
    with pytest.raises(AiDraftError, match="invalid JSON"):
        ai_service._parse_and_validate("not-json")


def test_parse_invalid_shape_raises(ai_service: AiService) -> None:
    with pytest.raises(AiDraftError, match="validation"):
        ai_service._parse_and_validate(
            json.dumps({"suggested_items": [{"title": 123}]})
        )


@pytest.mark.asyncio
async def test_offline_draft_english(ai_service: AiService) -> None:
    settings = Settings(
        APP_NAME="t",
        APP_VERSION="0",
        ENVIRONMENT="test",
        DEBUG=False,
        DATABASE_URL="sqlite+aiosqlite:///:memory:",
        SECRET_KEY="x" * 32,
        JWT_ALGORITHM="HS256",
        ACCESS_TOKEN_EXPIRE_MINUTES=60,
        ALLOWED_ORIGINS="http://localhost",
        CURRENCY_CODE="USD",
        AI_API_KEY="",
        AI_BASE_URL="https://example.com",
        AI_MODEL="m",
        AI_TIMEOUT_SECONDS=30,
        N8N_WEBHOOK_URL="",
        N8N_TIMEOUT_SECONDS=10,
    )
    draft = await ai_service.generate_draft("Build a marketing site", "en")
    assert draft.source == "offline"
    assert len(draft.suggested_items) >= 1
    assert settings.ai_enabled is False


@pytest.mark.asyncio
async def test_offline_draft_arabic(ai_service: AiService) -> None:
    draft = await ai_service.generate_draft("موقع تسويقي", "ar")
    assert draft.source == "offline"
    assert draft.project_type == "مشروع عام"
