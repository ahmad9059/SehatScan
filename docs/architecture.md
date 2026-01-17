# System Architecture

This document provides a comprehensive overview of SehatScan's system architecture, design patterns, and technical decisions.

---

## High-Level Architecture

<!-- DIAGRAM:ARCHITECTURE -->

---

## Directory Structure

```
SehatScan/
├── app/                          # Next.js App Router (main application)
│   ├── actions/                  # Server Actions for data mutations
│   │   ├── scan.ts              # Analysis operations (face, report, risk)
│   │   ├── chatbot.ts           # Chatbot context retrieval
│   │   └── profile.ts           # User profile operations
│   │
│   ├── api/                      # REST API Routes
│   │   ├── analyze/             # Analysis endpoints
│   │   │   ├── face/            # Facial analysis
│   │   │   ├── report/          # Medical report analysis
│   │   │   └── risk/            # Risk assessment
│   │   ├── analyses/            # CRUD for analyses
│   │   ├── chatbot/             # AI chatbot endpoint
│   │   ├── register/            # User registration
│   │   └── forgot-password/     # Password recovery
│   │
│   ├── components/              # Shared React components (27+)
│   │   ├── Navbar.tsx           # Navigation bar
│   │   ├── Footer.tsx           # Page footer
│   │   ├── Hero.tsx             # Landing page hero
│   │   ├── Features.tsx         # Feature showcase
│   │   ├── ThemeToggle.tsx      # Dark/light mode switch
│   │   ├── LanguageSelector.tsx # Multi-language support
│   │   └── ...                  # Additional components
│   │
│   ├── dashboard/               # Protected dashboard routes
│   │   ├── page.tsx             # Dashboard home
│   │   ├── layout.tsx           # Dashboard layout wrapper
│   │   ├── scan-face/           # Facial analysis page
│   │   ├── scan-report/         # Medical report scan page
│   │   ├── risk-assessment/     # Risk assessment generator
│   │   ├── chatbot/             # AI health assistant
│   │   ├── history/             # Analysis history
│   │   ├── profile/             # User profile settings
│   │   ├── settings/            # App settings
│   │   ├── notifications/       # User notifications
│   │   ├── security/            # Security settings
│   │   └── help/                # Help documentation
│   │
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Landing page
│   └── globals.css              # Global styles with CSS variables
│
├── lib/                         # Utility functions and services
│   ├── db.ts                    # Prisma client singleton
│   ├── auth.ts                  # Password hashing utilities
│   ├── clerk-session.ts         # Clerk auth helpers
│   ├── gemini.ts                # Google Gemini AI integration
│   ├── gemini-mock.ts           # Mock AI for fallback
│   ├── face-analysis-server.ts  # Server-side face analysis
│   ├── analysis.ts              # Analysis CRUD operations
│   ├── validation.ts            # Form validation utilities
│   ├── toast.ts                 # Toast notification helpers
│   └── env-validation.ts        # Environment variable checks
│
├── types/                       # TypeScript type definitions
│   └── index.ts                 # Shared type interfaces
│
├── prisma/                      # Database configuration
│   └── schema.prisma            # Prisma schema definition
│
├── public/                      # Static assets
│   └── images/                  # Image assets
│
└── Configuration Files
    ├── next.config.ts           # Next.js configuration
    ├── tailwind.config.js       # Tailwind CSS configuration
    ├── tsconfig.json            # TypeScript configuration
    ├── postcss.config.mjs       # PostCSS configuration
    └── vitest.config.ts         # Testing configuration
```

---

## Core Architectural Patterns

### 1. Server Actions Pattern

Server Actions provide type-safe, secure server-side operations directly callable from React components.

```typescript
// app/actions/scan.ts
'use server'

export async function analyzeReport(formData: FormData) {
  // 1. Validate authentication
  const user = await requireAuth()

  // 2. Extract and validate input
  const file = formData.get('file') as File

  // 3. Process with AI service
  const result = await geminiAnalyzer.structureOcrData(base64Data)

  // 4. Persist to database
  const analysis = await saveAnalysis(user.id, 'report', result)

  // 5. Return typed response
  return { success: true, data: analysis }
}
```

**Benefits:**
- Type safety between client and server
- Automatic form data handling
- Built-in error boundaries
- Progressive enhancement support

### 2. API Routes Pattern

REST API endpoints for external integrations and complex operations.

```typescript
// app/api/analyze/report/route.ts
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Process request
    const formData = await request.formData()
    const result = await processReport(formData)

    // Return response
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
```

### 3. Repository Pattern

Database operations abstracted through dedicated service functions.

```typescript
// lib/analysis.ts
export async function getUserAnalyses(
  userId: string,
  type?: 'face' | 'report' | 'risk'
): Promise<Analysis[]> {
  return db.analysis.findMany({
    where: {
      userId,
      ...(type && { type })
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function saveAnalysis(
  userId: string,
  type: string,
  data: AnalysisData
): Promise<Analysis> {
  return db.analysis.create({
    data: {
      userId,
      type,
      rawData: data.raw,
      structuredData: data.structured
    }
  })
}
```

### 4. Service Layer Pattern

External service integrations encapsulated in dedicated modules.

```typescript
// lib/gemini.ts
class GeminiAnalyzer {
  private client: GoogleGenerativeAI
  private model: GenerativeModel

  async structureOcrData(imageBase64: string): Promise<AnalysisResult> {
    const result = await this.model.generateContent([
      this.systemPrompt,
      { inlineData: { mimeType: 'image/jpeg', data: imageBase64 }}
    ])
    return this.parseResponse(result)
  }

  async generateRiskAssessment(context: RiskContext): Promise<string> {
    // AI-powered risk analysis
  }
}
```

---

## Data Flow Diagrams

### Medical Report Analysis Flow

<!-- DIAGRAM:REPORT_FLOW -->

### Authentication Flow

<!-- DIAGRAM:AUTH_FLOW -->

### Chatbot Context Flow

<!-- DIAGRAM:CHATBOT_FLOW -->

---

## State Management

### Server State (Primary)

The application uses a **server-first** state management approach:

- **Database (PostgreSQL)**: Source of truth for all persistent data
- **Prisma ORM**: Type-safe database access
- **Server Actions**: Data mutations and queries

### Client State

Minimal client state managed through React hooks:

```typescript
// Form state
const [file, setFile] = useState<File | null>(null)
const [isLoading, setIsLoading] = useState(false)

// UI state
const [activeTab, setActiveTab] = useState('overview')
const [isMenuOpen, setIsMenuOpen] = useState(false)
```

### Authentication State

Managed by Clerk SDK:

```typescript
// Clerk provides these hooks
const { user, isSignedIn, isLoading } = useUser()
const { signIn, signOut } = useClerk()
```

---

## Security Architecture

### Authentication Layers

<!-- DIAGRAM:SECURITY -->

### Input Validation

```typescript
// File validation
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf']

function validateFile(file: File): boolean {
  if (file.size > MAX_FILE_SIZE) return false
  if (!ALLOWED_TYPES.includes(file.type)) return false
  return true
}

// Database queries use Prisma (SQL injection protected)
const analysis = await db.analysis.findUnique({
  where: { id: analysisId, userId: user.id } // Parameterized
})
```

---

## Error Handling Strategy

### Layered Error Handling

```typescript
// 1. API/Action Level
export async function analyzeReport(formData: FormData) {
  try {
    // Main logic
  } catch (error) {
    console.error('Analysis failed:', error)
    return { success: false, error: 'Analysis failed. Please try again.' }
  }
}

// 2. Service Level (with fallback)
async function callGeminiAPI(data: string) {
  try {
    return await gemini.analyze(data)
  } catch (error) {
    if (error.status === 429) {
      // Rate limit - use mock fallback
      return mockAnalyzer.analyze(data)
    }
    throw error
  }
}

// 3. Component Level
function AnalysisPage() {
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    try {
      const result = await analyzeReport(formData)
      if (!result.success) {
        setError(result.error)
      }
    } catch {
      setError('An unexpected error occurred')
    }
  }
}
```

### Error Boundaries

```typescript
// Dashboard uses error boundaries for graceful degradation
<ErrorBoundary fallback={<ErrorFallback />}>
  <DashboardContent />
</ErrorBoundary>
```

---

## Performance Considerations

### Database Optimization

- **Connection Pooling**: Supabase connection pooler for efficient connections
- **Pagination**: Large datasets use cursor-based pagination
- **Selective Queries**: Only fetch required fields

```typescript
// Paginated query example
export async function getUserAnalysesPaginated(
  userId: string,
  page: number,
  limit: number
) {
  const skip = (page - 1) * limit
  return db.analysis.findMany({
    where: { userId },
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' }
  })
}
```

### API Optimization

- **File Size Limits**: 10MB max prevents large uploads
- **Image Preprocessing**: Validation before API calls
- **Timeout Handling**: Configurable timeouts for AI calls
- **Mock Fallback**: Ensures availability during API issues

### Frontend Optimization

- **Server Components**: Default for non-interactive content
- **Client Components**: Only where interactivity needed
- **Dynamic Imports**: Lazy loading for heavy components
- **Image Optimization**: Next.js Image component

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        VERCEL EDGE                          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                   Next.js Application                    ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     ││
│  │  │   Pages     │  │    API      │  │   Static    │     ││
│  │  │   (SSR)     │  │   Routes    │  │   Assets    │     ││
│  │  └─────────────┘  └─────────────┘  └─────────────┘     ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│    Supabase     │ │     Clerk       │ │  Google Cloud   │
│   PostgreSQL    │ │  Authentication │ │   Gemini API    │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

---

## Technology Rationale

| Technology | Why Chosen |
|------------|------------|
| **Next.js 16** | Server components, app router, excellent DX |
| **React 19** | Latest features, concurrent rendering |
| **TypeScript** | Type safety, better tooling, reduced bugs |
| **Tailwind CSS** | Rapid styling, consistent design system |
| **Prisma** | Type-safe ORM, excellent migrations |
| **PostgreSQL** | Reliable, scalable, JSON support |
| **Clerk** | Modern auth, easy integration, security |
| **Gemini AI** | Multimodal (vision + text), cost-effective |
| **Vercel** | Seamless Next.js deployment, edge network |

---

## Future Architecture Considerations

1. **Microservices**: Separate analysis services for scaling
2. **Message Queue**: Async processing for heavy analysis
3. **Caching Layer**: Redis for frequent queries
4. **CDN**: Image optimization and delivery
5. **WebSocket**: Real-time updates for analysis status
6. **Mobile App**: React Native for native experience
