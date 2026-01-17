'use client'

import { Node, Edge, MarkerType } from '@xyflow/react'
import { DiagramWrapper } from './DiagramWrapper'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faLock,
  faEnvelope,
  faIdCard,
  faKey,
  faShieldHalved,
  faUser,
  faCircleCheck,
  faMagnifyingGlass,
  faBan,
} from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

// Helper component for node labels with Font Awesome icons
const NodeLabel = ({ icon, text, color }: { icon: IconDefinition; text: string; color: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <FontAwesomeIcon icon={icon} style={{ width: '14px', height: '14px', color }} />
    <span>{text}</span>
  </div>
)

const nodeStyle = {
  borderRadius: '8px',
  fontSize: '11px',
  fontWeight: 500,
  padding: '12px 16px',
  fontFamily: 'var(--font-heading), Poppins, sans-serif',
}

const layerStyle = {
  background: 'var(--color-card)',
  border: '2px solid var(--color-border)',
  borderRadius: '12px',
}

const nodes: Node[] = [
  // Clerk Authentication Layer
  {
    id: 'clerk-layer',
    position: { x: 50, y: 0 },
    data: { label: 'CLERK AUTHENTICATION' },
    style: { ...layerStyle, width: 560, height: 120, background: 'rgba(139, 92, 246, 0.05)' },
  },
  {
    id: 'oauth',
    position: { x: 75, y: 50 },
    data: { label: <NodeLabel icon={faLock} text="OAuth" color="#5b21b6" /> },
    style: { ...nodeStyle, background: '#ede9fe', border: '1px solid #8b5cf6', color: '#5b21b6' },
  },
  {
    id: 'email-pass',
    position: { x: 185, y: 50 },
    data: { label: <NodeLabel icon={faEnvelope} text="Email/Pass" color="#5b21b6" /> },
    style: { ...nodeStyle, background: '#ede9fe', border: '1px solid #8b5cf6', color: '#5b21b6' },
  },
  {
    id: 'session-mgmt',
    position: { x: 330, y: 50 },
    data: { label: <NodeLabel icon={faIdCard} text="Sessions" color="#5b21b6" /> },
    style: { ...nodeStyle, background: '#ede9fe', border: '1px solid #8b5cf6', color: '#5b21b6' },
  },
  {
    id: 'jwt',
    position: { x: 470, y: 50 },
    data: { label: <NodeLabel icon={faKey} text="JWT" color="#5b21b6" /> },
    style: { ...nodeStyle, background: '#ede9fe', border: '1px solid #8b5cf6', color: '#5b21b6' },
  },

  // Server Validation Layer
  {
    id: 'server-layer',
    position: { x: 50, y: 170 },
    data: { label: 'SERVER-SIDE VALIDATION' },
    style: { ...layerStyle, width: 560, height: 120, background: 'rgba(16, 185, 129, 0.05)' },
  },
  {
    id: 'require-auth',
    position: { x: 85, y: 220 },
    data: { label: <NodeLabel icon={faShieldHalved} text="requireAuth()" color="#065f46" /> },
    style: { ...nodeStyle, background: '#d1fae5', border: '1px solid #10b981', color: '#065f46' },
  },
  {
    id: 'get-user',
    position: { x: 265, y: 220 },
    data: { label: <NodeLabel icon={faUser} text="getCurrentUser()" color="#065f46" /> },
    style: { ...nodeStyle, background: '#d1fae5', border: '1px solid #10b981', color: '#065f46' },
  },
  {
    id: 'user-verify',
    position: { x: 470, y: 220 },
    data: { label: <NodeLabel icon={faCircleCheck} text="Verify ID" color="#065f46" /> },
    style: { ...nodeStyle, background: '#d1fae5', border: '1px solid #10b981', color: '#065f46' },
  },

  // Data Isolation Layer
  {
    id: 'data-layer',
    position: { x: 50, y: 340 },
    data: { label: 'DATA ISOLATION' },
    style: { ...layerStyle, width: 560, height: 120, background: 'rgba(59, 130, 246, 0.05)' },
  },
  {
    id: 'user-filter',
    position: { x: 85, y: 390 },
    data: { label: <NodeLabel icon={faMagnifyingGlass} text="userId Filter" color="#1e40af" /> },
    style: { ...nodeStyle, background: '#dbeafe', border: '1px solid #3b82f6', color: '#1e40af' },
  },
  {
    id: 'row-security',
    position: { x: 265, y: 390 },
    data: { label: <NodeLabel icon={faLock} text="Row Security" color="#1e40af" /> },
    style: { ...nodeStyle, background: '#dbeafe', border: '1px solid #3b82f6', color: '#1e40af' },
  },
  {
    id: 'no-cross',
    position: { x: 445, y: 390 },
    data: { label: <NodeLabel icon={faBan} text="No Cross-User" color="#1e40af" /> },
    style: { ...nodeStyle, background: '#dbeafe', border: '1px solid #3b82f6', color: '#1e40af' },
  },
]

const edges: Edge[] = [
  // Clerk to Server
  { id: 'e1', source: 'oauth', target: 'require-auth', type: 'smoothstep', style: { stroke: '#8b5cf6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } },
  { id: 'e2', source: 'email-pass', target: 'require-auth', type: 'smoothstep', style: { stroke: '#8b5cf6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } },
  { id: 'e3', source: 'session-mgmt', target: 'get-user', type: 'smoothstep', style: { stroke: '#8b5cf6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } },
  { id: 'e4', source: 'jwt', target: 'user-verify', type: 'smoothstep', style: { stroke: '#8b5cf6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } },

  // Server to Data
  { id: 'e5', source: 'require-auth', target: 'user-filter', type: 'smoothstep', style: { stroke: '#10b981' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' } },
  { id: 'e6', source: 'get-user', target: 'row-security', type: 'smoothstep', style: { stroke: '#10b981' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' } },
  { id: 'e7', source: 'user-verify', target: 'no-cross', type: 'smoothstep', style: { stroke: '#10b981' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' } },
]

export function SecurityArchitectureDiagram() {
  return (
    <DiagramWrapper
      nodes={nodes}
      edges={edges}
      title="Security Architecture Layers"
      height="580px"
    />
  )
}
