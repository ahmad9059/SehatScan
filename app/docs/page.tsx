import { promises as fs } from 'fs'
import path from 'path'
import { MarkdownRenderer } from './components/MarkdownRenderer'
import Link from 'next/link'
import {
  BookOpenIcon,
  CubeTransparentIcon,
  SparklesIcon,
  CodeBracketIcon,
  CircleStackIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  WrenchScrewdriverIcon,
  SwatchIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'

const quickLinks = [
  {
    title: 'Setup & Installation',
    description: 'Get SehatScan running locally in minutes',
    href: '/docs/setup',
    icon: WrenchScrewdriverIcon,
    color: 'bg-blue-500',
  },
  {
    title: 'System Architecture',
    description: 'Understand the technical design and patterns',
    href: '/docs/architecture',
    icon: CubeTransparentIcon,
    color: 'bg-purple-500',
  },
  {
    title: 'Features Guide',
    description: 'Explore all platform features in detail',
    href: '/docs/features',
    icon: SparklesIcon,
    color: 'bg-amber-500',
  },
  {
    title: 'API Reference',
    description: 'Complete API documentation and examples',
    href: '/docs/api-reference',
    icon: CodeBracketIcon,
    color: 'bg-green-500',
  },
  {
    title: 'AI Integration',
    description: 'Learn about Gemini AI and ML features',
    href: '/docs/ai-integration',
    icon: CpuChipIcon,
    color: 'bg-pink-500',
  },
  {
    title: 'Authentication',
    description: 'Clerk integration and security patterns',
    href: '/docs/authentication',
    icon: ShieldCheckIcon,
    color: 'bg-red-500',
  },
]

export default async function DocsPage() {
  // Read the README.md content
  const filePath = path.join(process.cwd(), 'docs', 'README.md')
  let content = ''

  try {
    content = await fs.readFile(filePath, 'utf-8')
  } catch {
    content = '# Documentation\n\nWelcome to SehatScan documentation.'
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-[var(--color-primary-soft)] border-b border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto px-6 py-12 lg:py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[var(--color-primary)] rounded-lg">
              <BookOpenIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-[var(--color-primary)]">Documentation</span>
          </div>
          <h1 className="text-4xl font-bold text-[var(--color-heading)] mb-4">
            SehatScan Documentation
          </h1>
          <p className="text-lg text-[var(--color-muted)] max-w-2xl">
            Comprehensive guides and references to help you build with SehatScan AI health platform.
            From quick start to advanced integrations.
          </p>
        </div>
      </div>

      {/* Quick Links Grid */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-xl font-semibold text-[var(--color-heading)] mb-6">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-start gap-4 p-4 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl hover:border-[var(--color-primary)] hover:shadow-lg transition-all"
            >
              <div className={`p-2 ${link.color} rounded-lg flex-shrink-0`}>
                <link.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-[var(--color-heading)] group-hover:text-[var(--color-primary)] transition-colors flex items-center gap-2">
                  {link.title}
                  <ArrowRightIcon className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h3>
                <p className="text-sm text-[var(--color-muted)] mt-1">{link.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Main Content */}
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 lg:p-8">
          <MarkdownRenderer content={content} />
        </div>
      </div>
    </div>
  )
}
