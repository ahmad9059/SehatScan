'use client'

import { Node, Edge, MarkerType } from '@xyflow/react'
import { DiagramWrapper } from './DiagramWrapper'

const nodeDefaults = {
  style: {
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: 500,
    fontFamily: 'var(--font-heading), Poppins, sans-serif',
  },
}

const layerStyle = {
  background: 'var(--color-card)',
  border: '2px solid var(--color-border)',
  borderRadius: '12px',
}

const nodes: Node[] = [
  // User Layer
  {
    id: 'user-layer',
    type: 'default',
    position: { x: 100, y: 0 },
    data: { label: 'USER' },
    style: {
      ...layerStyle,
      width: 300,
      height: 50,
      background: 'rgba(59, 130, 246, 0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  },

  // Clerk Platform Layer
  {
    id: 'clerk-layer',
    type: 'default',
    position: { x: 20, y: 100 },
    data: { label: 'CLERK PLATFORM' },
    style: { ...layerStyle, width: 460, height: 180, background: 'rgba(139, 92, 246, 0.05)' },
  },
  {
    id: 'sign-in',
    position: { x: 50, y: 145 },
    data: { label: '🔑 Sign In\nForm' },
    style: {
      ...nodeDefaults.style,
      background: '#ede9fe',
      border: '1px solid #8b5cf6',
      color: '#5b21b6',
      padding: '10px 16px',
      textAlign: 'center',
      whiteSpace: 'pre-wrap',
    },
  },
  {
    id: 'sign-up',
    position: { x: 180, y: 145 },
    data: { label: '📝 Sign Up\nForm' },
    style: {
      ...nodeDefaults.style,
      background: '#ede9fe',
      border: '1px solid #8b5cf6',
      color: '#5b21b6',
      padding: '10px 16px',
      textAlign: 'center',
      whiteSpace: 'pre-wrap',
    },
  },
  {
    id: 'oauth',
    position: { x: 310, y: 145 },
    data: { label: '🌐 OAuth\n(Google)' },
    style: {
      ...nodeDefaults.style,
      background: '#ede9fe',
      border: '1px solid #8b5cf6',
      color: '#5b21b6',
      padding: '10px 16px',
      textAlign: 'center',
      whiteSpace: 'pre-wrap',
    },
  },
  {
    id: 'session-mgmt',
    position: { x: 100, y: 220 },
    data: { label: '🔐 Session Management (JWT Tokens, Cookies, Refresh)' },
    style: {
      ...nodeDefaults.style,
      background: '#ddd6fe',
      border: '1px solid #8b5cf6',
      color: '#5b21b6',
      padding: '10px 20px',
      width: 280,
      textAlign: 'center',
    },
  },

  // SehatScan Application Layer
  {
    id: 'app-layer',
    type: 'default',
    position: { x: 20, y: 330 },
    data: { label: 'SEHATSCAN APPLICATION' },
    style: { ...layerStyle, width: 460, height: 180, background: 'rgba(16, 185, 129, 0.05)' },
  },
  {
    id: 'middleware',
    position: { x: 80, y: 380 },
    data: { label: '⚡ Clerk Session Middleware\n(Validates tokens, extracts user)' },
    style: {
      ...nodeDefaults.style,
      background: '#d1fae5',
      border: '1px solid #10b981',
      color: '#065f46',
      padding: '10px 16px',
      width: 320,
      textAlign: 'center',
      whiteSpace: 'pre-wrap',
    },
  },
  {
    id: 'db-sync',
    position: { x: 80, y: 450 },
    data: { label: '🗄️ Database Sync Layer\n(Ensures user exists in PostgreSQL)' },
    style: {
      ...nodeDefaults.style,
      background: '#d1fae5',
      border: '1px solid #10b981',
      color: '#065f46',
      padding: '10px 16px',
      width: 320,
      textAlign: 'center',
      whiteSpace: 'pre-wrap',
    },
  },
]

const edges: Edge[] = [
  // User to Clerk
  {
    id: 'user-to-clerk',
    source: 'user-layer',
    target: 'clerk-layer',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#8b5cf6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
  },
  // Session to App
  {
    id: 'session-to-app',
    source: 'session-mgmt',
    target: 'middleware',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#10b981', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
  },
  // Middleware to DB Sync
  {
    id: 'middleware-to-db',
    source: 'middleware',
    target: 'db-sync',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#10b981', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
  },
]

export function AuthenticationArchitectureDiagram() {
  return (
    <DiagramWrapper
      nodes={nodes}
      edges={edges}
      title="Authentication Architecture"
      height="560px"
    />
  )
}
