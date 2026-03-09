# ── Stage 1: Build ───────────────────────────────────────────────
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@10.30.1 --activate

WORKDIR /app
# Copy workspace manifests first, Docker caches this layer separately.
# If only source files change, this layer is reused and pnpm install is skipped.

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json tsconfig.base.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY packages/markdown/package.json ./packages/markdown/package.json

RUN pnpm install --frozen-lockfile

# Copy source after install (so changing source doesn't invalidate the install layer)
COPY apps/web ./apps/web
COPY packages ./packages

# Build arg - passed in from docker-compose or host server at build time
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

RUN pnpm turbo build --filter=@crapify/web

# ── Stage 2: Runtime ─────────────────────────────────────────────
FROM nginx:alpine AS runtime

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]