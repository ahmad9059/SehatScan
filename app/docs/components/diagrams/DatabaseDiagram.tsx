'use client'

import { Node, Edge, MarkerType } from '@xyflow/react'
import { DiagramWrapper } from './DiagramWrapper'

const tableStyle = {
  borderRadius: '8px',
  fontSize: '11px',
  fontWeight: 500,
  padding: '0',
  fontFamily: 'var(--font-heading), Poppins, sans-serif',
  background: 'var(--color-card)',
  border: '2px solid var(--color-border)',
  width: 200,
}

const headerStyle = {
  background: 'var(--color-primary)',
  color: 'white',
  padding: '8px 12px',
  borderRadius: '6px 6px 0 0',
  fontWeight: 600,
  fontSize: '12px',
}

const fieldStyle = {
  padding: '6px 12px',
  borderBottom: '1px solid var(--color-border)',
  fontSize: '11px',
}

const UserTable = () => (
  <div style={tableStyle}>
    <div style={headerStyle}>👤 User</div>
    <div style={fieldStyle}>🔑 id: String (PK)</div>
    <div style={fieldStyle}>📧 email: String (UNIQUE)</div>
    <div style={fieldStyle}>🔒 password: String</div>
    <div style={fieldStyle}>📝 name: String?</div>
    <div style={{ ...fieldStyle, borderBottom: 'none' }}>📅 createdAt: DateTime</div>
  </div>
)

const AnalysisTable = () => (
  <div style={tableStyle}>
    <div style={headerStyle}>🔬 Analysis</div>
    <div style={fieldStyle}>🔑 id: String (PK)</div>
    <div style={fieldStyle}>🔗 userId: String (FK)</div>
    <div style={fieldStyle}>📋 type: String</div>
    <div style={fieldStyle}>📦 rawData: Json</div>
    <div style={fieldStyle}>📊 structuredData: Json?</div>
    <div style={fieldStyle}>👁️ visualMetrics: Json?</div>
    <div style={fieldStyle}>⚠️ riskAssessment: String?</div>
    <div style={fieldStyle}>🚨 problemsDetected: Json?</div>
    <div style={fieldStyle}>💊 treatments: Json?</div>
    <div style={{ ...fieldStyle, borderBottom: 'none' }}>📅 createdAt: DateTime</div>
  </div>
)

const nodes: Node[] = [
  {
    id: 'user-table',
    position: { x: 50, y: 50 },
    data: { label: <UserTable /> },
    style: { background: 'transparent', border: 'none', padding: 0 },
  },
  {
    id: 'analysis-table',
    position: { x: 350, y: 50 },
    data: { label: <AnalysisTable /> },
    style: { background: 'transparent', border: 'none', padding: 0 },
  },
  {
    id: 'relation-label',
    position: { x: 260, y: 120 },
    data: { label: '1:N' },
    style: {
      background: 'var(--color-primary-soft)',
      border: '1px solid var(--color-primary)',
      color: 'var(--color-primary)',
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 600,
    },
  },
]

const edges: Edge[] = [
  {
    id: 'user-analysis',
    source: 'user-table',
    target: 'analysis-table',
    type: 'smoothstep',
    sourceHandle: 'right',
    targetHandle: 'left',
    style: { stroke: 'var(--color-primary)', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-primary)' },
    label: 'has many',
    labelStyle: { fontSize: 10, fill: 'var(--color-muted)' },
    labelBgStyle: { fill: 'var(--color-card)' },
  },
]

export function DatabaseDiagram() {
  return (
    <DiagramWrapper
      nodes={nodes}
      edges={edges}
      title="Entity Relationship Diagram"
      height="400px"
    />
  )
}
