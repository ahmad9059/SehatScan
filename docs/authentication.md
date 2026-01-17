# Authentication System

This document provides comprehensive documentation of SehatScan's authentication system, including Clerk integration, session management, and security practices.

---

## Table of Contents

1. [Overview](#overview)
2. [Clerk Integration](#clerk-integration)
3. [User Session Management](#user-session-management)
4. [Database Synchronization](#database-synchronization)
5. [Protected Routes](#protected-routes)
6. [API Authentication](#api-authentication)
7. [Security Best Practices](#security-best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Overview

### Authentication Architecture

SehatScan uses **Clerk** as the primary authentication provider, offering:

- Modern, secure authentication flows
- Multiple sign-in methods (Email, OAuth)
- Session management
- User profile management
- Security features (2FA, device management)

<!-- DIAGRAM:AUTH_ARCHITECTURE -->

---

## Clerk Integration

### Installation

Clerk is integrated via the `@clerk/nextjs` package:

```json
// package.json
{
  "dependencies": {
    "@clerk/nextjs": "^6.17.0"
  }
}
```

### Environment Configuration

```env
# Clerk API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxx

# Optional: Custom sign-in/sign-up URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### Provider Setup

```typescript
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

### Middleware Configuration

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

---

## User Session Management

### Getting Current User

```typescript
// lib/clerk-session.ts
import { currentUser } from "@clerk/nextjs/server";
import { db } from "./db";

/**
 * Get the current authenticated user
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  return {
    id: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress || "",
    name: clerkUser.firstName
      ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
      : null,
    imageUrl: clerkUser.imageUrl,
  };
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  return user;
}
```

### Using in Server Components

```typescript
// app/dashboard/page.tsx
import { getCurrentUser, requireAuth } from '@/lib/clerk-session'

export default async function DashboardPage() {
  // Option 1: Require auth (throws error if not authenticated)
  const user = await requireAuth()

  // Option 2: Check auth (returns null if not authenticated)
  const optionalUser = await getCurrentUser()

  return (
    <div>
      <h1>Welcome, {user.name || 'User'}</h1>
    </div>
  )
}
```

### Using in Client Components

```typescript
// Client-side user access
'use client'

import { useUser, useClerk } from '@clerk/nextjs'

export function UserProfile() {
  const { user, isLoaded, isSignedIn } = useUser()
  const { signOut } = useClerk()

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (!isSignedIn) {
    return <div>Please sign in</div>
  }

  return (
    <div>
      <p>Welcome, {user.firstName}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  )
}
```

---

## Database Synchronization

### Why Synchronize?

Clerk manages user authentication, but SehatScan needs users in the local database to:

- Store analysis records with foreign key relationships
- Query user data efficiently
- Maintain data integrity

### Sync Function

```typescript
// lib/clerk-session.ts

/**
 * Ensures the Clerk user exists in the local database
 * Creates or updates as needed
 */
export async function ensureUserInDatabase() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  const name = clerkUser.firstName
    ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
    : null;

  // Upsert: create if not exists, update if exists
  const user = await db.user.upsert({
    where: { id: clerkUser.id },
    update: {
      email: email || "",
      name: name,
    },
    create: {
      id: clerkUser.id, // Use Clerk ID as database ID
      email: email || "",
      password: "", // No password needed for Clerk users
      name: name,
    },
  });

  return user;
}
```

### When to Sync

The sync happens automatically:

1. **First dashboard visit**: When user accesses protected routes
2. **Profile updates**: When user updates their Clerk profile
3. **Server actions**: Before any database operation

```typescript
// Example: Sync before analysis creation
export async function analyzeReport(formData: FormData) {
  // Ensure user exists in database
  const dbUser = await ensureUserInDatabase();

  if (!dbUser) {
    return { success: false, error: "Authentication required" };
  }

  // Now safe to create analysis with user reference
  const analysis = await db.analysis.create({
    data: {
      userId: dbUser.id,
      // ...
    },
  });
}
```

---

## Protected Routes

### Middleware Protection

The Clerk middleware automatically protects routes matching the pattern:

```typescript
// Protected routes pattern
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
```

This protects:

- `/dashboard`
- `/dashboard/scan-report`
- `/dashboard/scan-face`
- `/dashboard/chatbot`
- `/dashboard/history`
- All other `/dashboard/*` routes

### Server-Side Protection

Additional protection in server components:

```typescript
// app/dashboard/layout.tsx
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { userId } = auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return <div className="dashboard-layout">{children}</div>
}
```

### API Route Protection

```typescript
// app/api/analyze/report/route.ts
import { getCurrentUser } from "@/lib/clerk-session";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Process authenticated request
  // ...
}
```

### Server Action Protection

```typescript
// app/actions/scan.ts
"use server";

import { requireAuth, ensureUserInDatabase } from "@/lib/clerk-session";

export async function analyzeReport(formData: FormData) {
  try {
    // This throws if not authenticated
    await requireAuth();

    // This ensures database sync
    const user = await ensureUserInDatabase();

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Proceed with authenticated operation
    // ...
  } catch (error) {
    return { success: false, error: "Authentication required" };
  }
}
```

---

## API Authentication

### Token-Based Authentication

For API routes, Clerk provides session tokens:

```typescript
// Client-side: Include token in requests
import { useAuth } from "@clerk/nextjs";

function ApiClient() {
  const { getToken } = useAuth();

  async function fetchData() {
    const token = await getToken();

    const response = await fetch("/api/analyses", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
```

### Server-Side Token Validation

```typescript
// app/api/analyses/route.ts
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  const { userId } = auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Fetch user's analyses
  const analyses = await db.analysis.findMany({
    where: { userId },
  });

  return Response.json(analyses);
}
```

---

## Security Best Practices

### 1. Always Validate User Ownership

```typescript
// BAD: No ownership check
const analysis = await db.analysis.findUnique({
  where: { id: analysisId },
});

// GOOD: Include user ownership
const analysis = await db.analysis.findFirst({
  where: {
    id: analysisId,
    userId: currentUser.id, // Ensure user owns this analysis
  },
});
```

### 2. Use Server-Side Validation

```typescript
// Always validate on server, not just client
export async function updateProfile(formData: FormData) {
  const user = await requireAuth();

  const name = formData.get("name");

  // Server-side validation
  if (typeof name !== "string" || name.length > 100) {
    return { error: "Invalid name" };
  }

  // Safe to update
  await db.user.update({
    where: { id: user.id },
    data: { name },
  });
}
```

### 3. Don't Expose Sensitive Data

```typescript
// BAD: Returning password hash
const user = await db.user.findUnique({
  where: { id: userId },
});
return user; // Includes password!

// GOOD: Select only needed fields
const user = await db.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    email: true,
    name: true,
    createdAt: true,
    // password: false (omitted)
  },
});
```

### 4. Handle Authentication Errors Gracefully

```typescript
export async function protectedAction() {
  try {
    const user = await requireAuth();
    // ... action logic
  } catch (error) {
    // Don't expose internal error details
    return {
      success: false,
      error: "Please sign in to continue",
    };
  }
}
```

### 5. Use HTTPS Only

Clerk handles this by default, but ensure:

- Production deployment uses HTTPS
- API endpoints reject HTTP in production
- Cookies marked as Secure

### 6. Implement Rate Limiting

```typescript
// Example rate limiting (consider using a library)
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  limiter: Ratelimit.slidingWindow(10, "60 s"),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const { success } = await ratelimit.limit(user?.id || "anonymous");

  if (!success) {
    return new Response("Too many requests", { status: 429 });
  }

  // Process request
}
```

---

## Password Authentication (Fallback)

For scenarios where Clerk is not used, a password authentication system is available:

### Password Hashing

```typescript
// lib/auth.ts
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/**
 * Hash a plain text password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### Registration Endpoint

```typescript
// app/api/register/route.ts
import { hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const { email, password, name } = await request.json();

  // Validate input
  if (!email || !password) {
    return Response.json(
      { error: "Email and password required" },
      { status: 400 },
    );
  }

  // Check existing user
  const existing = await db.user.findUnique({
    where: { email },
  });

  if (existing) {
    return Response.json(
      { error: "Email already registered" },
      { status: 400 },
    );
  }

  // Hash password and create user
  const hashedPassword = await hashPassword(password);

  const user = await db.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });

  return Response.json({
    success: true,
    userId: user.id,
  });
}
```

---

## Clerk UI Components

### Sign In Button

```typescript
import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs'

function AuthButton() {
  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <button>Sign In</button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </>
  )
}
```

### User Button

```typescript
import { UserButton } from '@clerk/nextjs'

function Header() {
  return (
    <header>
      <UserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            avatarBox: 'h-10 w-10'
          }
        }}
      />
    </header>
  )
}
```

### Custom Sign In Page

```typescript
// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-xl'
          }
        }}
      />
    </div>
  )
}
```

---

## Troubleshooting

### Common Issues

**1. "Unauthorized" errors after sign-in**

Cause: User not synced to database

Solution:

```typescript
// Ensure sync happens on first protected page access
const user = await ensureUserInDatabase();
```

**2. Clerk keys not found**

Cause: Environment variables not set

Solution: Check `.env` file has:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

**3. Middleware not protecting routes**

Cause: Incorrect matcher pattern

Solution: Update `middleware.ts`:

```typescript
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

**4. Session not persisting**

Cause: Cookie issues or domain mismatch

Solution:

- Check browser cookies are enabled
- Verify domain configuration in Clerk dashboard
- Check for CORS issues

**5. User data out of sync**

Cause: Clerk profile updated but database not synced

Solution:

```typescript
// Force sync on profile page or implement webhook
await ensureUserInDatabase();
```

### Debug Mode

Enable Clerk debug logging:

```typescript
// app/layout.tsx
<ClerkProvider
  debug={process.env.NODE_ENV === 'development'}
>
```

Check browser console for detailed Clerk logs.
