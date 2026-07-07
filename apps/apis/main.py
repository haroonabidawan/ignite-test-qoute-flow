"""Uvicorn entrypoint (``uvicorn main:app``)."""

from bootstrap.app import app

__all__ = ["app"]
