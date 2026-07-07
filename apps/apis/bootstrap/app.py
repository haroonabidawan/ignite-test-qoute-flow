"""FastAPI application factory."""

from __future__ import annotations

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.exceptions import register_exception_handlers
from config.settings import get_settings
from database.connection import engine
from database.migrate import run_migrations
from database.seeders import seed
from routes.api import register_routes


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    """Run pending migrations and idempotent seeders on startup."""
    await run_migrations()
    if get_settings().ENVIRONMENT != "test":
        await seed()
    yield
    await engine.dispose()


def create_app() -> FastAPI:
    settings = get_settings()
    application = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="QuoteFlow - AI-assisted quotation builder API.",
        lifespan=lifespan,
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_exception_handlers(application)
    register_routes(application)

    return application


app = create_app()
