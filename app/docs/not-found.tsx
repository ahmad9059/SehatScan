import Link from 'next/link'
import { DocumentMagnifyingGlassIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function DocsNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-[var(--color-primary-soft)] rounded-full flex items-center justify-center mx-auto mb-6">
          <DocumentMagnifyingGlassIcon className="w-8 h-8 text-[var(--color-primary)]" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-heading)] mb-2">
          Page Not Found
        </h1>
        <p className="text-[var(--color-muted)] mb-6">
          The documentation page you're looking for doesn't exist or may have been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/docs"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-strong)] transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Docs
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-surface)] text-[var(--color-foreground)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-primary-soft)] transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
