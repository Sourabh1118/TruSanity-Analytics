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

# Build shared packages in dependency order (leaf packages first)
RUN pnpm --filter @trusanity/db-analytics build
RUN pnpm --filter @trusanity/db-billing build
RUN pnpm --filter @netra/db build
RUN pnpm --filter @netra/api build

# Use pnpm deploy to create a self-contained directory with all deps resolved
# This flattens the pnpm virtual store so Node can find all modules correctly
RUN pnpm --filter @netra/api deploy --prod --legacy /deploy

# Copy compiled dist + public into the deploy output (pnpm deploy only copies src)
RUN cp -r /app/apps/api/dist /deploy/dist
RUN cp -r /app/apps/api/public /deploy/public 2>/dev/null || true

# ── runner: minimal production image ─────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 apiuser

# Copy the fully self-contained deploy output — node_modules are flat and resolved
COPY --from=builder --chown=apiuser:nodejs /deploy ./

USER apiuser
EXPOSE 3001
CMD ["node", "dist/index.js"]
