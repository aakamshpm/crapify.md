# ── Stage 1: Build ───────────────────────────────────────────────
FROM node:20-slim AS builder

RUN corepack enable && corepack prepare pnpm@10.30.1 --activate

# Tell Puppeteer not to download Chrome, we'll use system Chromium instead
ENV PUPPETEER_SKIP_DOWNLOAD=true

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY packages/markdown/package.json ./packages/markdown/package.json

RUN pnpm install --frozen-lockfile

COPY apps/api ./apps/api
COPY packages ./packages

# Build api and all packages it depends on
RUN pnpm turbo build --filter=@crapify/api

# ── Stage 2: Production dependencies (clean install) ────────────
FROM node:20-slim AS prod-deps

RUN corepack enable && corepack prepare pnpm@10.30.1 --activate

ENV PUPPETEER_SKIP_DOWNLOAD=true

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY packages/markdown/package.json ./packages/markdown/package.json

# Fresh prod-only install , no devDeps, no symlink corruption
RUN pnpm install --frozen-lockfile --prod

# ── Stage 3: Runtime ─────────────────────────────────────────────
FROM node:20-slim AS runtime

# Install Chromium and its system library dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV NODE_ENV=production

WORKDIR /app

# Clean production node_modules from prod-deps stage
COPY --from=prod-deps /app/node_modules ./node_modules

# Workspace packages,their dist + package.json + node_modules
COPY --from=builder /app/packages/types ./packages/types
COPY --from=builder /app/packages/markdown/dist ./packages/markdown/dist
COPY --from=builder /app/packages/markdown/package.json ./packages/markdown/package.json
COPY --from=prod-deps /app/packages/markdown/node_modules ./packages/markdown/node_modules

# API workspace, its node_modules (symlinks into root .pnpm store), compiled output, and package.json
COPY --from=prod-deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

EXPOSE 3000
CMD ["node", "apps/api/dist/main.js"]
