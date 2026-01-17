'use client'

import { Node, Edge, MarkerType } from '@xyflow/react'
import { DiagramWrapper } from './DiagramWrapper'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHome,
  faChartBar,
  faFlask,
  faRobot,
  faBolt,
  faPlug,
  faBrain,
  faLock,
  faDatabase,
  faCloud,
  faKey,
} from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

// Helper component for node labels with Font Awesome icons
const NodeLabel = ({ icon, text, color }: { icon: IconDefinition; text: string; color: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <FontAwesomeIcon icon={icon} style={{ width: '14px', height: '14px', color }} />
    <span>{text}</span>
  </div>
)

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
    data: { label: <NodeLabel icon={faHome} text="Landing Page" color="var(--color-primary)" /> },
    style: serviceStyle,
  },
  {
    id: 'dashboard',
    position: { x: 230, y: 45 },
    data: { label: <NodeLabel icon={faChartBar} text="Dashboard" color="var(--color-primary)" /> },
    style: serviceStyle,
  },
  {
    id: 'analysis',
    position: { x: 390, y: 45 },
    data: { label: <NodeLabel icon={faFlask} text="Analysis Pages" color="var(--color-primary)" /> },
    style: serviceStyle,
  },
  {
    id: 'chatbot',
    position: { x: 580, y: 45 },
    data: { label: <NodeLabel icon={faRobot} text="Chatbot" color="var(--color-primary)" /> },
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
    data: { label: <NodeLabel icon={faBolt} text="Server Actions" color="#065f46" /> },
    style: { ...serviceStyle, background: '#d1fae5', border: '1px solid #10b981', color: '#065f46' },
  },
  {
    id: 'api-routes',
    position: { x: 470, y: 205 },
    data: { label: <NodeLabel icon={faPlug} text="API Routes" color="#065f46" /> },
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
    data: { label: <NodeLabel icon={faBrain} text="Gemini AI" color="#5b21b6" /> },
    style: { ...serviceStyle, background: '#ede9fe', border: '1px solid #8b5cf6', color: '#5b21b6' },
  },
  {
    id: 'clerk-service',
    position: { x: 300, y: 365 },
    data: { label: <NodeLabel icon={faLock} text="Clerk Auth" color="#5b21b6" /> },
    style: { ...serviceStyle, background: '#ede9fe', border: '1px solid #8b5cf6', color: '#5b21b6' },
  },
  {
    id: 'prisma-service',
    position: { x: 500, y: 365 },
    data: { label: <NodeLabel icon={faDatabase} text="Prisma ORM" color="#5b21b6" /> },
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
    data: { label: <NodeLabel icon={faCloud} text="Google Gemini" color="#92400e" /> },
    style: externalStyle,
  },
  {
    id: 'clerk-platform',
    position: { x: 300, y: 525 },
    data: { label: <NodeLabel icon={faKey} text="Clerk Platform" color="#92400e" /> },
    style: externalStyle,
  },
  {
    id: 'supabase',
    position: { x: 500, y: 525 },
    data: { label: <NodeLabel icon={faDatabase} text="Supabase PG" color="#92400e" /> },
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
