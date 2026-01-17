# SehatScan AI Documentation

## What is SehatScan?

**SehatScan AI** is an innovative AI-powered health risk assessment platform designed to help users understand and monitor their health through multiple analysis modalities. The application combines medical report analysis, facial health assessment, and comprehensive risk profiling to provide actionable health insights.

### Core Mission

Transform medical reports and photos into actionable health insights using advanced AI and computer vision technology.

### Key Value Propositions

- **Instant Medical Report Analysis**: Upload lab reports and get AI-powered analysis of health metrics
- **Facial Health Assessment**: Analyze facial features for potential health indicators
- **Comprehensive Risk Profiling**: Combine multiple data sources for holistic health assessment
- **AI Health Assistant**: Interactive chatbot for health-related questions and guidance
- **Historical Tracking**: Monitor health trends over time with analysis history

---

## Table of Contents

1. [Getting Started](./setup.md) - Installation and configuration
2. [Architecture Overview](./architecture.md) - System design and structure
3. [Features Guide](./features.md) - Detailed feature documentation
4. [API Reference](./api-reference.md) - API endpoints and usage
5. [Database Schema](./database.md) - Data models and relationships
6. [Authentication](./authentication.md) - Auth system documentation
7. [AI Integration](./ai-integration.md) - AI/ML features and Gemini API
8. [UI Components](./components.md) - Component library guide

---

## Quick Overview

### Technology Stack

| Category | Technology |
|----------|------------|
| Frontend | Next.js 16, React 19, TypeScript 5 |
| Styling | Tailwind CSS 4, PostCSS |
| Database | PostgreSQL (Supabase), Prisma ORM |
| Authentication | Clerk |
| AI/ML | Google Gemini AI (Vision + Text) |
| PDF Generation | html2canvas, jsPDF |
| Charts | Recharts |
| Testing | Vitest |

### Project Structure

```
SehatScan/
├── app/                    # Next.js App Router
│   ├── actions/           # Server Actions
│   ├── api/               # API Routes
│   ├── components/        # React Components
│   ├── dashboard/         # Protected Routes
│   └── page.tsx           # Landing Page
├── lib/                   # Utility Functions
├── types/                 # TypeScript Types
├── prisma/                # Database Schema
├── public/                # Static Assets
└── docs/                  # Documentation
```

### Core Features

1. **Medical Report Scanning** - AI-powered OCR and health metric extraction
2. **Facial Health Analysis** - Visual health indicator detection
3. **Risk Assessment** - Comprehensive health risk profiling
4. **AI Health Assistant** - Context-aware conversational chatbot
5. **Analysis History** - Track and review past analyses

---

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd SehatScan

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Visit `http://localhost:3000` to access the application.

---

## Environment Variables

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."

# AI Service
GEMINI_API_KEY="your-gemini-api-key"

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
```

See [Setup Guide](./setup.md) for detailed configuration instructions.

---

## Documentation Index

| Document | Description |
|----------|-------------|
| [setup.md](./setup.md) | Complete installation and configuration guide |
| [architecture.md](./architecture.md) | System architecture and design patterns |
| [features.md](./features.md) | Detailed feature documentation |
| [api-reference.md](./api-reference.md) | REST API endpoints reference |
| [database.md](./database.md) | Database schema and models |
| [authentication.md](./authentication.md) | Authentication system guide |
| [ai-integration.md](./ai-integration.md) | AI/ML integration details |
| [components.md](./components.md) | UI component library |

---

## License

This project is proprietary software. All rights reserved.

---

## Support

For questions, issues, or feedback, please contact the development team or open an issue in the repository.
