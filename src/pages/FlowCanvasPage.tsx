import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  addEdge,
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CardNode, type CardNodeType } from '../flow/CardNode';
import { getWorkflow, newId, saveWorkflow } from '../flow/storage';
import type { Workflow } from '../flow/types';
import './flow.css';

const nodeTypes = { card: CardNode };

const DRAG_TYPE = 'application/flow-card';

function FlowEditor({ workflow }: { workflow: Workflow }) {
  const { screenToFlowPosition } = useReactFlow();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState(workflow.name);
  const [nodes, setNodes, onNodesChange] = useNodesState<CardNodeType>(
    workflow.nodes.map((n) => ({ ...n, type: 'card' as const }))
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
    workflow.edges as Edge[]
  );
  const [saved, setSaved] = useState(true);

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) => addEdge({ ...connection, id: newId('edge') }, eds)),
    [setEdges]
  );

  const addCard = useCallback(
    (position: { x: number; y: number }) => {
      setNodes((nds) =>
        nds.concat({
          id: newId('node'),
          type: 'card',
          position,
          data: { heading: '', text: '' },
        })
      );
    },
    [setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!event.dataTransfer.getData(DRAG_TYPE)) return;
      addCard(
        screenToFlowPosition({ x: event.clientX, y: event.clientY })
      );
    },
    [addCard, screenToFlowPosition]
  );

  const addCentered = useCallback(() => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    const point = rect
      ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 3 }
      : { x: 0, y: 0 };
    addCard(screenToFlowPosition(point));
  }, [addCard, screenToFlowPosition]);

  useEffect(() => {
    setSaved(false);
    const timer = setTimeout(() => {
      saveWorkflow({
        id: workflow.id,
        name,
        createdAt: workflow.createdAt,
        nodes: nodes.map((n) => ({
          id: n.id,
          position: n.position,
          data: n.data,
        })),
        edges: edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle,
          targetHandle: e.targetHandle,
        })),
      });
      setSaved(true);
    }, 400);
    return () => clearTimeout(timer);
  }, [nodes, edges, name, workflow.id, workflow.createdAt]);

  return (
    <div className="flow-editor" ref={wrapperRef}>
      <header className="flow-topbar">
        <Link to="/flow" className="flow-back">
          ← Workflows
        </Link>
        <input
          className="flow-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Workflow name"
        />
        <span className="flow-save-state" data-saved={saved}>
          {saved ? 'Saved' : 'Saving…'}
        </span>
      </header>

      <div className="flow-stage">
        <aside className="flow-palette">
          <p className="flow-palette-title">Drag onto canvas</p>
          <div
            className="flow-palette-item"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData(DRAG_TYPE, 'card');
              e.dataTransfer.effectAllowed = 'move';
            }}
          >
            <span className="flow-palette-chip" />
            Card
          </div>
          <button type="button" className="flow-add-btn" onClick={addCentered}>
            + Add card
          </button>
          <p className="flow-palette-hint">
            Drag from a card&apos;s edge dots to connect nodes. Select a node
            and press Delete to remove it.
          </p>
        </aside>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          colorMode="dark"
          connectionMode={ConnectionMode.Loose}
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{ animated: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={22} size={1.5} />
          <MiniMap pannable zoomable />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

export function FlowCanvasPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const workflow = useMemo(() => (id ? getWorkflow(id) : undefined), [id]);

  useEffect(() => {
    if (!workflow) navigate('/flow', { replace: true });
  }, [workflow, navigate]);

  if (!workflow) return <div className="route-fallback" aria-hidden />;

  return (
    <ReactFlowProvider>
      <FlowEditor workflow={workflow} />
    </ReactFlowProvider>
  );
}
