"""n8n webhook notifier - called when a quotation is Approved."""

from __future__ import annotations

import logging

import httpx

from config.settings import get_settings

logger = logging.getLogger("quoteflow")


class N8nService:
    """Posts approved-quotation payloads to the configured n8n webhook."""

    async def notify_quotation_approved(
        self, payload: dict[str, object]
    ) -> tuple[bool, str]:
        """POST the approved quotation to the n8n webhook.

        Returns (delivered, detail). Never raises - approval must succeed even
        if the webhook is unreachable (graceful degradation per Technical-Test §7).
        """
        settings = get_settings()
        if not settings.N8N_WEBHOOK_URL:
            return False, "N8N_WEBHOOK_URL not configured"

        try:
            async with httpx.AsyncClient(
                timeout=settings.N8N_TIMEOUT_SECONDS
            ) as client:
                response = await client.post(settings.N8N_WEBHOOK_URL, json=payload)
            if response.is_success:
                return True, f"delivered ({response.status_code})"
            logger.warning("n8n webhook returned %s", response.status_code)
            return False, f"webhook returned {response.status_code}"
        except httpx.HTTPError as exc:
            logger.warning("n8n webhook failed: %s", exc)
            return False, f"webhook error: {exc}"
