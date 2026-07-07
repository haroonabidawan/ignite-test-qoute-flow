# QuoteFlow API - FastAPI (development image).
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Source is bind-mounted in dev (see compose.yaml); copied here for standalone runs.
COPY . .

# Install the project (deps come from pyproject.toml).
RUN pip install .

EXPOSE 8000

# Compose overrides this with --reload for hot reloading.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
