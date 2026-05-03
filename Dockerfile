# ---- Base ----
FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app

# ---- Deps ----
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

# ---- Build ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Skip full env validation at build time; runtime provides real values
ENV BUILDING=1

# NEXT_PUBLIC_ vars are baked into client bundles at build time.
# Pass these via --build-arg or cloudbuild.yaml. They are public keys
# (visible in browser bundles) but should NOT be committed to source.
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}

# Placeholder server-only vars for compilation.
# Real values are injected at runtime by Cloud Run env vars.
ENV DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder
ENV CLERK_SECRET_KEY=sk_test_placeholder_build
ENV GEMINI_API_KEY=placeholder
ENV REDIS_URL=redis://placeholder

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
COPY --from=builder /app/.next/standalone ./

USER nextjs

EXPOSE 8080
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]