"use client";

import { Node, Edge, MarkerType } from "@xyflow/react";
import { DiagramWrapper } from "./DiagramWrapper";

const nodeDefaults = {
  style: {
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: 500,
    fontFamily: "var(--font-heading), Poppins, sans-serif",
  },
};

const layerStyle = {
  background: "var(--color-card)",
  border: "2px solid var(--color-border)",
  borderRadius: "12px",
};

// Vercel Edge nodes
const nodes: Node[] = [
  // Vercel Edge Layer
  {
    id: "vercel-layer",
    type: "default",
    position: { x: 20, y: 0 },
    data: { label: "VERCEL EDGE" },
    style: {
      ...layerStyle,
      width: 520,
      height: 200,
      background: "rgba(0, 0, 0, 0.03)",
    },
  },
  // Next.js Application Layer (nested inside Vercel)
  {
    id: "nextjs-layer",
    type: "default",
    position: { x: 40, y: 40 },
    data: { label: "Next.js Application" },
    style: {
      ...layerStyle,
      width: 480,
      height: 140,
      background: "rgba(59, 130, 246, 0.08)",
    },
  },
  {
    id: "pages-ssr",
    position: { x: 70, y: 100 },
    data: { label: "📄 Pages\n(SSR)" },
    style: {
      ...nodeDefaults.style,
      background: "#dbeafe",
      border: "1px solid #3b82f6",
      color: "#1e40af",
      padding: "10px 16px",
      textAlign: "center",
      whiteSpace: "pre-wrap",
    },
  },
  {
    id: "api-routes",
    position: { x: 220, y: 100 },
    data: { label: "🔌 API\nRoutes" },
    style: {
      ...nodeDefaults.style,
      background: "#dbeafe",
      border: "1px solid #3b82f6",
      color: "#1e40af",
      padding: "10px 16px",
      textAlign: "center",
      whiteSpace: "pre-wrap",
    },
  },
  {
    id: "static-assets",
    position: { x: 370, y: 100 },
    data: { label: "📁 Static\nAssets" },
    style: {
      ...nodeDefaults.style,
      background: "#dbeafe",
      border: "1px solid #3b82f6",
      color: "#1e40af",
      padding: "10px 16px",
      textAlign: "center",
      whiteSpace: "pre-wrap",
    },
  },

  // External Services
  {
    id: "supabase",
    position: { x: 20, y: 280 },
    data: { label: "🐘 Supabase\nPostgreSQL" },
    style: {
      ...nodeDefaults.style,
      background: "#d1fae5",
      border: "2px solid #10b981",
      color: "#065f46",
      padding: "12px 20px",
      textAlign: "center",
      whiteSpace: "pre-wrap",
    },
  },
  {
    id: "clerk",
    position: { x: 200, y: 280 },
    data: { label: "🔐 Clerk\nAuthentication" },
    style: {
      ...nodeDefaults.style,
      background: "#ede9fe",
      border: "2px solid #8b5cf6",
      color: "#5b21b6",
      padding: "12px 20px",
      textAlign: "center",
      whiteSpace: "pre-wrap",
    },
  },
  {
    id: "google-cloud",
    position: { x: 390, y: 280 },
    data: { label: "☁️ Google Cloud\nGemini API" },
    style: {
      ...nodeDefaults.style,
      background: "#fef3c7",
      border: "2px solid #f59e0b",
      color: "#92400e",
      padding: "12px 20px",
      textAlign: "center",
      whiteSpace: "pre-wrap",
    },
  },
];

const edges: Edge[] = [
  // Vercel to Supabase
  {
    id: "vercel-to-supabase",
    source: "nextjs-layer",
    target: "supabase",
    type: "smoothstep",
    animated: true,
    style: { stroke: "#10b981", strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#10b981" },
  },
  // Vercel to Clerk
  {
    id: "vercel-to-clerk",
    source: "nextjs-layer",
    target: "clerk",
    type: "smoothstep",
    animated: true,
    style: { stroke: "#8b5cf6", strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#8b5cf6" },
  },
  // Vercel to Google Cloud
  {
    id: "vercel-to-google",
    source: "nextjs-layer",
    target: "google-cloud",
    type: "smoothstep",
    animated: true,
    style: { stroke: "#f59e0b", strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#f59e0b" },
  },
];

export function DeploymentDiagram() {
  return (
    <DiagramWrapper
      nodes={nodes}
      edges={edges}
      title="Deployment Architecture"
      height="420px"
    />
  );
}
