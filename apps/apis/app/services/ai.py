"""AI draft generation.

Calls an OpenAI-compatible chat-completions endpoint, validates the JSON against
`AiDraftResponse`, and falls back to an offline heuristic when no API key is set
so the app is runnable out of the box. AI is called from the backend only; the
key never reaches the frontend (Technical-Test §7).
"""

from __future__ import annotations

import json
import logging
from functools import lru_cache
from pathlib import Path

import httpx
from pydantic import ValidationError

from app.http.dtos.ai import AiDraftResponse, AiSuggestedItem
from config.exceptions import AiDraftError
from config.settings import get_settings

logger = logging.getLogger("quoteflow")

_PROMPT_RELATIVE = Path("prompts") / "quotation-draft.md"


def _resolve_prompt_path() -> Path:
    """Walk up from this file to find `apps/apis/prompts/quotation-draft.md`."""
    for parent in Path(__file__).resolve().parents:
        candidate = parent / _PROMPT_RELATIVE
        if candidate.exists():
            return candidate
    return _PROMPT_RELATIVE


@lru_cache
def _load_prompt() -> str:
    prompt_path = _resolve_prompt_path()
    try:
        return prompt_path.read_text(encoding="utf-8")
    except OSError:
        logger.warning("Prompt file missing at %s; using inline fallback", prompt_path)
        return (
            "You are a quotation assistant. Given a client request, return JSON with "
            "project_type, suggested_items[], questions_to_ask_client[], and summary. "
            "If a price is unknown, use null - never invent prices."
        )


class AiService:
    """Turns a free-text client brief into a validated quotation draft."""

    async def generate_draft(
        self, request_text: str, locale: str = "en"
    ) -> AiDraftResponse:
        """Return a validated AI draft for the given client brief."""
        settings = get_settings()
        if not settings.ai_enabled:
            return self._offline_draft(request_text, locale)

        try:
            raw = await self._call_provider(request_text, locale)
        except httpx.HTTPError as exc:
            logger.warning("AI provider request failed: %s", exc)
            raise AiDraftError("AI provider request failed") from exc

        return self._parse_and_validate(raw)

    async def _call_provider(self, request_text: str, locale: str = "en") -> str:
        """Call the OpenAI-compatible endpoint and return the raw content string."""
        settings = get_settings()
        language_note = (
            "Write all text fields (titles, descriptions, questions, summary) "
            "in Arabic."
            if locale == "ar"
            else "Write all text fields (titles, descriptions, questions, summary) "
            "in English."
        )
        body = {
            "model": settings.AI_MODEL,
            "messages": [
                {"role": "system", "content": _load_prompt()},
                {
                    "role": "user",
                    "content": f"{language_note}\n\nClient request:\n{request_text}",
                },
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.3,
        }
        headers = {"Authorization": f"Bearer {settings.AI_API_KEY}"}
        async with httpx.AsyncClient(timeout=settings.AI_TIMEOUT_SECONDS) as client:
            response = await client.post(
                f"{settings.AI_BASE_URL}/chat/completions", json=body, headers=headers
            )
            response.raise_for_status()
            data = response.json()
        try:
            return str(data["choices"][0]["message"]["content"])
        except (KeyError, IndexError, TypeError) as exc:
            raise AiDraftError("AI provider returned an unexpected shape") from exc

    def _parse_and_validate(self, raw: str) -> AiDraftResponse:
        """Parse the model's JSON string and validate it - reject bad shapes."""
        try:
            data = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise AiDraftError("AI returned invalid JSON") from exc
        try:
            draft = AiDraftResponse.model_validate(data)
        except ValidationError as exc:
            raise AiDraftError("AI JSON failed validation") from exc
        draft.source = "ai"
        return draft

    def _offline_draft(self, request_text: str, locale: str = "en") -> AiDraftResponse:
        """Deterministic heuristic draft when no AI key is configured."""
        if locale == "ar":
            return AiDraftResponse(
                project_type="مشروع عام",
                suggested_items=[
                    AiSuggestedItem(
                        title="الاكتشاف وتحليل المتطلبات",
                        description="تحديد النطاق وتأكيد المخرجات والجدول الزمني.",
                        quantity=1,
                        unit_price=None,
                        estimated_hours=6,
                    ),
                    AiSuggestedItem(
                        title="التصميم والتطوير",
                        description=f"البناء الأساسي بناءً على: {request_text[:140]}",
                        quantity=1,
                        unit_price=None,
                        estimated_hours=40,
                    ),
                ],
                questions_to_ask_client=[
                    "ما هو الجدول الزمني المستهدف؟",
                    "هل لديك هوية بصرية أو أصول جاهزة؟",
                    "ما نطاق الميزانية المتوقع؟",
                ],
                summary=("مسودة دون اتصال بالذكاء الاصطناعي. راجعها وعدّلها قبل الحفظ."),
                source="offline",
            )

        return AiDraftResponse(
            project_type="general project",
            suggested_items=[
                AiSuggestedItem(
                    title="Discovery and requirements",
                    description="Scope the request, confirm deliverables and timeline.",
                    quantity=1,
                    unit_price=None,
                    estimated_hours=6,
                ),
                AiSuggestedItem(
                    title="Design and development",
                    description=f"Core build based on: {request_text[:140]}",
                    quantity=1,
                    unit_price=None,
                    estimated_hours=40,
                ),
            ],
            questions_to_ask_client=[
                "What is your target timeline?",
                "Do you have an existing brand or assets?",
                "What is your budget range?",
            ],
            summary=(
                "Offline draft generated without an AI provider. "
                "Review and edit before saving."
            ),
            source="offline",
        )
