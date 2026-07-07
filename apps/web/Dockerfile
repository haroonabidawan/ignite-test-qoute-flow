# QuoteFlow web - Next.js (development image, pnpm monorepo).
# Build context is the repo root so workspace packages resolve.
FROM node:20-bookworm-slim

ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    NEXT_TELEMETRY_DISABLED=1
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy manifests first so `pnpm install` caches across source changes.
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/api/package.json ./packages/api/
COPY packages/i18n/package.json ./packages/i18n/
COPY packages/types/package.json ./packages/types/
RUN pnpm install --frozen-lockfile

# Source is bind-mounted in dev (see compose.yaml); copied for standalone runs.
COPY . .

EXPOSE 3000

CMD ["pnpm", "dev:web"]
