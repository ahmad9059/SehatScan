'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
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
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
} from '@heroicons/react/24/outline'

const docSections = [
  {
    title: 'Getting Started',
    items: [
      { name: 'Overview', href: '/docs', icon: BookOpenIcon },
      { name: 'Setup & Installation', href: '/docs/setup', icon: WrenchScrewdriverIcon },
    ],
  },
  {
    title: 'Architecture',
    items: [
      { name: 'System Architecture', href: '/docs/architecture', icon: CubeTransparentIcon },
      { name: 'Database Schema', href: '/docs/database', icon: CircleStackIcon },
    ],
  },
  {
    title: 'Features',
    items: [
      { name: 'Features Guide', href: '/docs/features', icon: SparklesIcon },
      { name: 'AI Integration', href: '/docs/ai-integration', icon: CpuChipIcon },
    ],
  },
  {
    title: 'Reference',
    items: [
      { name: 'API Reference', href: '/docs/api-reference', icon: CodeBracketIcon },
      { name: 'Authentication', href: '/docs/authentication', icon: ShieldCheckIcon },
      { name: 'UI Components', href: '/docs/components', icon: SwatchIcon },
    ],
  },
]

export function DocsSidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-[var(--color-border)]">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.svg" alt="SehatScan" className="h-9 w-auto" />
          <span className="font-bold text-xl text-[var(--color-heading)] font-[var(--font-heading)]">
            Sehat<span className="text-[var(--color-primary)]">Scan</span>
          </span>
        </Link>
        <div className="flex items-center gap-2 mt-2">
          <p className="text-sm text-[var(--color-muted)]">Documentation</p>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-primary-soft)] text-[var(--color-primary)] font-medium">
            v1.0
          </span>
        </div>
      </div>

      {/* Back to App */}
      <div className="px-4 py-3 border-b border-[var(--color-border)]">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
        >
          <HomeIcon className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-6 overflow-y-auto flex-1">
        {docSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-2 px-3">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all
                        ${isActive
                          ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)] font-medium'
                          : 'text-[var(--color-foreground)] hover:bg-[var(--color-surface)]'
                        }
                      `}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[var(--color-primary)] rounded-r" />
                      )}
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-subtle)]'}`} />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-muted)] text-center">
          © 2026 SehatScan AI
        </p>
        <p className="text-[10px] text-[var(--color-subtle)] text-center mt-1">
          Health Intelligence Platform
        </p>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[var(--color-card)] rounded-lg shadow-lg border border-[var(--color-border)]"
      >
        <Bars3Icon className="w-6 h-6 text-[var(--color-foreground)]" />
      </button>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`
          lg:hidden fixed top-0 left-0 h-full w-72 bg-[var(--color-card)] border-r border-[var(--color-border)]
          transform transition-transform duration-300 z-50 flex flex-col
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="absolute top-4 right-4 p-2 hover:bg-[var(--color-surface)] rounded-lg"
        >
          <XMarkIcon className="w-5 h-5 text-[var(--color-muted)]" />
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:top-0 lg:left-0 lg:h-screen bg-[var(--color-card)] border-r border-[var(--color-border)]">
        <SidebarContent />
      </aside>

      {/* Spacer for desktop */}
      <div className="hidden lg:block lg:w-72 lg:flex-shrink-0" />
    </>
  )
}
