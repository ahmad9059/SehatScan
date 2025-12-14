# Setting Up New Supabase Database

If your current Supabase project is unavailable, follow these steps to create a new one:

## 1. Create New Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Choose your organization
4. Enter project details:
   - **Name**: SehatScan AI
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your location
5. Wait for project creation (2-3 minutes)

## 2. Get New Connection String

1. Go to **Project Settings** → **Database**
2. Under **Connection string**, copy the **URI** format
3. Replace `[YOUR-PASSWORD]` with your actual password
4. URL-encode special characters:
   - `%` → `%25`
   - `@` → `%40`
   - `#` → `%23`
   - `+` → `%2B`
   - ` ` (space) → `%20`

## 3. Update Environment Variables

Update your `frontend/.env` file:

```bash
# Replace with your new connection strings
DATABASE_URL="postgresql://postgres.[new-project-ref]:[encoded-password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[new-project-ref]:[encoded-password]@aws-0-[region].pooler.supabase.com:5432/postgres"

# Update Supabase URLs
NEXT_PUBLIC_SUPABASE_URL="https://[new-project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[new-anon-key]"
```

## 4. Run Database Migrations

```bash
cd frontend
npx prisma migrate deploy
npx prisma generate
```

## 5. Test Connection

```bash
npx prisma db pull
```

If successful, restart your development server:

```bash
npm run dev
```
