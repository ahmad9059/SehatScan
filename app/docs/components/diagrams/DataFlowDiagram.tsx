'use client'

import { Node, Edge, MarkerType } from '@xyflow/react'
import { DiagramWrapper } from './DiagramWrapper'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUpload,
  faCircleCheck,
  faBrain,
  faGear,
  faFloppyDisk,
  faChartBar,
  faUser,
  faLock,
  faRotate,
  faIdCard,
  faRocket,
  faComment,
  faClockRotateLeft,
  faWrench,
  faFileLines,
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

// Medical Report Analysis Flow
const reportNodes: Node[] = [
  {
    id: 'upload',
    position: { x: 0, y: 100 },
    data: { label: <NodeLabel icon={faUpload} text="User Uploads File" color="#1e40af" /> },
    style: { ...nodeStyle, background: '#dbeafe', border: '1px solid #3b82f6', color: '#1e40af' },
  },
  {
    id: 'validate',
    position: { x: 160, y: 100 },
    data: { label: <NodeLabel icon={faCircleCheck} text="Validate File" color="#065f46" /> },
    style: { ...nodeStyle, background: '#d1fae5', border: '1px solid #10b981', color: '#065f46' },
  },
  {
    id: 'gemini',
    position: { x: 320, y: 100 },
    data: { label: <NodeLabel icon={faBrain} text="Gemini Vision" color="#5b21b6" /> },
    style: { ...nodeStyle, background: '#ede9fe', border: '1px solid #8b5cf6', color: '#5b21b6' },
  },
  {
    id: 'process',
    position: { x: 480, y: 100 },
    data: { label: <NodeLabel icon={faGear} text="Process Results" color="#92400e" /> },
    style: { ...nodeStyle, background: '#fef3c7', border: '1px solid #f59e0b', color: '#92400e' },
  },
  {
    id: 'save',
    position: { x: 640, y: 100 },
    data: { label: <NodeLabel icon={faFloppyDisk} text="Save to DB" color="#065f46" /> },
    style: { ...nodeStyle, background: '#d1fae5', border: '1px solid #10b981', color: '#065f46' },
  },
  {
    id: 'display',
    position: { x: 800, y: 100 },
    data: { label: <NodeLabel icon={faChartBar} text="Display Results" color="#1e40af" /> },
    style: { ...nodeStyle, background: '#dbeafe', border: '1px solid #3b82f6', color: '#1e40af' },
  },
]

const reportEdges: Edge[] = [
  { id: 'r1', source: 'upload', target: 'validate', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' } },
  { id: 'r2', source: 'validate', target: 'gemini', type: 'smoothstep', animated: true, style: { stroke: '#10b981' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' } },
  { id: 'r3', source: 'gemini', target: 'process', type: 'smoothstep', animated: true, style: { stroke: '#8b5cf6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } },
  { id: 'r4', source: 'process', target: 'save', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
  { id: 'r5', source: 'save', target: 'display', type: 'smoothstep', animated: true, style: { stroke: '#10b981' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' } },
]

// Authentication Flow
const authNodes: Node[] = [
  {
    id: 'login',
    position: { x: 0, y: 100 },
    data: { label: <NodeLabel icon={faUser} text="User Login" color="#1e40af" /> },
    style: { ...nodeStyle, background: '#dbeafe', border: '1px solid #3b82f6', color: '#1e40af' },
  },
  {
    id: 'clerk-auth',
    position: { x: 160, y: 100 },
    data: { label: <NodeLabel icon={faLock} text="Clerk Auth UI" color="#5b21b6" /> },
    style: { ...nodeStyle, background: '#ede9fe', border: '1px solid #8b5cf6', color: '#5b21b6' },
  },
  {
    id: 'validate-session',
    position: { x: 320, y: 100 },
    data: { label: <NodeLabel icon={faCircleCheck} text="Validate Session" color="#065f46" /> },
    style: { ...nodeStyle, background: '#d1fae5', border: '1px solid #10b981', color: '#065f46' },
  },
  {
    id: 'sync-db',
    position: { x: 480, y: 100 },
    data: { label: <NodeLabel icon={faRotate} text="Sync to Database" color="#92400e" /> },
    style: { ...nodeStyle, background: '#fef3c7', border: '1px solid #f59e0b', color: '#92400e' },
  },
  {
    id: 'create-session',
    position: { x: 640, y: 100 },
    data: { label: <NodeLabel icon={faIdCard} text="Create Session" color="#065f46" /> },
    style: { ...nodeStyle, background: '#d1fae5', border: '1px solid #10b981', color: '#065f46' },
  },
  {
    id: 'access',
    position: { x: 800, y: 100 },
    data: { label: <NodeLabel icon={faRocket} text="Access Dashboard" color="#1e40af" /> },
    style: { ...nodeStyle, background: '#dbeafe', border: '1px solid #3b82f6', color: '#1e40af' },
  },
]

const authEdges: Edge[] = [
  { id: 'a1', source: 'login', target: 'clerk-auth', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' } },
  { id: 'a2', source: 'clerk-auth', target: 'validate-session', type: 'smoothstep', animated: true, style: { stroke: '#8b5cf6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } },
  { id: 'a3', source: 'validate-session', target: 'sync-db', type: 'smoothstep', animated: true, style: { stroke: '#10b981' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' } },
  { id: 'a4', source: 'sync-db', target: 'create-session', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
  { id: 'a5', source: 'create-session', target: 'access', type: 'smoothstep', animated: true, style: { stroke: '#10b981' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' } },
]

// Chatbot Context Flow
const chatbotNodes: Node[] = [
  {
    id: 'user-msg',
    position: { x: 0, y: 100 },
    data: { label: <NodeLabel icon={faComment} text="User Message" color="#1e40af" /> },
    style: { ...nodeStyle, background: '#dbeafe', border: '1px solid #3b82f6', color: '#1e40af' },
  },
  {
    id: 'fetch-profile',
    position: { x: 170, y: 60 },
    data: { label: <NodeLabel icon={faUser} text="Fetch Profile" color="#065f46" /> },
    style: { ...nodeStyle, background: '#d1fae5', border: '1px solid #10b981', color: '#065f46' },
  },
  {
    id: 'fetch-history',
    position: { x: 170, y: 140 },
    data: { label: <NodeLabel icon={faClockRotateLeft} text="Fetch History" color="#065f46" /> },
    style: { ...nodeStyle, background: '#d1fae5', border: '1px solid #10b981', color: '#065f46' },
  },
  {
    id: 'build-context',
    position: { x: 360, y: 100 },
    data: { label: <NodeLabel icon={faWrench} text="Build Context" color="#92400e" /> },
    style: { ...nodeStyle, background: '#fef3c7', border: '1px solid #f59e0b', color: '#92400e' },
  },
  {
    id: 'gemini-chat',
    position: { x: 530, y: 100 },
    data: { label: <NodeLabel icon={faBrain} text="Gemini AI" color="#5b21b6" /> },
    style: { ...nodeStyle, background: '#ede9fe', border: '1px solid #8b5cf6', color: '#5b21b6' },
  },
  {
    id: 'response',
    position: { x: 700, y: 100 },
    data: { label: <NodeLabel icon={faFileLines} text="Display Response" color="#1e40af" /> },
    style: { ...nodeStyle, background: '#dbeafe', border: '1px solid #3b82f6', color: '#1e40af' },
  },
]

const chatbotEdges: Edge[] = [
  { id: 'c1', source: 'user-msg', target: 'fetch-profile', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' } },
  { id: 'c2', source: 'user-msg', target: 'fetch-history', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' } },
  { id: 'c3', source: 'fetch-profile', target: 'build-context', type: 'smoothstep', animated: true, style: { stroke: '#10b981' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' } },
  { id: 'c4', source: 'fetch-history', target: 'build-context', type: 'smoothstep', animated: true, style: { stroke: '#10b981' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' } },
  { id: 'c5', source: 'build-context', target: 'gemini-chat', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
  { id: 'c6', source: 'gemini-chat', target: 'response', type: 'smoothstep', animated: true, style: { stroke: '#8b5cf6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } },
]

export function ReportAnalysisFlow() {
  return (
    <DiagramWrapper
      nodes={reportNodes}
      edges={reportEdges}
      title="Medical Report Analysis Flow"
      height="280px"
    />
  )
}

export function AuthenticationFlow() {
  return (
    <DiagramWrapper
      nodes={authNodes}
      edges={authEdges}
      title="Authentication Flow"
      height="280px"
    />
  )
}

export function ChatbotContextFlow() {
  return (
    <DiagramWrapper
      nodes={chatbotNodes}
      edges={chatbotEdges}
      title="Chatbot Context Flow (RAG)"
      height="300px"
    />
  )
}
