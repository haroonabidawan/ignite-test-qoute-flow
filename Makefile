.DEFAULT_GOAL := help

COMPOSE := docker compose
COMPOSE_PROD := docker compose -f compose.prod.yaml
PNPM := pnpm
# One-off api commands (same env + deps as the running api service)
API_RUN := $(COMPOSE) run --rm -T api
PROD_API_RUN := $(COMPOSE_PROD) run --rm -T api

.PHONY: help install setup up up-build down down-v restart clean migrate migrate\:rollback migrate\:reset migrate\:reset-seed seed prod-up prod-up-build prod-down prod-down-v prod-restart prod-seed

help: ## Show available commands
	@awk 'BEGIN {FS = " ##"; printf "\nUsage: make <target>\n\nTargets:\n"} \
		/^[a-zA-Z0-9_\\-]+(\\:[a-zA-Z0-9_\\-]+)*: / { \
			target=$$1; sub(/: *$$/, "", target); gsub(/\\/, "", target); \
			printf "  %-20s %s\n", target, $$2; \
		}' $(MAKEFILE_LIST)
	@printf "\n"

install: ## Install JS dependencies
	$(PNPM) install

setup: install ## First-time local setup
	@if [ ! -f .env ] && [ -f .env.example ]; then cp .env.example .env && echo "Created .env from .env.example"; fi
	@echo "Setup complete. Run: make up-build"

up: ## Start db + api + web (docker compose up)
	@if [ ! -f .env ] && [ -f .env.example ]; then cp .env.example .env && echo "Created .env from .env.example"; fi
	$(COMPOSE) up -d

up-build: ## Build images and start the full dev stack
	@if [ ! -f .env ] && [ -f .env.example ]; then cp .env.example .env && echo "Created .env from .env.example"; fi
	$(COMPOSE) up --build -d

down: ## Stop containers (keep volumes)
	$(COMPOSE) down

down-v: ## Stop containers and remove volumes (reset DB)
	$(COMPOSE) down -v

restart: ## Restart all compose services
	$(COMPOSE) restart

clean: ## Remove compose containers, volumes, and local build artifacts
	$(COMPOSE) down -v --remove-orphans
	rm -rf apps/web/.next apps/web/node_modules packages/ui/node_modules node_modules .turbo

migrate: ## Apply database migrations inside the api container (DDL only)
	$(API_RUN) python -m alembic upgrade head

migrate\:rollback: ## Roll back the latest migration inside the api container
	$(API_RUN) python -m alembic downgrade -1

migrate\:reset: ## Reset schema (downgrade base + upgrade head). Pass seed=1 to seed after
	$(API_RUN) python -m alembic downgrade base
	$(API_RUN) python -m alembic upgrade head
ifneq (,$(filter 1 true yes,$(SEED) $(seed)))
	$(API_RUN) python -m database.seed
endif

migrate\:reset-seed: ## Reset schema and seed admin user (same as migrate:reset seed=1)
	@$(MAKE) migrate:reset seed=1

seed: ## Seed database inside the api container (idempotent)
	$(API_RUN) python -m database.seed

prod-up: ## Start production stack (compose.prod.yaml)
	@if [ ! -f .env ] && [ -f .env.prod.example ]; then cp .env.prod.example .env && echo "Created .env from .env.prod.example - update secrets before deploying"; fi
	$(COMPOSE_PROD) up -d

prod-up-build: ## Build and start production stack
	@if [ ! -f .env ] && [ -f .env.prod.example ]; then cp .env.prod.example .env && echo "Created .env from .env.prod.example - update secrets before deploying"; fi
	$(COMPOSE_PROD) up --build -d

prod-down: ## Stop production stack (keep volumes)
	$(COMPOSE_PROD) down

prod-down-v: ## Stop production stack and remove volumes
	$(COMPOSE_PROD) down -v

prod-restart: ## Restart production stack
	$(COMPOSE_PROD) restart

prod-seed: ## Seed admin user in production api container
	$(PROD_API_RUN) python -m database.seed
