'use client'

import { ReactFlow, Background, Controls, MiniMap, Node, Edge, ConnectionMode } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

interface DiagramWrapperProps {
  nodes: Node[]
  edges: Edge[]
  title?: string
  height?: string
  showMiniMap?: boolean
  showControls?: boolean
}

export function DiagramWrapper({
  nodes,
  edges,
  title,
  height = '500px',
  showMiniMap = false,
  showControls = true,
}: DiagramWrapperProps) {
  return (
    <div className="my-6 rounded-xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-surface)]">
      {title && (
        <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-card)]">
          <h4 className="text-sm font-semibold text-[var(--color-heading)]">{title}</h4>
        </div>
      )}
      <div style={{ height }} className="diagram-container">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          attributionPosition="bottom-left"
          connectionMode={ConnectionMode.Loose}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={true}
          zoomOnScroll={true}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="var(--color-border)" gap={20} size={1} />
          {showControls && <Controls className="diagram-controls" />}
          {showMiniMap && (
            <MiniMap
              nodeColor={(node) => {
                if (node.data?.color) return node.data.color as string
                return 'var(--color-primary)'
              }}
              maskColor="rgba(0,0,0,0.1)"
            />
          )}
        </ReactFlow>
      </div>
    </div>
  )
}
