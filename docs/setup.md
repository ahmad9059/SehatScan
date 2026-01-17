# Setup & Installation Guide

This document provides step-by-step instructions for setting up SehatScan locally and deploying to production.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Authentication Setup](#authentication-setup)
6. [AI Services Setup](#ai-services-setup)
7. [Running the Application](#running-the-application)
8. [Production Deployment](#production-deployment)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 18.x or higher | Runtime environment |
| npm | 9.x or higher | Package manager |
| Git | Latest | Version control |

### Recommended Tools

| Tool | Purpose |
|------|---------|
| VS Code | Code editor with great TypeScript support |
| Prisma Extension | VS Code extension for Prisma schema |
| PostgreSQL Client | Database management (pgAdmin, TablePlus, etc.) |

### Required Accounts

You'll need accounts with these services:

1. **Supabase** - Database hosting (free tier available)
2. **Clerk** - Authentication (free tier available)
3. **Google Cloud** - Gemini AI API (free tier available)

---

## Quick Start

For those familiar with the setup process:

```bash
# 1. Clone repository
git clone <repository-url>
cd SehatScan

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env

# 4. Edit .env with your credentials
# (See Environment Configuration section)

# 5. Generate Prisma client
npx prisma generate

# 6. Run database migrations
npx prisma migrate dev

# 7. Start development server
npm run dev
```

Visit `http://localhost:3000`

---

## Environment Configuration

### Complete Environment Variables

Create a `.env` file in the project root with these variables:

```env
# ===========================================
# DATABASE CONFIGURATION
# ===========================================

# Supabase pooled connection (for runtime)
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase direct connection (for migrations)
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].supabase.com:5432/postgres"

# ===========================================
# SUPABASE CONFIGURATION
# ===========================================

# Your Supabase project URL
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"

# Supabase anonymous/public key
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# ===========================================
# CLERK AUTHENTICATION
# ===========================================

# Clerk publishable key (public)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_xxxxxxxxxxxx"

# Clerk secret key (private)
CLERK_SECRET_KEY="sk_test_xxxxxxxxxxxx"

# Optional: Custom auth URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# ===========================================
# GOOGLE GEMINI AI
# ===========================================

# Your Gemini API key
GEMINI_API_KEY="AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Optional: Specify model (defaults to gemini-2.5-flash)
GEMINI_MODEL="gemini-2.5-flash"

# ===========================================
# APPLICATION
# ===========================================

# Application URL (for absolute URLs)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Node environment
NODE_ENV="development"
```

### Environment Variables Explanation

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Pooled PostgreSQL connection string |
| `DIRECT_URL` | Yes | Direct PostgreSQL connection for migrations |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase public API key |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk frontend key |
| `CLERK_SECRET_KEY` | Yes | Clerk backend key |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `GEMINI_MODEL` | No | Gemini model name |
| `NEXT_PUBLIC_APP_URL` | No | Base URL for the application |

---

## Database Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in project details:
   - Name: `sehatscan` (or your preferred name)
   - Database Password: Choose a strong password (save this!)
   - Region: Choose closest to your users
4. Wait for project to be created

### Step 2: Get Connection Strings

1. In Supabase dashboard, go to **Settings** → **Database**
2. Scroll to **Connection string**
3. Copy the **URI** connection string

For `DATABASE_URL` (pooled):
- Select "Connection pooling" mode
- Copy the connection string
- Add `?pgbouncer=true` at the end

For `DIRECT_URL`:
- Select "Direct connection" mode
- Copy the connection string

### Step 3: Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations (creates tables)
npx prisma migrate dev --name init

# Optional: Seed database with test data
npx prisma db seed
```

### Step 4: Verify Setup

```bash
# Open Prisma Studio to view your database
npx prisma studio
```

This opens a browser at `http://localhost:5555` where you can view and edit data.

---

## Authentication Setup

### Step 1: Create Clerk Application

1. Go to [clerk.com](https://clerk.com) and sign up/login
2. Click "Add application"
3. Configure your application:
   - Name: `SehatScan`
   - Sign-in options: Email (required), Google OAuth (recommended)
4. Click "Create application"

### Step 2: Get API Keys

1. In Clerk dashboard, go to **API Keys**
2. Copy:
   - **Publishable key** → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - **Secret key** → `CLERK_SECRET_KEY`

### Step 3: Configure Sign-in Options

1. Go to **User & Authentication** → **Email, Phone, Username**
2. Enable/configure preferred authentication methods
3. Go to **Social Connections** for OAuth setup

### Step 4: Configure URLs (Optional)

For custom domain or specific paths:

1. Go to **Paths** in Clerk dashboard
2. Configure:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/dashboard`
   - After sign-up URL: `/dashboard`

---

## AI Services Setup

### Google Gemini API

#### Step 1: Enable API

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API key"
4. Create a new API key
5. Copy the key → `GEMINI_API_KEY`

#### Step 2: Verify API Access

```bash
# Test API key (replace with your key)
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

#### API Quotas

Free tier limits (as of 2024):
- 60 requests per minute
- 1 million tokens per day

For higher limits, enable billing in Google Cloud Console.

---

## Running the Application

### Development Mode

```bash
# Start development server with hot reload
npm run dev
```

The application will be available at `http://localhost:3000`

### Development Features

- **Hot Module Replacement**: Changes reflect instantly
- **Error Overlay**: Detailed error messages in browser
- **Prisma Studio**: `npx prisma studio` for database UI

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start development server |
| `build` | `npm run build` | Build for production |
| `start` | `npm start` | Start production server |
| `lint` | `npm run lint` | Run ESLint |
| `test` | `npm test` | Run tests |
| `test:watch` | `npm run test:watch` | Run tests in watch mode |

---

## Production Deployment

### Vercel Deployment (Recommended)

#### Step 1: Connect Repository

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "Add New Project"
3. Import your Git repository
4. Vercel auto-detects Next.js

#### Step 2: Configure Environment Variables

In Vercel project settings, add all environment variables:

```
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
GEMINI_API_KEY=AIza...
```

**Important**: Use production keys for Clerk (starts with `pk_live_` and `sk_live_`)

#### Step 3: Configure Build Settings

Build settings (usually auto-detected):
- Framework Preset: Next.js
- Build Command: `prisma generate && next build`
- Output Directory: `.next`
- Install Command: `npm install`

#### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Your app is live!

### Alternative: Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

```bash
# Build and run
docker build -t sehatscan .
docker run -p 3000:3000 --env-file .env sehatscan
```

---

## Project Structure Reference

```
SehatScan/
├── app/                      # Next.js App Router
│   ├── actions/             # Server Actions
│   ├── api/                 # API Routes
│   ├── components/          # React Components
│   ├── dashboard/           # Dashboard Pages
│   ├── layout.tsx           # Root Layout
│   ├── page.tsx             # Home Page
│   └── globals.css          # Global Styles
├── lib/                     # Utilities
│   ├── db.ts               # Prisma Client
│   ├── gemini.ts           # Gemini AI
│   └── clerk-session.ts    # Auth Helpers
├── prisma/
│   └── schema.prisma       # Database Schema
├── public/                  # Static Files
├── types/                   # TypeScript Types
├── .env                     # Environment Variables
├── .env.example             # Environment Template
├── next.config.ts           # Next.js Config
├── package.json             # Dependencies
├── tailwind.config.js       # Tailwind Config
└── tsconfig.json            # TypeScript Config
```

---

## Troubleshooting

### Common Issues

#### 1. "Module not found" Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

#### 2. Prisma Client Issues

```bash
# Regenerate Prisma client
npx prisma generate

# If schema changed, run migration
npx prisma migrate dev
```

#### 3. Database Connection Errors

Check your connection strings:
- Ensure password is URL-encoded if it contains special characters
- Verify Supabase project is active
- Check network/firewall settings

```bash
# Test connection
npx prisma db pull
```

#### 4. Clerk Authentication Issues

- Verify API keys are correct (test vs production)
- Check Clerk dashboard for error logs
- Ensure environment variables are set

#### 5. Gemini API Errors

- Verify API key is valid
- Check quota usage in Google Cloud Console
- Ensure API is enabled for your project

#### 6. Build Failures

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

### Getting Help

1. Check existing [GitHub Issues](https://github.com/your-repo/issues)
2. Review documentation in this `docs/` folder
3. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Environment details

---

## Next Steps

After setup, explore these resources:

1. [Architecture Overview](./architecture.md) - Understand the codebase
2. [Features Guide](./features.md) - Learn about features
3. [API Reference](./api-reference.md) - API documentation
4. [AI Integration](./ai-integration.md) - AI system details
