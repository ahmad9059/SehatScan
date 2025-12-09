# SehatScan AI - Frontend

This is the Next.js frontend for SehatScan AI, a health risk assessment platform that combines Python-based Digital Image Processing and OCR with AI-powered analysis.

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database ORM**: Prisma
- **Database**: Supabase (Managed PostgreSQL)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (for database)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:
   Create a `.env` file in the root directory:

```env
DATABASE_URL="your-supabase-connection-string"
PYTHON_ENGINE_URL="http://localhost:8000"
```

3. Set up Prisma and database:

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed instructions.

Quick setup:

```bash
npm run prisma:migrate
npm run prisma:generate
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── actions/           # Server Actions for API calls
│   ├── components/        # React components
│   ├── globals.css        # Global styles with Tailwind
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── lib/                   # Utility functions and helpers
├── prisma/                # Prisma schema and migrations
│   └── schema.prisma      # Database schema
└── public/                # Static assets

```

## Features

- 🎨 Beautiful landing page with animations
- 📊 Medical report analysis with OCR
- 👤 Facial analysis for health indicators
- 🤖 AI-powered risk assessments
- 💾 Database persistence with Supabase
- 🔐 User authentication (coming soon)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
