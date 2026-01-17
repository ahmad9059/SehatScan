# API Reference

This document provides comprehensive documentation for all API endpoints and Server Actions available in SehatScan.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Server Actions](#server-actions)
3. [REST API Endpoints](#rest-api-endpoints)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)

---

## Authentication

All API endpoints and Server Actions require authentication unless otherwise specified. Authentication is handled via Clerk.

### Authentication Header

For REST API calls, include the Clerk session token:

```
Authorization: Bearer <clerk_session_token>
```

### Server-Side Authentication

Server Actions automatically access the Clerk session:

```typescript
import { getCurrentUser, requireAuth } from '@/lib/clerk-session'

// Get current user (returns null if not authenticated)
const user = await getCurrentUser()

// Require authentication (throws error if not authenticated)
const user = await requireAuth()
```

---

## Server Actions

Server Actions are the primary method for data mutations. They are located in `/app/actions/`.

### Scan Actions (`/app/actions/scan.ts`)

#### `analyzeReport(formData: FormData)`

Analyzes a medical report document using AI.

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | The medical report file (PDF, JPG, PNG) |

**Returns:**
```typescript
interface AnalyzeReportResult {
  success: boolean
  data?: {
    id: string
    raw_text: string
    structured_data: {
      metrics: Array<{
        name: string
        value: string
        unit: string
        status: 'normal' | 'low' | 'high' | 'critical'
        reference_range?: string
      }>
      problems_detected: Array<{
        name: string
        severity: 'low' | 'moderate' | 'high' | 'critical'
        description: string
      }>
      treatments: Array<{
        recommendation: string
        priority: 'low' | 'medium' | 'high'
      }>
      summary: string
    }
  }
  error?: string
}
```

**Usage:**
```typescript
import { analyzeReport } from '@/app/actions/scan'

const formData = new FormData()
formData.append('file', selectedFile)

const result = await analyzeReport(formData)

if (result.success) {
  console.log('Analysis:', result.data)
} else {
  console.error('Error:', result.error)
}
```

---

#### `analyzeFace(formData: FormData)`

Analyzes a face photo for health indicators.

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | Face photo (JPG, PNG only) |

**Returns:**
```typescript
interface AnalyzeFaceResult {
  success: boolean
  data?: {
    id: string
    face_detected: boolean
    face_count: number
    visual_metrics: {
      redness_percentage: number
      yellowness_percentage: number
      skin_tone: string
    }
    problems_detected: Array<{
      type: string
      severity: 'low' | 'moderate' | 'high'
      description: string
      confidence: number
    }>
    treatments: Array<{
      recommendation: string
      priority: 'low' | 'medium' | 'high'
    }>
  }
  error?: string
}
```

**Usage:**
```typescript
import { analyzeFace } from '@/app/actions/scan'

const formData = new FormData()
formData.append('file', faceImage)

const result = await analyzeFace(formData)
```

---

#### `generateRiskAssessment(formData: FormData)`

Generates a comprehensive health risk assessment.

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `age` | string | Yes | User's age |
| `gender` | string | Yes | User's gender |
| `symptoms` | string | No | Current symptoms description |
| `medicalHistory` | string | No | Past medical history |
| `medications` | string | No | Current medications |
| `reportAnalysisId` | string | No | ID of report analysis to include |
| `faceAnalysisId` | string | No | ID of face analysis to include |

**Returns:**
```typescript
interface RiskAssessmentResult {
  success: boolean
  data?: {
    id: string
    assessment: string  // Markdown formatted assessment
    createdAt: Date
  }
  error?: string
}
```

**Usage:**
```typescript
import { generateRiskAssessment } from '@/app/actions/scan'

const formData = new FormData()
formData.append('age', '45')
formData.append('gender', 'male')
formData.append('symptoms', 'Fatigue, occasional headaches')
formData.append('reportAnalysisId', 'analysis_123')

const result = await generateRiskAssessment(formData)
```

---

### Chatbot Actions (`/app/actions/chatbot.ts`)

#### `getChatbotContext()`

Retrieves context data for the AI chatbot including user profile and analysis history.

**Returns:**
```typescript
interface ChatbotContext {
  user: {
    id: string
    name: string
    email: string
    createdAt: Date
  }
  analyses: Array<{
    id: string
    type: 'face' | 'report' | 'risk'
    createdAt: Date
    structuredData: any
    visualMetrics?: any
    riskAssessment?: string
  }>
  platformKnowledge: string
}
```

**Usage:**
```typescript
import { getChatbotContext } from '@/app/actions/chatbot'

const context = await getChatbotContext()
// Use context to build AI prompt
```

---

### Profile Actions (`/app/actions/profile.ts`)

#### `updateProfile(formData: FormData)`

Updates user profile information.

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | Display name |
| `preferences` | JSON | No | User preferences object |

**Returns:**
```typescript
interface UpdateProfileResult {
  success: boolean
  error?: string
}
```

---

## REST API Endpoints

### Analysis Endpoints

#### POST `/api/analyze/report`

Analyzes a medical report document.

**Request:**
```http
POST /api/analyze/report
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <binary file data>
```

**Response:**
```json
{
  "success": true,
  "analysisId": "clx123abc456",
  "data": {
    "raw_text": "...",
    "structured_data": {
      "metrics": [...],
      "problems_detected": [...],
      "treatments": [...]
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "File too large. Maximum size is 10MB."
}
```

---

#### POST `/api/analyze/face`

Analyzes a face photo for health indicators.

**Request:**
```http
POST /api/analyze/face
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <binary image data>
```

**Response:**
```json
{
  "success": true,
  "analysisId": "clx789def012",
  "data": {
    "face_detected": true,
    "face_count": 1,
    "visual_metrics": {
      "redness_percentage": 25,
      "yellowness_percentage": 10,
      "skin_tone": "medium"
    },
    "problems_detected": [...],
    "treatments": [...]
  }
}
```

---

#### POST `/api/analyze/risk`

Generates a comprehensive risk assessment.

**Request:**
```http
POST /api/analyze/risk
Content-Type: application/json
Authorization: Bearer <token>

{
  "age": 45,
  "gender": "male",
  "symptoms": "Fatigue, headaches",
  "medicalHistory": "Hypertension",
  "medications": "Lisinopril 10mg",
  "reportAnalysisId": "clx123abc456",
  "faceAnalysisId": "clx789def012"
}
```

**Response:**
```json
{
  "success": true,
  "analysisId": "clx456ghi789",
  "data": {
    "assessment": "# Health Risk Assessment\n\n## Risk Factors...",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### Analyses CRUD Endpoints

#### GET `/api/analyses`

Retrieves user's analysis history.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | all | Filter by type: `face`, `report`, `risk` |
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 20 | Items per page |

**Request:**
```http
GET /api/analyses?type=report&page=1&limit=10
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analyses": [
      {
        "id": "clx123abc456",
        "type": "report",
        "createdAt": "2024-01-15T10:30:00Z",
        "structuredData": {...}
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

---

#### GET `/api/analyses/[id]`

Retrieves a specific analysis by ID.

**Request:**
```http
GET /api/analyses/clx123abc456
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx123abc456",
    "type": "report",
    "createdAt": "2024-01-15T10:30:00Z",
    "rawData": {...},
    "structuredData": {...},
    "problemsDetected": [...],
    "treatments": [...]
  }
}
```

---

#### DELETE `/api/analyses/[id]`

Deletes an analysis.

**Request:**
```http
DELETE /api/analyses/clx123abc456
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Analysis deleted successfully"
}
```

---

### Chatbot Endpoint

#### POST `/api/chatbot`

Sends a message to the AI health assistant.

**Request:**
```http
POST /api/chatbot
Content-Type: application/json
Authorization: Bearer <token>

{
  "message": "What did my last blood test show?",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Hello"
    },
    {
      "role": "assistant",
      "content": "Hello! How can I help you today?"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "Based on your last blood test from January 15th...",
    "timestamp": "2024-01-15T11:00:00Z"
  }
}
```

---

### User Endpoints

#### POST `/api/register`

Registers a new user (for custom auth fallback).

**Request:**
```http
POST /api/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "userId": "clx123user456"
}
```

---

#### POST `/api/forgot-password`

Initiates password reset process.

**Request:**
```http
POST /api/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If an account exists, a reset email has been sent"
}
```

---

## Error Handling

### Standard Error Response Format

All API errors follow a consistent format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful request |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid auth |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 413 | Payload Too Large | File exceeds size limit |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal error |

### Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication required |
| `AUTH_INVALID` | Invalid authentication token |
| `FILE_TOO_LARGE` | File exceeds maximum size |
| `FILE_TYPE_INVALID` | Unsupported file type |
| `ANALYSIS_NOT_FOUND` | Requested analysis doesn't exist |
| `AI_SERVICE_ERROR` | AI service unavailable |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `VALIDATION_ERROR` | Input validation failed |

### Error Handling in Client

```typescript
async function callAPI() {
  try {
    const response = await fetch('/api/analyze/report', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const error = await response.json()

      switch (response.status) {
        case 401:
          // Redirect to login
          break
        case 413:
          // Show file size error
          break
        case 429:
          // Show rate limit message
          break
        default:
          // Show generic error
      }
      return
    }

    const data = await response.json()
    // Handle success
  } catch (error) {
    // Network error
  }
}
```

---

## Rate Limiting

### Limits

| Endpoint | Rate Limit | Window |
|----------|------------|--------|
| `/api/analyze/*` | 10 requests | 1 minute |
| `/api/chatbot` | 20 requests | 1 minute |
| `/api/analyses` | 60 requests | 1 minute |
| All endpoints | 100 requests | 1 minute |

### Rate Limit Headers

Responses include rate limit information:

```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1705320000
```

### Handling Rate Limits

When rate limited, the API returns:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 45

{
  "success": false,
  "error": "Rate limit exceeded. Please try again in 45 seconds.",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

---

## TypeScript Types

### Common Types

```typescript
// Analysis types
type AnalysisType = 'face' | 'report' | 'risk'

// Severity levels
type Severity = 'low' | 'moderate' | 'high' | 'critical'

// Metric status
type MetricStatus = 'normal' | 'low' | 'high' | 'critical'

// Priority levels
type Priority = 'low' | 'medium' | 'high'

// Base analysis interface
interface Analysis {
  id: string
  userId: string
  type: AnalysisType
  rawData: any
  structuredData?: any
  visualMetrics?: any
  riskAssessment?: string
  problemsDetected?: any
  treatments?: any
  createdAt: Date
}

// API Response wrapper
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  code?: string
}
```

### Import Types

```typescript
import type {
  Analysis,
  AnalysisType,
  Severity,
  MetricStatus,
  Priority,
  ApiResponse
} from '@/types'
```

---

## SDK/Client Examples

### Fetch Wrapper

```typescript
class SehatScanClient {
  private baseUrl: string
  private token: string

  constructor(token: string) {
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    this.token = token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        ...options.headers
      }
    })

    return response.json()
  }

  async analyzeReport(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    return this.request('/api/analyze/report', {
      method: 'POST',
      body: formData
    })
  }

  async getAnalyses(type?: AnalysisType) {
    const params = type ? `?type=${type}` : ''
    return this.request(`/api/analyses${params}`)
  }
}
```

---

## Webhooks (Future)

Webhook support for async notifications is planned:

- `analysis.completed` - Analysis finished processing
- `risk.generated` - Risk assessment generated
- `alert.health` - Health alert triggered

Configuration will be available in dashboard settings.
