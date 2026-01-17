# Database Schema

This document provides comprehensive documentation of SehatScan's database schema, models, relationships, and data management practices.

---

## Table of Contents

1. [Overview](#overview)
2. [Database Setup](#database-setup)
3. [Schema Definition](#schema-definition)
4. [Models](#models)
5. [Relationships](#relationships)
6. [Data Types](#data-types)
7. [Queries & Operations](#queries--operations)
8. [Migrations](#migrations)
9. [Best Practices](#best-practices)

---

## Overview

### Technology Stack

| Component | Technology |
|-----------|------------|
| Database | PostgreSQL |
| Hosting | Supabase |
| ORM | Prisma |
| Connection | Connection Pooler |

### Database Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      APPLICATION                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                   Prisma Client                          ││
│  │              (Type-safe queries)                         ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   SUPABASE POOLER                            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │           Connection Pooling (PgBouncer)                 ││
│  │         Efficient connection management                  ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    POSTGRESQL                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Users     │  │  Analyses   │  │   Future    │         │
│  │   Table     │  │   Table     │  │   Tables    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Setup

### Environment Configuration

```env
# Primary connection (via pooler for production)
DATABASE_URL="postgresql://postgres.xxxx:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection (for migrations)
DIRECT_URL="postgresql://postgres.xxxx:password@aws-0-region.supabase.com:5432/postgres"
```

### Why Two URLs?

1. **DATABASE_URL** (Pooled Connection)
   - Uses Supabase connection pooler (PgBouncer)
   - Efficient for runtime queries
   - Handles connection limits
   - Required for serverless environments

2. **DIRECT_URL** (Direct Connection)
   - Direct PostgreSQL connection
   - Required for migrations (DDL operations)
   - Used for Prisma introspection
   - Bypasses pooler limitations

### Prisma Configuration

```prisma
// prisma/schema.prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

---

## Schema Definition

### Complete Prisma Schema

```prisma
// prisma/schema.prisma

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String     @id @default(cuid())
  email     String     @unique
  password  String
  name      String?
  createdAt DateTime   @default(now())
  analyses  Analysis[]
}

model Analysis {
  id               String   @id @default(cuid())
  userId           String
  type             String
  rawData          Json
  structuredData   Json?
  visualMetrics    Json?
  riskAssessment   String?
  problemsDetected Json?
  treatments       Json?
  createdAt        DateTime @default(now())
  user             User     @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([type])
  @@index([createdAt])
}
```

---

## Models

### User Model

Stores user account information.

| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `id` | String | Primary Key, CUID | Unique user identifier |
| `email` | String | Unique | User's email address |
| `password` | String | Required | Hashed password (bcrypt) |
| `name` | String | Optional | Display name |
| `createdAt` | DateTime | Default: now() | Account creation timestamp |
| `analyses` | Analysis[] | Relation | User's analyses |

**Notes:**
- The `id` uses CUID for distributed-friendly unique IDs
- When using Clerk, the Clerk user ID is used as the `id`
- `password` stores bcrypt hashed passwords (not plain text)

### Analysis Model

Stores all types of health analyses.

| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `id` | String | Primary Key, CUID | Unique analysis identifier |
| `userId` | String | Foreign Key | Reference to User |
| `type` | String | Indexed | Analysis type: `face`, `report`, `risk` |
| `rawData` | Json | Required | Original raw analysis data |
| `structuredData` | Json | Optional | Processed/structured data |
| `visualMetrics` | Json | Optional | Face analysis metrics |
| `riskAssessment` | String | Optional | Risk assessment markdown |
| `problemsDetected` | Json | Optional | Array of detected problems |
| `treatments` | Json | Optional | Array of treatment recommendations |
| `createdAt` | DateTime | Default: now(), Indexed | Analysis timestamp |
| `user` | User | Relation | Related user record |

**Indexes:**
- `userId` - Fast user queries
- `type` - Fast type filtering
- `createdAt` - Fast date sorting

---

## Relationships

### Entity Relationship Diagram

<!-- DIAGRAM:DATABASE -->

### Relationship Definition

```prisma
// One-to-Many: User → Analysis
model User {
  analyses Analysis[]  // A user can have many analyses
}

model Analysis {
  userId String
  user   User @relation(fields: [userId], references: [id])
}
```

---

## Data Types

### JSON Field Structures

#### `rawData` (Report Analysis)

```typescript
interface ReportRawData {
  raw_text: string
  image_base64?: string
  filename: string
  mimeType: string
  fileSize: number
  analyzedAt: string
}
```

#### `structuredData` (Report Analysis)

```typescript
interface ReportStructuredData {
  metrics: Array<{
    name: string
    value: string
    unit: string
    status: 'normal' | 'low' | 'high' | 'critical'
    reference_range?: string
  }>
  summary?: string
}
```

#### `visualMetrics` (Face Analysis)

```typescript
interface FaceVisualMetrics {
  face_detected: boolean
  face_count: number
  redness_percentage: number
  yellowness_percentage: number
  skin_tone: string
  face_boxes?: Array<{
    x: number
    y: number
    width: number
    height: number
  }>
}
```

#### `problemsDetected`

```typescript
interface Problem {
  name: string
  type?: string
  severity: 'low' | 'moderate' | 'high' | 'critical'
  description: string
  confidence?: number
}

type ProblemsDetected = Problem[]
```

#### `treatments`

```typescript
interface Treatment {
  recommendation: string
  priority: 'low' | 'medium' | 'high'
  category?: string
}

type Treatments = Treatment[]
```

---

## Queries & Operations

### Prisma Client Setup

```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error']
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
```

### Common Operations

#### Create User

```typescript
const user = await db.user.create({
  data: {
    id: clerkUserId,  // Use Clerk ID
    email: 'user@example.com',
    password: hashedPassword,
    name: 'John Doe'
  }
})
```

#### Find User by Email

```typescript
const user = await db.user.findUnique({
  where: { email: 'user@example.com' },
  include: { analyses: true }  // Include related analyses
})
```

#### Upsert User (Create or Update)

```typescript
const user = await db.user.upsert({
  where: { id: clerkUserId },
  update: {
    email: email,
    name: name
  },
  create: {
    id: clerkUserId,
    email: email,
    password: '',  // No password for Clerk users
    name: name
  }
})
```

#### Create Analysis

```typescript
const analysis = await db.analysis.create({
  data: {
    userId: user.id,
    type: 'report',
    rawData: {
      raw_text: extractedText,
      filename: file.name
    },
    structuredData: {
      metrics: parsedMetrics,
      summary: 'Analysis summary'
    },
    problemsDetected: detectedProblems,
    treatments: recommendations
  }
})
```

#### Get User Analyses with Filtering

```typescript
// All analyses for a user
const analyses = await db.analysis.findMany({
  where: { userId: user.id },
  orderBy: { createdAt: 'desc' }
})

// Filtered by type
const reportAnalyses = await db.analysis.findMany({
  where: {
    userId: user.id,
    type: 'report'
  },
  orderBy: { createdAt: 'desc' }
})

// With pagination
const paginatedAnalyses = await db.analysis.findMany({
  where: { userId: user.id },
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' }
})
```

#### Get Single Analysis

```typescript
const analysis = await db.analysis.findUnique({
  where: { id: analysisId }
})

// With user verification
const analysis = await db.analysis.findFirst({
  where: {
    id: analysisId,
    userId: currentUserId  // Ensure ownership
  }
})
```

#### Count Analyses

```typescript
// Total count
const totalCount = await db.analysis.count({
  where: { userId: user.id }
})

// Count by type
const reportCount = await db.analysis.count({
  where: {
    userId: user.id,
    type: 'report'
  }
})
```

#### Delete Analysis

```typescript
await db.analysis.delete({
  where: { id: analysisId }
})

// Safe delete with ownership check
await db.analysis.deleteMany({
  where: {
    id: analysisId,
    userId: currentUserId
  }
})
```

#### Aggregate Queries

```typescript
// Get analysis statistics
const stats = await db.analysis.groupBy({
  by: ['type'],
  where: { userId: user.id },
  _count: { id: true }
})
// Result: [{ type: 'report', _count: { id: 5 } }, ...]
```

---

## Migrations

### Creating Migrations

```bash
# Create a migration from schema changes
npx prisma migrate dev --name add_new_field

# Create migration without applying
npx prisma migrate dev --create-only
```

### Applying Migrations

```bash
# Development (interactive)
npx prisma migrate dev

# Production (non-interactive)
npx prisma migrate deploy
```

### Migration Files

Migrations are stored in `prisma/migrations/`:

```
prisma/migrations/
├── 20240101000000_initial/
│   └── migration.sql
├── 20240115000000_add_indexes/
│   └── migration.sql
└── migration_lock.toml
```

### Reset Database (Development Only)

```bash
# WARNING: Destroys all data
npx prisma migrate reset
```

### Generate Prisma Client

After schema changes:

```bash
npx prisma generate
```

---

## Best Practices

### 1. Always Use Transactions for Related Operations

```typescript
const result = await db.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: { /* ... */ }
  })

  const analysis = await tx.analysis.create({
    data: {
      userId: user.id,
      /* ... */
    }
  })

  return { user, analysis }
})
```

### 2. Select Only Needed Fields

```typescript
// Instead of fetching entire record
const analysis = await db.analysis.findUnique({
  where: { id: analysisId },
  select: {
    id: true,
    type: true,
    createdAt: true,
    structuredData: true
    // Omit large fields like rawData
  }
})
```

### 3. Use Indexes for Frequently Queried Fields

```prisma
model Analysis {
  // ...
  @@index([userId])
  @@index([type])
  @@index([createdAt])
  @@index([userId, type])  // Composite index
}
```

### 4. Handle Connection Pooling

```typescript
// Don't create new clients per request
// Use the singleton pattern from lib/db.ts

// For serverless, consider connection limits
const db = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})
```

### 5. Validate Data Before Saving

```typescript
// Use Zod or similar for validation
import { z } from 'zod'

const AnalysisSchema = z.object({
  type: z.enum(['face', 'report', 'risk']),
  rawData: z.object({
    raw_text: z.string().optional()
  })
})

// Validate before saving
const validated = AnalysisSchema.parse(inputData)
await db.analysis.create({ data: validated })
```

### 6. Always Filter by userId

```typescript
// ALWAYS include userId in queries for security
const analysis = await db.analysis.findFirst({
  where: {
    id: analysisId,
    userId: currentUser.id  // Prevents accessing other users' data
  }
})
```

### 7. Use Soft Deletes for Important Data (Future)

```prisma
// Consider adding for audit trails
model Analysis {
  // ...
  deletedAt DateTime?  // null = active, date = deleted
}
```

---

## Prisma Studio

Visual database browser:

```bash
npx prisma studio
```

Opens browser at `http://localhost:5555` for:
- Viewing all records
- Editing data
- Testing queries
- Debugging relationships

---

## Troubleshooting

### Common Issues

**1. Connection Timeout**
```
Error: Can't reach database server
```
Solution: Check `DATABASE_URL` and network access

**2. Migration Conflicts**
```
Error: Migration failed
```
Solution: `npx prisma migrate reset` (dev only)

**3. Type Mismatches**
```
Error: Invalid `db.analysis.create()` invocation
```
Solution: Run `npx prisma generate` after schema changes

**4. Pool Exhaustion**
```
Error: Too many connections
```
Solution: Use connection pooler URL, implement singleton pattern
