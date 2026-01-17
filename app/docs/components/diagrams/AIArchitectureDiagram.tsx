'use client'

import { Node, Edge, MarkerType } from '@xyflow/react'
import { DiagramWrapper } from './DiagramWrapper'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBrain,
  faUser,
  faRotate,
  faEye,
  faFileLines,
  faShuffle,
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
  padding: '10px 14px',
  fontFamily: 'var(--font-heading), Poppins, sans-serif',
}

const layerStyle = {
  background: 'var(--color-card)',
  border: '2px solid var(--color-border)',
  borderRadius: '12px',
}

const nodes: Node[] = [
  // Application Layer
  {
    id: 'app-layer',
    position: { x: 50, y: 0 },
    data: { label: 'SEHATSCAN APPLICATION' },
    style: { ...layerStyle, width: 580, height: 180, background: 'rgba(59, 130, 246, 0.05)' },
  },
  {
    id: 'ai-layer-label',
    position: { x: 70, y: 35 },
    data: { label: 'AI SERVICE LAYER' },
    style: { ...layerStyle, width: 540, height: 125, background: 'rgba(139, 92, 246, 0.08)', border: '1px dashed #8b5cf6' },
  },
  {
    id: 'gemini-analyzer',
    position: { x: 100, y: 90 },
    data: { label: <NodeLabel icon={faBrain} text="Gemini Analyzer" color="#5b21b6" /> },
    style: { ...nodeStyle, background: '#ede9fe', border: '1px solid #8b5cf6', color: '#5b21b6' },
  },
  {
    id: 'face-analyzer',
    position: { x: 290, y: 90 },
    data: { label: <NodeLabel icon={faUser} text="Face Analyzer" color="#1e40af" /> },
    style: { ...nodeStyle, background: '#dbeafe', border: '1px solid #3b82f6', color: '#1e40af' },
  },
  {
    id: 'mock-fallback',
    position: { x: 470, y: 90 },
    data: { label: <NodeLabel icon={faRotate} text="Mock Fallback" color="#92400e" /> },
    style: { ...nodeStyle, background: '#fef3c7', border: '1px solid #f59e0b', color: '#92400e' },
  },

  // External Services
  {
    id: 'external-layer',
    position: { x: 50, y: 230 },
    data: { label: 'EXTERNAL AI SERVICES' },
    style: { ...layerStyle, width: 580, height: 180, background: 'rgba(16, 185, 129, 0.05)' },
  },
  {
    id: 'gemini-api-label',
    position: { x: 70, y: 265 },
    data: { label: 'GOOGLE GEMINI API' },
    style: { ...layerStyle, width: 540, height: 125, background: 'rgba(16, 185, 129, 0.08)', border: '1px dashed #10b981' },
  },
  {
    id: 'vision-api',
    position: { x: 100, y: 320 },
    data: { label: <NodeLabel icon={faEye} text="Vision (Images)" color="#065f46" /> },
    style: { ...nodeStyle, background: '#d1fae5', border: '1px solid #10b981', color: '#065f46' },
  },
  {
    id: 'text-api',
    position: { x: 290, y: 320 },
    data: { label: <NodeLabel icon={faFileLines} text="Text Generation" color="#065f46" /> },
    style: { ...nodeStyle, background: '#d1fae5', border: '1px solid #10b981', color: '#065f46' },
  },
  {
    id: 'multimodal-api',
    position: { x: 480, y: 320 },
    data: { label: <NodeLabel icon={faShuffle} text="Multimodal" color="#065f46" /> },
    style: { ...nodeStyle, background: '#d1fae5', border: '1px solid #10b981', color: '#065f46' },
  },
]

const edges: Edge[] = [
  // Gemini Analyzer connections
  { id: 'e1', source: 'gemini-analyzer', target: 'vision-api', type: 'smoothstep', animated: true, style: { stroke: '#8b5cf6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } },
  { id: 'e2', source: 'gemini-analyzer', target: 'text-api', type: 'smoothstep', animated: true, style: { stroke: '#8b5cf6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } },
  { id: 'e3', source: 'gemini-analyzer', target: 'multimodal-api', type: 'smoothstep', animated: true, style: { stroke: '#8b5cf6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } },

  // Fallback connection
  { id: 'e4', source: 'gemini-analyzer', target: 'mock-fallback', type: 'smoothstep', style: { stroke: '#f59e0b', strokeDasharray: '5,5' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' }, label: 'fallback', labelStyle: { fontSize: 10, fill: '#92400e' } },
]

export function AIArchitectureDiagram() {
  return (
    <DiagramWrapper
      nodes={nodes}
      edges={edges}
      title="AI Architecture Overview"
      height="520px"
    />
  )
}
