'use client'

import { Node, Edge, MarkerType } from '@xyflow/react'
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

const nodes: Node[] = [
  // Application Layer
  {
    id: 'app-layer',
    position: { x: 50, y: 0 },
    data: { label: 'SEHATSCAN APPLICATION' },
    style: { ...layerStyle, width: 470, height: 170, background: 'rgba(59, 130, 246, 0.05)' },
  },
  {
    id: 'ai-layer-label',
    position: { x: 70, y: 35 },
    data: { label: 'AI SERVICE LAYER' },
    style: { ...layerStyle, width: 430, height: 115, background: 'rgba(139, 92, 246, 0.08)', border: '1px dashed #8b5cf6' },
  },
  {
    id: 'gemini-analyzer',
    position: { x: 95, y: 80 },
    data: { label: '🧠 Gemini Analyzer' },
    style: { ...nodeStyle, background: '#ede9fe', border: '1px solid #8b5cf6', color: '#5b21b6' },
  },
  {
    id: 'face-analyzer',
    position: { x: 245, y: 80 },
    data: { label: '👤 Face Analyzer' },
    style: { ...nodeStyle, background: '#dbeafe', border: '1px solid #3b82f6', color: '#1e40af' },
  },
  {
    id: 'mock-fallback',
    position: { x: 385, y: 80 },
    data: { label: '🔄 Mock Fallback' },
    style: { ...nodeStyle, background: '#fef3c7', border: '1px solid #f59e0b', color: '#92400e' },
  },

  // External Services
  {
    id: 'external-layer',
    position: { x: 50, y: 220 },
    data: { label: 'EXTERNAL AI SERVICES' },
    style: { ...layerStyle, width: 470, height: 170, background: 'rgba(16, 185, 129, 0.05)' },
  },
  {
    id: 'gemini-api-label',
    position: { x: 70, y: 255 },
    data: { label: 'GOOGLE GEMINI API' },
    style: { ...layerStyle, width: 430, height: 115, background: 'rgba(16, 185, 129, 0.08)', border: '1px dashed #10b981' },
  },
  {
    id: 'vision-api',
    position: { x: 95, y: 300 },
    data: { label: '👁️ Vision (Images)' },
    style: { ...nodeStyle, background: '#d1fae5', border: '1px solid #10b981', color: '#065f46' },
  },
  {
    id: 'text-api',
    position: { x: 245, y: 300 },
    data: { label: '📝 Text Generation' },
    style: { ...nodeStyle, background: '#d1fae5', border: '1px solid #10b981', color: '#065f46' },
  },
  {
    id: 'multimodal-api',
    position: { x: 385, y: 300 },
    data: { label: '🔀 Multimodal' },
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
      height="480px"
    />
  )
}
