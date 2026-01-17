'use client'

import { Node, Edge, MarkerType, Position } from '@xyflow/react'
import { DiagramWrapper } from './DiagramWrapper'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faDatabase,
  faRotate,
  faUser,
  faFlask,
  faCube,
} from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

// Helper component for node labels with Font Awesome icons
const NodeLabel = ({ icon, text, color }: { icon: IconDefinition; text: string; color: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
    <FontAwesomeIcon icon={icon} style={{ width: '14px', height: '14px', color }} />
    <span>{text}</span>
  </div>
)

// Shared styles
const baseNodeStyle = {
  borderRadius: '8px',
  fontSize: '12px',
  fontWeight: 500,
  fontFamily: 'var(--font-heading), Poppins, sans-serif',
}

const layerStyle = {
  background: 'var(--color-card)',
  border: '2px solid var(--color-border)',
  borderRadius: '12px',
}

// Database Architecture Diagram - Clean vertical flow
const archNodes: Node[] = [
  // APPLICATION LAYER
  {
    id: 'app-layer',
    position: { x: 100, y: 0 },
    data: { label: 'APPLICATION' },
    style: {
      ...layerStyle,
      width: 400,
      height: 100,
      background: 'rgba(59, 130, 246, 0.05)',
    },
  },
  {
    id: 'prisma',
    position: { x: 200, y: 35 },
    data: { label: <NodeLabel icon={faDatabase} text="Prisma Client" color="#1e40af" /> },
    style: {
      ...baseNodeStyle,
      background: '#dbeafe',
      border: '2px solid #3b82f6',
      color: '#1e40af',
      padding: '12px 24px',
      width: 180,
      textAlign: 'center',
    },
  },

  // SUPABASE POOLER LAYER
  {
    id: 'pooler-layer',
    position: { x: 100, y: 140 },
    data: { label: 'SUPABASE POOLER' },
    style: {
      ...layerStyle,
      width: 400,
      height: 100,
      background: 'rgba(16, 185, 129, 0.05)',
    },
  },
  {
    id: 'pgbouncer',
    position: { x: 200, y: 175 },
    data: { label: <NodeLabel icon={faRotate} text="PgBouncer" color="#065f46" /> },
    style: {
      ...baseNodeStyle,
      background: '#d1fae5',
      border: '2px solid #10b981',
      color: '#065f46',
      padding: '12px 24px',
      width: 180,
      textAlign: 'center',
    },
  },

  // POSTGRESQL LAYER
  {
    id: 'postgres-layer',
    position: { x: 100, y: 280 },
    data: { label: 'POSTGRESQL' },
    style: {
      ...layerStyle,
      width: 400,
      height: 110,
      background: 'rgba(139, 92, 246, 0.05)',
    },
  },
  {
    id: 'users',
    position: { x: 120, y: 320 },
    data: { label: <NodeLabel icon={faUser} text="Users" color="#5b21b6" /> },
    style: {
      ...baseNodeStyle,
      background: '#ede9fe',
      border: '2px solid #8b5cf6',
      color: '#5b21b6',
      padding: '10px 16px',
      width: 110,
      textAlign: 'center',
    },
  },
  {
    id: 'analyses',
    position: { x: 245, y: 320 },
    data: { label: <NodeLabel icon={faFlask} text="Analyses" color="#5b21b6" /> },
    style: {
      ...baseNodeStyle,
      background: '#ede9fe',
      border: '2px solid #8b5cf6',
      color: '#5b21b6',
      padding: '10px 16px',
      width: 110,
      textAlign: 'center',
    },
  },
  {
    id: 'future',
    position: { x: 370, y: 320 },
    data: { label: <NodeLabel icon={faCube} text="Future..." color="#5b21b6" /> },
    style: {
      ...baseNodeStyle,
      background: '#ede9fe',
      border: '2px solid #8b5cf6',
      color: '#5b21b6',
      padding: '10px 16px',
      width: 110,
      textAlign: 'center',
    },
  },
]

const archEdges: Edge[] = [
  // Prisma to PgBouncer
  {
    id: 'e1',
    source: 'prisma',
    target: 'pgbouncer',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
  },
  // PgBouncer to Users
  {
    id: 'e2',
    source: 'pgbouncer',
    target: 'users',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#10b981', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
  },
  // PgBouncer to Analyses
  {
    id: 'e3',
    source: 'pgbouncer',
    target: 'analyses',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#10b981', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
  },
  // PgBouncer to Future
  {
    id: 'e4',
    source: 'pgbouncer',
    target: 'future',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#10b981', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
  },
]

// Entity Relationship Diagram styles
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
    <div style={{ ...headerStyle, display: 'flex', alignItems: 'center', gap: '8px' }}>
      <FontAwesomeIcon icon={faUser} style={{ width: '14px', height: '14px' }} />
      <span>User</span>
    </div>
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
    <div style={{ ...headerStyle, background: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <FontAwesomeIcon icon={faFlask} style={{ width: '14px', height: '14px' }} />
      <span>Analysis</span>
    </div>
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
      height="480px"
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
