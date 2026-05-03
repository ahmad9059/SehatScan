# ---- Base ----
FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app

# ---- Deps ----
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ---- Build ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm prisma generate && pnpm build

# ---- Runner ----
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Standalone output preserves the source directory structure.
# COPY from the nested path that Next.js created.
ARG SOURCE_DIR=.next/standalone

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

# Copy standalone server and its node_modules
COPY --from=builder /app/${SOURCE_DIR} ./

USER nextjs

EXPOSE 8080
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]