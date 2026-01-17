'use client'

import { Node, Edge, MarkerType, Position } from '@xyflow/react'
import { DiagramWrapper } from './DiagramWrapper'

const nodeStyle = {
  borderRadius: '8px',
  fontSize: '11px',
  fontWeight: 500,
  padding: '10px 14px',
  fontFamily: 'var(--font-heading), Poppins, sans-serif',
}

const layerStyle = {
  background: 'var(--color-card)',
  border: '2px solid var(--color-border)',
  borderRadius: '12px',
}

// Database Architecture Diagram nodes
const archNodes: Node[] = [
  // Application Layer
  {
    id: 'app-layer',
    position: { x: 50, y: 0 },
    data: { label: 'APPLICATION' },
    style: { ...layerStyle, width: 480, height: 110, background: 'rgba(59, 130, 246, 0.05)' },
  },
  {
    id: 'prisma-client',
    position: { x: 150, y: 45 },
    data: { label: '🔷 Prisma Client (Type-safe queries)' },
    style: { ...nodeStyle, background: '#dbeafe', border: '1px solid #3b82f6', color: '#1e40af' },
  },

  // Supabase Pooler Layer
  {
    id: 'pooler-layer',
    position: { x: 50, y: 160 },
    data: { label: 'SUPABASE POOLER' },
    style: { ...layerStyle, width: 480, height: 110, background: 'rgba(16, 185, 129, 0.05)' },
  },
  {
    id: 'pgbouncer',
    position: { x: 120, y: 205 },
    data: { label: '🔄 PgBouncer (Connection Pooling)' },
    style: { ...nodeStyle, background: '#d1fae5', border: '1px solid #10b981', color: '#065f46' },
  },

  // PostgreSQL Layer
  {
    id: 'postgres-layer',
    position: { x: 50, y: 320 },
    data: { label: 'POSTGRESQL' },
    style: { ...layerStyle, width: 480, height: 110, background: 'rgba(139, 92, 246, 0.05)' },
  },
  {
    id: 'users-table',
    position: { x: 100, y: 365 },
    data: { label: '👤 Users' },
    style: { ...nodeStyle, background: '#ede9fe', border: '1px solid #8b5cf6', color: '#5b21b6' },
  },
  {
    id: 'analyses-table',
    position: { x: 240, y: 365 },
    data: { label: '🔬 Analyses' },
    style: { ...nodeStyle, background: '#ede9fe', border: '1px solid #8b5cf6', color: '#5b21b6' },
  },
  {
    id: 'future-tables',
    position: { x: 390, y: 365 },
    data: { label: '📦 Future...' },
    style: { ...nodeStyle, background: '#f3e8ff', border: '1px dashed #8b5cf6', color: '#7c3aed' },
  },
]

const archEdges: Edge[] = [
  {
    id: 'app-to-pooler',
    source: 'prisma-client',
    target: 'pgbouncer',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
  },
  {
    id: 'pooler-to-users',
    source: 'pgbouncer',
    target: 'users-table',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#10b981', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
  },
  {
    id: 'pooler-to-analyses',
    source: 'pgbouncer',
    target: 'analyses-table',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#10b981', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
  },
]

// Entity Relationship Diagram
const tableStyle = {
  borderRadius: '8px',
  fontSize: '11px',
  fontWeight: 500,
  padding: '0',
  fontFamily: 'var(--font-heading), Poppins, sans-serif',
  background: 'var(--color-card)',
  border: '2px solid var(--color-border)',
  width: 220,
}

const headerStyle = {
  background: 'var(--color-primary)',
  color: 'white',
  padding: '10px 14px',
  borderRadius: '6px 6px 0 0',
  fontWeight: 600,
  fontSize: '13px',
}

const fieldStyle = {
  padding: '8px 14px',
  borderBottom: '1px solid var(--color-border)',
  fontSize: '11px',
  display: 'flex',
  justifyContent: 'space-between',
}

const pkStyle = {
  background: '#fef3c7',
  color: '#92400e',
  padding: '2px 6px',
  borderRadius: '4px',
  fontSize: '9px',
  fontWeight: 600,
}

const fkStyle = {
  background: '#dbeafe',
  color: '#1e40af',
  padding: '2px 6px',
  borderRadius: '4px',
  fontSize: '9px',
  fontWeight: 600,
}

const UserTable = () => (
  <div style={tableStyle}>
    <div style={headerStyle}>👤 User</div>
    <div style={fieldStyle}>
      <span>id: String</span>
      <span style={pkStyle}>PK</span>
    </div>
    <div style={fieldStyle}>
      <span>email: String</span>
      <span style={{ ...pkStyle, background: '#d1fae5', color: '#065f46' }}>UNIQUE</span>
    </div>
    <div style={fieldStyle}>
      <span>password: String</span>
    </div>
    <div style={fieldStyle}>
      <span>name: String?</span>
    </div>
    <div style={{ ...fieldStyle, borderBottom: 'none' }}>
      <span>createdAt: DateTime</span>
    </div>
  </div>
)

const AnalysisTable = () => (
  <div style={tableStyle}>
    <div style={{ ...headerStyle, background: '#8b5cf6' }}>🔬 Analysis</div>
    <div style={fieldStyle}>
      <span>id: String</span>
      <span style={pkStyle}>PK</span>
    </div>
    <div style={fieldStyle}>
      <span>userId: String</span>
      <span style={fkStyle}>FK</span>
    </div>
    <div style={fieldStyle}>
      <span>type: String</span>
      <span style={{ ...pkStyle, background: '#ede9fe', color: '#5b21b6' }}>IDX</span>
    </div>
    <div style={fieldStyle}>
      <span>rawData: Json</span>
    </div>
    <div style={fieldStyle}>
      <span>structuredData: Json?</span>
    </div>
    <div style={fieldStyle}>
      <span>visualMetrics: Json?</span>
    </div>
    <div style={fieldStyle}>
      <span>riskAssessment: String?</span>
    </div>
    <div style={fieldStyle}>
      <span>problemsDetected: Json?</span>
    </div>
    <div style={fieldStyle}>
      <span>treatments: Json?</span>
    </div>
    <div style={{ ...fieldStyle, borderBottom: 'none' }}>
      <span>createdAt: DateTime</span>
      <span style={{ ...pkStyle, background: '#ede9fe', color: '#5b21b6' }}>IDX</span>
    </div>
  </div>
)

const erNodes: Node[] = [
  {
    id: 'user-table',
    position: { x: 50, y: 30 },
    data: { label: <UserTable /> },
    style: { background: 'transparent', border: 'none', padding: 0 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'analysis-table',
    position: { x: 450, y: 30 },
    data: { label: <AnalysisTable /> },
    style: { background: 'transparent', border: 'none', padding: 0 },
    sourcePosition: Position.Left,
    targetPosition: Position.Right,
  },
  {
    id: 'relation-one',
    position: { x: 305, y: 80 },
    data: { label: '1' },
    style: {
      background: 'var(--color-primary)',
      color: 'white',
      padding: '6px 12px',
      borderRadius: '50%',
      fontSize: '12px',
      fontWeight: 700,
      width: 30,
      height: 30,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  },
  {
    id: 'relation-many',
    position: { x: 390, y: 80 },
    data: { label: 'N' },
    style: {
      background: '#8b5cf6',
      color: 'white',
      padding: '6px 12px',
      borderRadius: '50%',
      fontSize: '12px',
      fontWeight: 700,
      width: 30,
      height: 30,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  },
]

const erEdges: Edge[] = [
  {
    id: 'user-to-one',
    source: 'user-table',
    target: 'relation-one',
    type: 'smoothstep',
    style: { stroke: 'var(--color-primary)', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-primary)' },
  },
  {
    id: 'one-to-many',
    source: 'relation-one',
    target: 'relation-many',
    type: 'straight',
    style: { stroke: '#8b5cf6', strokeWidth: 3 },
    label: 'has many',
    labelStyle: { fontSize: 11, fill: 'var(--color-muted)', fontWeight: 500 },
    labelBgStyle: { fill: 'var(--color-surface)', fillOpacity: 0.9 },
    labelBgPadding: [6, 4] as [number, number],
    labelBgBorderRadius: 4,
  },
  {
    id: 'many-to-analysis',
    source: 'relation-many',
    target: 'analysis-table',
    type: 'smoothstep',
    style: { stroke: '#8b5cf6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
  },
]

export function DatabaseArchitectureDiagram() {
  return (
    <DiagramWrapper
      nodes={archNodes}
      edges={archEdges}
      title="Database Architecture"
      height="520px"
    />
  )
}

export function DatabaseDiagram() {
  return (
    <DiagramWrapper
      nodes={erNodes}
      edges={erEdges}
      title="Entity Relationship Diagram"
      height="420px"
    />
  )
}
