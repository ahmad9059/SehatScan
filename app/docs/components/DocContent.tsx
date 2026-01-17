'use client'

import { MarkdownRenderer } from './MarkdownRenderer'
import {
  ArchitectureDiagram,
  ReportAnalysisFlow,
  AuthenticationFlow,
  ChatbotContextFlow,
  AIArchitectureDiagram,
  DatabaseDiagram,
  SecurityArchitectureDiagram,
} from './diagrams'

interface DocContentProps {
  content: string
  slug?: string
}

// Markers in markdown to indicate where diagrams should be inserted
const DIAGRAM_MARKERS = {
  '<!-- DIAGRAM:ARCHITECTURE -->': ArchitectureDiagram,
  '<!-- DIAGRAM:REPORT_FLOW -->': ReportAnalysisFlow,
  '<!-- DIAGRAM:AUTH_FLOW -->': AuthenticationFlow,
  '<!-- DIAGRAM:CHATBOT_FLOW -->': ChatbotContextFlow,
  '<!-- DIAGRAM:AI_ARCHITECTURE -->': AIArchitectureDiagram,
  '<!-- DIAGRAM:DATABASE -->': DatabaseDiagram,
  '<!-- DIAGRAM:SECURITY -->': SecurityArchitectureDiagram,
}

export function DocContent({ content, slug }: DocContentProps) {
  // Check if content contains diagram markers
  const hasMarkers = Object.keys(DIAGRAM_MARKERS).some(marker => content.includes(marker))

  if (!hasMarkers) {
    // No markers, render markdown as-is
    return <MarkdownRenderer content={content} />
  }

  // Split content by diagram markers and render with diagrams
  const parts: { type: 'markdown' | 'diagram'; content: string; DiagramComponent?: React.ComponentType }[] = []
  let remainingContent = content

  for (const [marker, DiagramComponent] of Object.entries(DIAGRAM_MARKERS)) {
    if (remainingContent.includes(marker)) {
      const [before, after] = remainingContent.split(marker)
      if (before.trim()) {
        parts.push({ type: 'markdown', content: before })
      }
      parts.push({ type: 'diagram', content: marker, DiagramComponent })
      remainingContent = after || ''
    }
  }

  if (remainingContent.trim()) {
    parts.push({ type: 'markdown', content: remainingContent })
  }

  return (
    <div className="doc-content">
      {parts.map((part, index) => {
        if (part.type === 'diagram' && part.DiagramComponent) {
          const DiagramComponent = part.DiagramComponent
          return <DiagramComponent key={index} />
        }
        return <MarkdownRenderer key={index} content={part.content} />
      })}
    </div>
  )
}
