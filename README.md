<p align="center">
  <img src="https://sehat-scan.vercel.app/logo.svg" alt="SehatScan Logo" width="120" height="120">
</p>

<h1 align="center">SehatScan AI</h1>

<p align="center">
  <strong>Intelligent Health Risk Assessment Platform</strong>
</p>

<p align="center">
  A comprehensive medical analysis platform that combines AI-powered document processing, facial health detection, and personalized risk assessment to provide actionable health insights.
</p>

<p align="center">
  <a href="#features">Features</a> |
  <a href="#tech-stack">Tech Stack</a> |
  <a href="#getting-started">Getting Started</a> |
  <a href="#documentation">Documentation</a> |
  <a href="#api-reference">API Reference</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind">
  <img src="https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma" alt="Prisma">
  <img src="https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=flat-square&logo=postgresql" alt="PostgreSQL">
</p>

---

## Overview

SehatScan AI is a modern health risk assessment platform that leverages Google's Gemini Vision API to analyze medical documents and facial images. The platform extracts health metrics, detects potential conditions, and generates personalized treatment recommendations based on evidence-based medical knowledge.

### Key Capabilities

- **Medical Report Analysis**: Upload lab reports, prescriptions, or medical documents for AI-powered extraction of health metrics with status indicators (normal, low, high, critical)
- **Facial Health Detection**: Analyze facial images for skin conditions including acne, rosacea, hyperpigmentation, dark circles, and more with precise location mapping
- **Risk Assessment Engine**: Combine multiple data sources (reports, facial analysis, symptoms, medical history) to generate comprehensive health risk profiles
- **AI Health Assistant**: Context-aware chatbot that answers health questions based on your analysis history

---

## Features

### Medical Document Analysis

| Feature | Description |
|---------|-------------|
| Multi-format Support | Process PDF, JPG, and PNG medical documents |
| Intelligent OCR | Gemini Vision API extracts text with high accuracy |
| Metric Extraction | Automatically identifies health metrics with reference ranges |
| Status Detection | Classifies values as normal, low, high, or critical |
| Problem Detection | Identifies health concerns with severity levels |
| Treatment Recommendations | Generates actionable, evidence-based treatment plans |

### Facial Health Analysis

| Feature | Description |
|---------|-------------|
| Face Detection | Accurate face localization with bounding boxes |
| Skin Condition Detection | Identifies 15+ skin conditions with confidence scores |
| Location Mapping | Pinpoints problem areas (forehead, cheeks, T-zone, etc.) |
| Severity Assessment | Classifies conditions as mild, moderate, or severe |
| Visual Annotations | Color-coded overlays showing detected problem areas |
| Personalized Treatments | Specific product and ingredient recommendations |

### Supported Skin Conditions

- Acne and Breakouts
- Rosacea
- Hyperpigmentation
- Dark Circles
- Dry Skin
- Oily Skin
- Wrinkles and Fine Lines
- Eczema
- Psoriasis
- Blackheads and Whiteheads
- Age Spots and Sunspots
- Melasma

### Risk Assessment

- Combines medical report data with facial analysis
- Incorporates user demographics and symptoms
- Considers medical history and current medications
- Generates comprehensive markdown-formatted reports
- Supports PDF export for sharing with healthcare providers

### Dashboard Features

- Real-time analysis statistics
- Analysis history with filtering
- Interactive data visualizations
- Secure profile management
- Notification system
- Dark/Light theme support

---

## Tech Stack

### Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.0.8 | React framework with App Router |
| React | 19.2.3 | UI component library |
| TypeScript | 5 | Type-safe development |
| Tailwind CSS | 4 | Utility-first styling |

### Backend Services

| Technology | Version | Purpose |
|------------|---------|---------|
| Prisma | 6.12.0 | Database ORM |
| PostgreSQL | - | Primary database (Supabase) |
| Redis | - | Caching layer (ioredis) |
| Clerk | 6.36.5 | Authentication |

### AI and Processing

| Technology | Version | Purpose |
|------------|---------|---------|
| Google Generative AI | 0.24.1 | Gemini Vision API |
| Tesseract.js | 6.0.1 | Fallback OCR |
| jsPDF | 3.0.4 | PDF generation |
| html2canvas | 1.4.1 | Report screenshots |

### UI Components

| Technology | Version | Purpose |
|------------|---------|---------|
| Heroicons | 2.2.0 | Icon system |
| Recharts | 3.5.1 | Data visualization |
| Headless UI | 2.2.9 | Accessible components |
| React Hot Toast | 2.6.0 | Notifications |

---

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn package manager
- PostgreSQL database (Supabase recommended)
- Google Cloud account with Gemini API access
- Clerk account for authentication

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/sehatscan.git
cd sehatscan
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://user:password@host:port/database?pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:port/database"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# AI Service (Google Gemini)
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-2.5-flash"

# Caching (Optional)
REDIS_URL="redis://user:password@host:port"

# Supabase (Optional)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

4. **Initialize the database**

```bash
npx prisma generate
npx prisma db push
```

5. **Start the development server**

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

---

## Project Structure

```
sehatscan/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── analyze/
│   │   │   ├── report/           # Medical report analysis
│   │   │   ├── face/             # Facial analysis
│   │   │   └── risk/             # Risk assessment
│   │   ├── analyses/             # CRUD operations
│   │   └── chatbot/              # AI assistant
│   ├── dashboard/                # Protected routes
│   │   ├── scan-report/          # Report upload page
│   │   ├── scan-face/            # Face scan page
│   │   ├── risk-assessment/      # Risk assessment page
│   │   ├── chatbot/              # AI chatbot page
│   │   ├── history/              # Analysis history
│   │   └── profile/              # User profile
│   ├── docs/                     # Documentation pages
│   ├── components/               # Reusable components
│   └── actions/                  # Server actions
├── lib/                          # Utility libraries
│   ├── gemini.ts                 # Gemini API integration
│   ├── face-analysis-server.ts   # Face analysis logic
│   ├── clerk-session.ts          # Auth utilities
│   ├── db.ts                     # Database client
│   ├── redis.ts                  # Cache utilities
│   └── validation.ts             # Input validation
├── prisma/
│   └── schema.prisma             # Database schema
├── public/                       # Static assets
└── docs/                         # Markdown documentation
```

---

## Database Schema

### User Model

```prisma
model User {
  id        String     @id @default(cuid())
  email     String     @unique
  password  String
  name      String?
  createdAt DateTime   @default(now())
  analyses  Analysis[]
}
```

### Analysis Model

```prisma
model Analysis {
  id               String   @id @default(cuid())
  userId           String
  type             String   // "report" | "face" | "risk"
  rawData          Json
  structuredData   Json?
  visualMetrics    Json?
  riskAssessment   String?
  problemsDetected Json?
  treatments       Json?
  createdAt        DateTime @default(now())
  user             User     @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([userId, type])
  @@index([userId, createdAt(sort: Desc)])
}
```

---

## API Reference

### Analysis Endpoints

#### Analyze Medical Report

```http
POST /api/analyze/report
Content-Type: multipart/form-data

file: <medical-document>
```

**Response**

```json
{
  "success": true,
  "data": {
    "metrics": [
      {
        "name": "Hemoglobin",
        "value": "14.5",
        "unit": "g/dL",
        "status": "normal",
        "reference_range": "12-16"
      }
    ],
    "problems_detected": [],
    "treatments": [],
    "summary": "Overall health status summary"
  }
}
```

#### Analyze Face Image

```http
POST /api/analyze/face
Content-Type: multipart/form-data

file: <face-image>
```

**Response**

```json
{
  "success": true,
  "data": {
    "face_detected": true,
    "faces_count": 1,
    "faces": [
      { "x": 100, "y": 50, "width": 200, "height": 250, "label": "Face" }
    ],
    "problem_areas": [
      { "x": 120, "y": 80, "width": 40, "height": 30, "label": "Acne" }
    ],
    "visual_metrics": {
      "redness_percentage": 15,
      "yellowness_percentage": 5,
      "overall_skin_health": "fair",
      "skin_tone_analysis": "Normal skin tone with mild redness in T-zone"
    },
    "problems_detected": [
      {
        "type": "Acne",
        "severity": "mild",
        "confidence": 0.85,
        "description": "Mild acne observed on forehead",
        "location": "Forehead"
      }
    ],
    "treatments": [
      {
        "category": "Skincare",
        "recommendation": "Use salicylic acid cleanser twice daily",
        "priority": "high",
        "timeframe": "Daily",
        "for_condition": "Acne"
      }
    ]
  }
}
```

#### Generate Risk Assessment

```http
POST /api/analyze/risk
Content-Type: application/json

{
  "reportAnalysis": { ... },
  "faceAnalysis": { ... },
  "userData": {
    "age": 35,
    "gender": "male",
    "symptoms": ["fatigue", "headache"],
    "medicalHistory": "No significant history"
  }
}
```

### History Endpoints

#### Get User Analyses

```http
GET /api/analyses
Authorization: Bearer <token>
```

#### Get Analyses by Type

```http
GET /api/analyses/user?type=report
Authorization: Bearer <token>
```

### Chatbot Endpoint

```http
POST /api/chatbot
Content-Type: application/json

{
  "message": "What do my recent test results indicate?",
  "history": []
}
```

---

## Caching Strategy

SehatScan implements a multi-layer caching strategy using Redis:

| Cache Type | TTL | Description |
|------------|-----|-------------|
| User Data | 1 hour | User profile and authentication |
| Dashboard Stats | 5 minutes | Analysis counts and metrics |
| Recent Analyses | 2 minutes | Analysis list for history page |
| Individual Analysis | 1 minute | Single analysis details |

---

## Security

### Authentication

- Clerk-based authentication with session management
- Automatic user synchronization to PostgreSQL
- Protected API routes with middleware validation

### Data Protection

- User-scoped database queries
- File validation (type, size, extension)
- Environment variable validation on startup
- Safe error messages without sensitive data exposure

### Input Validation

- Server-side validation for all inputs
- File size limits (10MB maximum)
- Allowed file types enforcement
- Sanitized error responses

---

## Testing

Run the test suite:

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run test suite |
| `npx prisma studio` | Open database GUI |
| `npx prisma db push` | Push schema changes |
| `npx prisma generate` | Generate Prisma client |

---

## Documentation

Comprehensive documentation is available in the `/docs` directory:

| Document | Description |
|----------|-------------|
| [Setup Guide](docs/setup.md) | Installation and configuration |
| [Architecture](docs/architecture.md) | System design and patterns |
| [Database](docs/database.md) | Schema and relationships |
| [API Reference](docs/api-reference.md) | Endpoint documentation |
| [Authentication](docs/authentication.md) | Auth flow and security |
| [AI Integration](docs/ai-integration.md) | Gemini API usage |
| [Components](docs/components.md) | UI component library |
| [Features](docs/features.md) | Feature breakdown |

---

## Performance

### Optimizations

- React Server Components for reduced client bundle
- Redis caching reduces database queries by 80%+
- Database indexing on frequently queried columns
- Dynamic imports for heavy components
- Image optimization with Next.js Image component
- Connection pooling via Supabase

### Benchmarks

| Operation | Average Time |
|-----------|--------------|
| Report Analysis | 3-5 seconds |
| Face Analysis | 2-4 seconds |
| Risk Assessment | 4-6 seconds |
| Dashboard Load | < 500ms (cached) |

---

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy with automatic builds on push

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Requirements

- Node.js 18+
- PostgreSQL 14+
- Redis 6+ (optional)
- 512MB+ RAM

---

## Contributing

Contributions are welcome. Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use ESLint configuration provided
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Google Gemini](https://ai.google.dev/) - AI and Vision API
- [Clerk](https://clerk.com/) - Authentication Platform
- [Supabase](https://supabase.com/) - Database and Backend Services
- [Prisma](https://www.prisma.io/) - Database Toolkit
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
- [Vercel](https://vercel.com/) - Deployment Platform

---

<p align="center">
  Built with precision for better health insights
</p>

<p align="center">
  <a href="#sehatscan-ai">Back to Top</a>
</p>
