# ── Web Dockerfile ──────────────────────────────────────────────────────
# Build context: repo root (pnpm workspace)
# Builds the Next.js analytics dashboard

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm

# ── deps: install all workspace deps ────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ ./packages/
COPY apps/web/package.json ./apps/web/package.json
RUN pnpm install --frozen-lockfile

# ── builder: build Next.js app ───────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
# Provide dummy build-time vars so static analysis doesn't fail
ENV DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder
ENV AUTH_SECRET=build-time-placeholder-secret-not-used-at-runtime
ENV NEXT_PUBLIC_API_URL=http://localhost:3001

# Build from root using workspace filter so pnpm finds hoisted binaries (e.g. next)
RUN pnpm --filter @netra/web build

# ── runner: minimal production image ────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

RUN mkdir -p ./apps/web/public
COPY --from=builder /app/apps/web/public ./apps/web/public

RUN mkdir -p ./apps/web/.next && chown nextjs:nodejs ./apps/web/.next

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "apps/web/server.js"]
