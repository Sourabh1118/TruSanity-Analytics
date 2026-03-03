# ── API Dockerfile ──────────────────────────────────────────────────────
# Build context: repo root (pnpm workspace)
# Builds the Fastify/TypeScript API service

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm

# ── deps: install all workspace deps ────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ ./packages/
COPY apps/api/package.json ./apps/api/package.json
# Install only production + workspace deps needed for api
RUN pnpm install --frozen-lockfile

# ── builder: compile TypeScript ──────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY . .
# Build shared packages first, then the API
# Build from root using workspace filter so pnpm finds hoisted binaries
RUN pnpm --filter @netra/db build 2>/dev/null || true
RUN pnpm --filter @netra/api build

# ── runner: minimal production image ────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 apiuser

# Copy compiled output and production node_modules
COPY --from=builder --chown=apiuser:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=apiuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=apiuser:nodejs /app/packages ./packages

USER apiuser

EXPOSE 3001
CMD ["node", "dist/index.js"]
