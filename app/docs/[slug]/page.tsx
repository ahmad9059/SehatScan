import { promises as fs } from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import { DocContent } from '../components/DocContent'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline'

// Map of slug to file name and metadata
const docPages: Record<string, { file: string; title: string; description: string }> = {
  'setup': {
    file: 'setup.md',
    title: 'Setup & Installation',
    description: 'Complete guide to setting up SehatScan locally and deploying to production',
  },
  'architecture': {
    file: 'architecture.md',
    title: 'System Architecture',
    description: 'Technical design, patterns, and system structure of SehatScan',
  },
  'features': {
    file: 'features.md',
    title: 'Features Guide',
    description: 'Detailed documentation of all SehatScan features and capabilities',
  },
  'api-reference': {
    file: 'api-reference.md',
    title: 'API Reference',
    description: 'Complete API endpoints, server actions, and integration guide',
  },
  'database': {
    file: 'database.md',
    title: 'Database Schema',
    description: 'Prisma schema, models, relationships, and database operations',
  },
  'authentication': {
    file: 'authentication.md',
    title: 'Authentication',
    description: 'Clerk integration, session management, and security practices',
  },
  'ai-integration': {
    file: 'ai-integration.md',
    title: 'AI Integration',
    description: 'Google Gemini AI, face analysis, and ML features documentation',
  },
  'components': {
    file: 'components.md',
    title: 'UI Components',
    description: 'Component library, design system, and styling patterns',
  },
}

// Navigation order for prev/next
const navOrder = [
  'setup',
  'architecture',
  'database',
  'features',
  'ai-integration',
  'api-reference',
  'authentication',
  'components',
]

export async function generateStaticParams() {
  return Object.keys(docPages).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const doc = docPages[slug]

  if (!doc) {
    return {
      title: 'Not Found - SehatScan Docs',
    }
  }

  return {
    title: `${doc.title} - SehatScan Docs`,
    description: doc.description,
  }
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const doc = docPages[slug]

  if (!doc) {
    notFound()
  }

  // Read the markdown file
  const filePath = path.join(process.cwd(), 'docs', doc.file)
  let content = ''

  try {
    content = await fs.readFile(filePath, 'utf-8')
  } catch {
    notFound()
  }

  // Get prev/next navigation
  const currentIndex = navOrder.indexOf(slug)
  const prevSlug = currentIndex > 0 ? navOrder[currentIndex - 1] : null
  const nextSlug = currentIndex < navOrder.length - 1 ? navOrder[currentIndex + 1] : null
  const prevDoc = prevSlug ? docPages[prevSlug] : null
  const nextDoc = nextSlug ? docPages[nextSlug] : null

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-[var(--color-primary-soft)] border-b border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto px-6 py-8 lg:py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-4">
            <Link
              href="/docs"
              className="text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
            >
              Docs
            </Link>
            <span className="text-[var(--color-muted)]">/</span>
            <span className="text-[var(--color-primary)] font-medium">{doc.title}</span>
          </nav>

          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-[var(--color-primary)] rounded-lg">
              <BookOpenIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[var(--color-heading)] mb-2">
            {doc.title}
          </h1>
          <p className="text-[var(--color-muted)]">
            {doc.description}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 lg:py-12">
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 lg:p-8">
          <DocContent content={content} slug={slug} />
        </div>

        {/* Navigation Footer */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {prevDoc ? (
            <Link
              href={`/docs/${prevSlug}`}
              className="group flex items-center gap-3 p-4 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl hover:border-[var(--color-primary)] hover:shadow-lg transition-all"
            >
              <ArrowLeftIcon className="w-5 h-5 text-[var(--color-muted)] group-hover:text-[var(--color-primary)] transition-colors" />
              <div>
                <p className="text-xs text-[var(--color-muted)] mb-1">Previous</p>
                <p className="font-medium text-[var(--color-heading)] group-hover:text-[var(--color-primary)] transition-colors">
                  {prevDoc.title}
                </p>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {nextDoc ? (
            <Link
              href={`/docs/${nextSlug}`}
              className="group flex items-center justify-end gap-3 p-4 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl hover:border-[var(--color-primary)] hover:shadow-lg transition-all text-right"
            >
              <div>
                <p className="text-xs text-[var(--color-muted)] mb-1">Next</p>
                <p className="font-medium text-[var(--color-heading)] group-hover:text-[var(--color-primary)] transition-colors">
                  {nextDoc.title}
                </p>
              </div>
              <ArrowRightIcon className="w-5 h-5 text-[var(--color-muted)] group-hover:text-[var(--color-primary)] transition-colors" />
            </Link>
          ) : (
            <div />
          )}
        </div>

        {/* Back to Docs */}
        <div className="mt-8 text-center">
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Documentation
          </Link>
        </div>
      </div>
    </div>
  )
}
