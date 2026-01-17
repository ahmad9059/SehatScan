import { DocsSidebar } from './components/DocsSidebar'

export const metadata = {
  title: 'Documentation - SehatScan',
  description: 'Comprehensive documentation for SehatScan AI health platform',
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] docs-font">
      <div className="flex">
        {/* Sidebar */}
        <DocsSidebar />

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
