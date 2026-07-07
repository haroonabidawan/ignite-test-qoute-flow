"""Application bootstrap - FastAPI factory and ASGI app."""

from bootstrap.app import app, create_app

__all__ = ["app", "create_app"]
