'use client'

import { Node, Edge, MarkerType } from '@xyflow/react'
import { DiagramWrapper } from './DiagramWrapper'

const nodeDefaults = {
  style: {
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 500,
    fontFamily: 'var(--font-heading), Poppins, sans-serif',
  },
}

const layerStyle = {
  background: 'var(--color-card)',
  border: '2px solid var(--color-border)',
  borderRadius: '12px',
  padding: '16px',
}

const serviceStyle = {
  background: 'var(--color-primary-soft)',
  border: '1px solid var(--color-primary)',
  color: 'var(--color-primary)',
  padding: '12px 16px',
  ...nodeDefaults.style,
}

const externalStyle = {
  background: '#fef3c7',
  border: '1px solid #f59e0b',
  color: '#92400e',
  padding: '12px 16px',
  ...nodeDefaults.style,
}

const nodes: Node[] = [
  // Client Layer
  {
    id: 'client-layer',
    type: 'default',
    position: { x: 50, y: 0 },
    data: { label: 'CLIENT LAYER' },
    style: { ...layerStyle, width: 700, height: 110, background: 'rgba(59, 130, 246, 0.05)' },
  },
  {
    id: 'landing',
    position: { x: 70, y: 45 },
    data: { label: '🏠 Landing Page' },
    style: serviceStyle,
  },
  {
    id: 'dashboard',
    position: { x: 230, y: 45 },
    data: { label: '📊 Dashboard' },
    style: serviceStyle,
  },
  {
    id: 'analysis',
    position: { x: 390, y: 45 },
    data: { label: '🔬 Analysis Pages' },
    style: serviceStyle,
  },
  {
    id: 'chatbot',
    position: { x: 580, y: 45 },
    data: { label: '🤖 Chatbot' },
    style: serviceStyle,
  },

  // Next.js Layer
  {
    id: 'nextjs-layer',
    type: 'default',
    position: { x: 50, y: 160 },
    data: { label: 'NEXT.JS APP ROUTER' },
    style: { ...layerStyle, width: 700, height: 110, background: 'rgba(16, 185, 129, 0.05)' },
  },
  {
    id: 'server-actions',
    position: { x: 170, y: 205 },
    data: { label: '⚡ Server Actions' },
    style: { ...serviceStyle, background: '#d1fae5', border: '1px solid #10b981', color: '#065f46' },
  },
  {
    id: 'api-routes',
    position: { x: 470, y: 205 },
    data: { label: '🔌 API Routes' },
    style: { ...serviceStyle, background: '#d1fae5', border: '1px solid #10b981', color: '#065f46' },
  },

  // Service Layer
  {
    id: 'service-layer',
    type: 'default',
    position: { x: 50, y: 320 },
    data: { label: 'SERVICE LAYER' },
    style: { ...layerStyle, width: 700, height: 110, background: 'rgba(139, 92, 246, 0.05)' },
  },
  {
    id: 'gemini-service',
    position: { x: 100, y: 365 },
    data: { label: '🧠 Gemini AI' },
    style: { ...serviceStyle, background: '#ede9fe', border: '1px solid #8b5cf6', color: '#5b21b6' },
  },
  {
    id: 'clerk-service',
    position: { x: 300, y: 365 },
    data: { label: '🔐 Clerk Auth' },
    style: { ...serviceStyle, background: '#ede9fe', border: '1px solid #8b5cf6', color: '#5b21b6' },
  },
  {
    id: 'prisma-service',
    position: { x: 500, y: 365 },
    data: { label: '🗄️ Prisma ORM' },
    style: { ...serviceStyle, background: '#ede9fe', border: '1px solid #8b5cf6', color: '#5b21b6' },
  },

  // External Services
  {
    id: 'external-layer',
    type: 'default',
    position: { x: 50, y: 480 },
    data: { label: 'EXTERNAL SERVICES' },
    style: { ...layerStyle, width: 700, height: 110, background: 'rgba(245, 158, 11, 0.05)' },
  },
  {
    id: 'google-api',
    position: { x: 100, y: 525 },
    data: { label: '☁️ Google Gemini' },
    style: externalStyle,
  },
  {
    id: 'clerk-platform',
    position: { x: 300, y: 525 },
    data: { label: '🔑 Clerk Platform' },
    style: externalStyle,
  },
  {
    id: 'supabase',
    position: { x: 500, y: 525 },
    data: { label: '🐘 Supabase PG' },
    style: externalStyle,
  },
]

const edges: Edge[] = [
  // Client to Next.js
  { id: 'e1', source: 'landing', target: 'server-actions', type: 'smoothstep', animated: true, style: { stroke: 'var(--color-primary)' }, markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-primary)' } },
  { id: 'e2', source: 'dashboard', target: 'server-actions', type: 'smoothstep', animated: true, style: { stroke: 'var(--color-primary)' }, markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-primary)' } },
  { id: 'e3', source: 'analysis', target: 'api-routes', type: 'smoothstep', animated: true, style: { stroke: 'var(--color-primary)' }, markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-primary)' } },
  { id: 'e4', source: 'chatbot', target: 'api-routes', type: 'smoothstep', animated: true, style: { stroke: 'var(--color-primary)' }, markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-primary)' } },

  // Next.js to Services
  { id: 'e5', source: 'server-actions', target: 'gemini-service', type: 'smoothstep', style: { stroke: '#8b5cf6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } },
  { id: 'e6', source: 'server-actions', target: 'clerk-service', type: 'smoothstep', style: { stroke: '#8b5cf6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } },
  { id: 'e7', source: 'api-routes', target: 'prisma-service', type: 'smoothstep', style: { stroke: '#8b5cf6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } },
  { id: 'e8', source: 'api-routes', target: 'gemini-service', type: 'smoothstep', style: { stroke: '#8b5cf6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } },

  // Services to External
  { id: 'e9', source: 'gemini-service', target: 'google-api', type: 'smoothstep', style: { stroke: '#f59e0b' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
  { id: 'e10', source: 'clerk-service', target: 'clerk-platform', type: 'smoothstep', style: { stroke: '#f59e0b' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
  { id: 'e11', source: 'prisma-service', target: 'supabase', type: 'smoothstep', style: { stroke: '#f59e0b' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
]

export function ArchitectureDiagram() {
  return (
    <DiagramWrapper
      nodes={nodes}
      edges={edges}
      title="High-Level System Architecture"
      height="700px"
      showControls={true}
    />
  )
}
