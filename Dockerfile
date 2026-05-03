# ---- Base ----
FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app

# ---- Deps ----
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
# Skip postinstall (prisma generate) — we'll run it explicitly in builder
RUN pnpm install --frozen-lockfile --ignore-scripts

# ---- Build ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm prisma generate && pnpm build

# ---- Runner ----
FROM node:22-slim AS runner
WORKDIR /app

# Prisma needs openssl at runtime
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

# Standalone output mirrors the build path inside .next/standalone/
# Since WORKDIR is /app, the server lands at .next/standalone/app/server.js
COPY --from=builder /app/.next/standalone ./

USER nextjs

EXPOSE 8080
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]