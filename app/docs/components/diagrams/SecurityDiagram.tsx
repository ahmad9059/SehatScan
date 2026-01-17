'use client'

import { Node, Edge, MarkerType } from '@xyflow/react'
import { DiagramWrapper } from './DiagramWrapper'

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
    style: { ...layerStyle, width: 420, height: 110, background: 'rgba(139, 92, 246, 0.05)' },
  },
  {
    id: 'oauth',
    position: { x: 70, y: 45 },
    data: { label: '🔐 OAuth' },
    style: { ...nodeStyle, background: '#ede9fe', border: '1px solid #8b5cf6', color: '#5b21b6' },
  },
  {
    id: 'email-pass',
    position: { x: 160, y: 45 },
    data: { label: '📧 Email/Pass' },
    style: { ...nodeStyle, background: '#ede9fe', border: '1px solid #8b5cf6', color: '#5b21b6' },
  },
  {
    id: 'session-mgmt',
    position: { x: 270, y: 45 },
    data: { label: '🎫 Sessions' },
    style: { ...nodeStyle, background: '#ede9fe', border: '1px solid #8b5cf6', color: '#5b21b6' },
  },
  {
    id: 'jwt',
    position: { x: 370, y: 45 },
    data: { label: '🔑 JWT' },
    style: { ...nodeStyle, background: '#ede9fe', border: '1px solid #8b5cf6', color: '#5b21b6' },
  },

  // Server Validation Layer
  {
    id: 'server-layer',
    position: { x: 50, y: 160 },
    data: { label: 'SERVER-SIDE VALIDATION' },
    style: { ...layerStyle, width: 420, height: 110, background: 'rgba(16, 185, 129, 0.05)' },
  },
  {
    id: 'require-auth',
    position: { x: 80, y: 205 },
    data: { label: '🛡️ requireAuth()' },
    style: { ...nodeStyle, background: '#d1fae5', border: '1px solid #10b981', color: '#065f46' },
  },
  {
    id: 'get-user',
    position: { x: 220, y: 205 },
    data: { label: '👤 getCurrentUser()' },
    style: { ...nodeStyle, background: '#d1fae5', border: '1px solid #10b981', color: '#065f46' },
  },
  {
    id: 'user-verify',
    position: { x: 370, y: 205 },
    data: { label: '✅ Verify ID' },
    style: { ...nodeStyle, background: '#d1fae5', border: '1px solid #10b981', color: '#065f46' },
  },

  // Data Isolation Layer
  {
    id: 'data-layer',
    position: { x: 50, y: 320 },
    data: { label: 'DATA ISOLATION' },
    style: { ...layerStyle, width: 420, height: 110, background: 'rgba(59, 130, 246, 0.05)' },
  },
  {
    id: 'user-filter',
    position: { x: 80, y: 365 },
    data: { label: '🔍 userId Filter' },
    style: { ...nodeStyle, background: '#dbeafe', border: '1px solid #3b82f6', color: '#1e40af' },
  },
  {
    id: 'row-security',
    position: { x: 220, y: 365 },
    data: { label: '🔒 Row Security' },
    style: { ...nodeStyle, background: '#dbeafe', border: '1px solid #3b82f6', color: '#1e40af' },
  },
  {
    id: 'no-cross',
    position: { x: 360, y: 365 },
    data: { label: '🚫 No Cross-User' },
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
      height="520px"
    />
  )
}
