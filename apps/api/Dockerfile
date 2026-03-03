# ── API Dockerfile ───────────────────────────────────────────────────────
# Build context: repo root (pnpm workspace)

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm

# ── deps: install ALL workspace packages so pnpm resolves symlinks ───────
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Copy ALL app + package manifests (pnpm needs ALL of them to resolve workspace)
COPY packages/ ./packages/
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
RUN pnpm install --frozen-lockfile

# ── builder: compile TypeScript ───────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps ./apps
COPY --from=deps /app/packages ./packages
COPY . .

# Build shared db package first (may not have a build script — ignore failure)
RUN pnpm --filter @netra/db build 2>/dev/null || true
RUN pnpm --filter @netra/api build

# ── runner: minimal production image ─────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 apiuser

COPY --from=builder --chown=apiuser:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=apiuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=apiuser:nodejs /app/packages ./packages

USER apiuser
EXPOSE 3001
CMD ["node", "dist/index.js"]
