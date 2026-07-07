"""Shared helpers for entities (ID generation)."""

from __future__ import annotations

import uuid


def new_id() -> str:
    """Return a compact, URL-safe unique identifier."""
    return uuid.uuid4().hex
