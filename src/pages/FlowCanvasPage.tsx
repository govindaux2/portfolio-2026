import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { RouteFallback } from '../components/RouteFallback';
import {
  addEdge,
  Background,
  BackgroundVariant,
  ConnectionMode,
  MiniMap,
  ReactFlow,
  SelectionMode,
  ReactFlowProvider,
  ViewportPortal,
  useEdgesState,
  useNodesState,
  useReactFlow,
  useStoreApi,
  useConnection,
  type Connection,
  type Edge,
  type Node,
  type OnNodeDrag,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CardNode } from '../flow/CardNode';
import { FlowEdge } from '../flow/FlowEdge';
import { ImageNode } from '../flow/ImageNode';
import { SectionNode } from '../flow/SectionNode';
import { TextNode } from '../flow/TextNode';
import {
  DEFAULTS,
  FONT_STEPS,
  FULL_CROP,
  cardImages,
  clonePages,
  defaultData,
  facingHandles,
  fitImageSize,
  hugCardSize,
  hydrateEdges,
  hydrateNodes,
  imageNaturalSize,
  isMultiSelectEvent,
  isTypingTarget,
  nodesInsideSection,
  readFileAsDataUrl,
  snapDrag,
  snapFontSize,
  snapshot,
  storeEdges,
  storeNodes,
  type Guide,
} from '../flow/model';
import { ColorField } from '../flow/ColorField';
import { canvasDotColor, contrastInk } from '../flow/color';
import { CanvasBgButton } from '../flow/CanvasBgButton';
import { Dropdown } from '../flow/Dropdown';
import { PhoneLink } from '../flow/PhoneLink';
import { writeSelectionClipboard } from '../flow/clipboard';
import {
  CheckIcon,
  CopyIcon,
  LayerBackIcon,
  LayerBackwardIcon,
  LayerForwardIcon,
  LayerFrontIcon,
  TrashIcon,
} from '../flow/icons';
import { ThemeToggle } from '../flow/ThemeToggle';
import { FlowToast } from '../flow/FlowToast';
import { extractUrl, resolvePreview, seedPreview } from '../flow/linkMeta';
import { LinkNode } from '../flow/LinkNode';
import { useCoarsePointer } from '../flow/useCoarsePointer';
import { useFlowStorageTick, useFlowSync } from '../flow/useFlowSync';
import { readTheme, THEME_CANVAS, type FlowTheme } from '../flow/theme';
import { newId } from '../flow/id';
import {
  deleteVersion,
  getWorkflow,
  restoreVersion,
  saveVersion,
  saveWorkflow,
} from '../flow/storage';
import type {
  BoardPage,
  CardData,
  EdgeCap,
  EdgeKind,
  ImageData,
  NodeKind,
  TextBlockData,
  Workflow,
  WorkflowVersion,
} from '../flow/types';
import { EDGE_ARROW_SIZE, EDGE_DOT_SIZE } from '../flow/types';
import './flow.css';

const nodeTypes = {
  card: CardNode,
  text: TextNode,
  section: SectionNode,
  image: ImageNode,
  link: LinkNode,
};

const edgeTypes = {
  default: FlowEdge,
  smoothstep: FlowEdge,
};

function CapIcon({ cap }: { cap: 'none' | 'arrow' | 'circle' }) {
  if (cap === 'none') {
    return (
      <svg width="22" height="12" viewBox="0 0 22 12" aria-hidden>
        <path
          d="M2 6h18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (cap === 'circle') {
    return (
      <svg width="22" height="12" viewBox="0 0 22 12" aria-hidden>
        <path d="M3 6h12" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="17.5" cy="6" r="2.6" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg width="22" height="12" viewBox="0 0 22 12" aria-hidden>
      <path d="M2 6h12" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M14 2.4 20.4 6 14 9.6Z" fill="currentColor" />
    </svg>
  );
}

function LineIcon({ dashed }: { dashed: boolean }) {
  return (
    <svg width="22" height="12" viewBox="0 0 22 12" aria-hidden>
      <path
        d="M2 6h18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray={dashed ? '3.2 2.6' : undefined}
      />
    </svg>
  );
}

function ToolIcon({ id }: { id: Tool }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 18 18',
    fill: 'none' as const,
    'aria-hidden': true,
  };
  if (id === 'select') {
    return (
      <svg {...common}>
        <path
          d="M4 2.4 4 14.6l3.2-3.1 2.4 5.6 1.9-.8-2.4-5.6L13.8 10.4Z"
          fill="currentColor"
          stroke="var(--bg)"
          strokeWidth="1.1"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (id === 'pan') {
    return (
      <svg {...common}>
        <path
          d="M8.1 3.2c0-.7.5-1.2 1.1-1.2s1.1.5 1.1 1.2v5.1h.3V4.4c0-.6.5-1.1 1.1-1.1s1.1.5 1.1 1.1v4.1h.3V5.6c0-.6.5-1.1 1.1-1.1s1.1.5 1.1 1.1v6.2c0 2.4-1.6 4-4.1 4H9.2c-1.8 0-3-.7-3.9-1.9L3.4 11c-.4-.5-.3-1.2.3-1.5.5-.3 1.1-.2 1.5.3l1.3 1.6V3.2Z"
          fill="currentColor"
        />
      </svg>
    );
  }
  if (id === 'connect') {
    return (
      <svg {...common}>
        <circle cx="5" cy="5" r="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="13" cy="13" r="2" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M6.6 6.6c2.2-.8 4.4 1.4 3.6 3.6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (id === 'card') {
    return (
      <svg {...common}>
        <rect x="3" y="4" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 8h6M6 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (id === 'text') {
    return (
      <svg {...common}>
        <path
          d="M5 4.5h8M9 4.5v9M7 13.5h4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (id === 'image') {
    return (
      <svg {...common}>
        <rect x="3" y="4" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="7" cy="8" r="1.1" fill="currentColor" />
        <path d="M4.5 12.5 8 9.6l2.2 2 1.4-1.5 2 2.4" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect
        x="3.2"
        y="4.2"
        width="11.6"
        height="9.6"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="2.4 2"
      />
    </svg>
  );
}

function CanvasZoom() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  return (
    <div className="flow-zoom">
      <button type="button" data-tip="Zoom in" aria-label="Zoom in" onClick={() => zoomIn()}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M4 8h8M8 4v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <button type="button" data-tip="Zoom out" aria-label="Zoom out" onClick={() => zoomOut()}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M4 8h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <button
        type="button"
        data-tip="Fit to view"
        aria-label="Fit to view"
        onClick={() => fitView({ padding: 0.18 })}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M3 6V3h3M13 6V3h-3M3 10v3h3M13 10v3h-3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

const DRAG_TYPE = 'application/flow-kind';

type Tool = 'select' | 'pan' | 'connect' | 'card' | 'text' | 'image' | 'section';

type Clip = { nodes: Node[]; edges: Edge[] };

const LOCK_KEY = 'flow.canvas.locked';

function readCanvasLocked(coarse: boolean) {
  try {
    const stored = sessionStorage.getItem(LOCK_KEY);
    if (stored === '0') return false;
    if (stored === '1') return true;
  } catch {
    /* private mode */
  }
  return coarse;
}

function writeCanvasLocked(next: boolean) {
  try {
    sessionStorage.setItem(LOCK_KEY, next ? '1' : '0');
  } catch {
    /* private mode */
  }
}

function FlowEditor({ workflow }: { workflow: Workflow }) {
  const { screenToFlowPosition, deleteElements, getZoom } = useReactFlow();
  const store = useStoreApi();
  const linking = useConnection((c) => c.inProgress);
  const coarsePointer = useCoarsePointer();
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ x: 240, y: 160 });
  const applyingHistory = useRef(false);
  const lastSnap = useRef('');
  const selectedIdsRef = useRef<string[]>([]);
  const additiveMarqueeRef = useRef<string[]>([]);
  const drawRef = useRef<{
    start: { x: number; y: number } | null;
    current: { x: number; y: number } | null;
  }>({ start: null, current: null });

  const [name, setName] = useState(workflow.name);
  const [pages, setPages] = useState<BoardPage[]>(() => clonePages(workflow.pages));
  const [pageId, setPageId] = useState(workflow.pages[0]?.id ?? '');
  const [versions, setVersions] = useState<WorkflowVersion[]>(workflow.versions);
  const [versionOpen, setVersionOpen] = useState(false);
  const [boardOpen, setBoardOpen] = useState(false);
  const [versionName, setVersionName] = useState('');
  const [guides, setGuides] = useState<Guide[]>([]);
  const [drawRect, setDrawRect] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  const [tool, setTool] = useState<Tool>('select');
  const [locked, setLockedState] = useState(() =>
    readCanvasLocked(coarsePointer)
  );
  const setLocked = (next: boolean) => {
    writeCanvasLocked(next);
    setLockedState(next);
  };
  const [spacePan, setSpacePan] = useState(false);
  const [theme, setTheme] = useState<FlowTheme>(() => readTheme());
  const [canvasBg, setCanvasBg] = useState(workflow.canvasBg);
  const canvasFill = canvasBg || THEME_CANVAS[theme];
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [inspectOpen, setInspectOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const clipRef = useRef<Clip | null>(null);
  const sectionMoveRef = useRef<{
    ids: string[];
    x: number;
    y: number;
  } | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState(
    hydrateNodes((pages.find((p) => p.id === pageId) ?? pages[0])?.nodes ?? [])
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    hydrateEdges(
      (pages.find((p) => p.id === pageId) ?? pages[0])?.edges ?? [],
      hydrateNodes((pages.find((p) => p.id === pageId) ?? pages[0])?.nodes ?? [])
    )
  );
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;
  const toolRef = useRef(tool);
  toolRef.current = tool;
  const lockedRef = useRef(locked);
  lockedRef.current = locked;
  const spacePanRef = useRef(spacePan);
  spacePanRef.current = spacePan;
  const [heldId, setHeldId] = useState<string | null>(null);
  const [lassoRect, setLassoRect] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => {
        const next = [
          n.id === connectFrom ? 'is-connect-from' : '',
          n.id === heldId ? 'is-held' : '',
        ]
          .filter(Boolean)
          .join(' ');
        return n.className === next ? n : { ...n, className: next };
      })
    );
  }, [connectFrom, heldId, setNodes]);

  const pastRef = useRef<string[]>([]);
  const futureRef = useRef<string[]>([]);

  const selectedNodes = nodes.filter((n) => n.selected);
  const selectedEdges = edges.filter((e) => e.selected);
  const selectedCards = selectedNodes.filter((n) => n.type === 'card');
  const selectedTexts = selectedNodes.filter((n) => n.type === 'text');
  const selectedSections = selectedNodes.filter((n) => n.type === 'section');
  const selectedImages = selectedNodes.filter((n) => n.type === 'image');
  const selectedLinks = selectedNodes.filter((n) => n.type === 'link');
  selectedIdsRef.current = selectedNodes.map((n) => n.id);
  const inspectKey = [
    ...selectedNodes.map((n) => n.id),
    ...selectedEdges.map((e) => e.id),
  ]
    .sort()
    .join();

  useEffect(() => {
    setInspectOpen(false);
  }, [inspectKey]);

  useEffect(() => {
    const meta = document.querySelector('meta[name="viewport"]');
    const prev = meta?.getAttribute('content') ?? '';
    meta?.setAttribute(
      'content',
      'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover'
    );
    return () => {
      if (prev) meta?.setAttribute('content', prev);
    };
  }, []);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const onPointerDownCapture = (event: PointerEvent) => {
      store.setState({
        multiSelectionActive: isMultiSelectEvent(event),
      });
    };
    el.addEventListener('pointerdown', onPointerDownCapture, true);
    return () => el.removeEventListener('pointerdown', onPointerDownCapture, true);
  }, [store]);

  useEffect(() => {
    if (!coarsePointer) return;
    store.setState({ multiSelectionActive: tool === 'select' });
  }, [coarsePointer, store, tool]);

  useEffect(() => {
    if (!coarsePointer) return;
    const root = wrapperRef.current;
    if (!root) return;

    type Rec = {
      pointerId: number;
      nodeId: string | null;
      edgeId: string | null;
      sx: number;
      sy: number;
      fx: number;
      fy: number;
      dragging: boolean;
      lassoing: boolean;
      origins: Map<string, { x: number; y: number }>;
    };

    let rec: Rec | null = null;
    let active = 0;

    const onContext = (e: Event) => {
      e.preventDefault();
    };

    const hits = (rect: { x: number; y: number; w: number; h: number }) =>
      new Set(
        nodesRef.current
          .filter((n) => {
            const w = n.width ?? 160;
            const h = n.height ?? 100;
            return (
              n.position.x < rect.x + rect.w &&
              n.position.x + w > rect.x &&
              n.position.y < rect.y + rect.h &&
              n.position.y + h > rect.y
            );
          })
          .map((n) => n.id)
      );

    const onDown = (e: PointerEvent) => {
      if (lockedRef.current) return;
      if (toolRef.current !== 'select' || spacePanRef.current) return;
      const t = e.target as HTMLElement;
      if (
        t.closest(
          '.flow-tools, .flow-zoom, .flow-inspector, .flow-topbar, .flow-dock, .flow-minimap, .flow-node-del, .flow-node-more, .flow-node-menu, .flow-resize-corner, .nodrag'
        )
      ) {
        return;
      }

      const nodeEl = t.closest('.react-flow__node') as HTMLElement | null;
      const edgeEl = t.closest('.react-flow__edge') as HTMLElement | null;
      const onPane = Boolean(
        t.classList.contains('react-flow__pane') || t.closest('.react-flow__pane')
      );
      if (!nodeEl && !edgeEl && !onPane) return;

      active += 1;
      if (active > 1) {
        rec = null;
        setLassoRect(null);
        setHeldId(null);
        return;
      }

      const flow = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      rec = {
        pointerId: e.pointerId,
        nodeId: nodeEl?.getAttribute('data-id') ?? null,
        edgeId: edgeEl?.getAttribute('data-id') ?? null,
        sx: e.clientX,
        sy: e.clientY,
        fx: flow.x,
        fy: flow.y,
        dragging: false,
        lassoing: false,
        origins: new Map(),
      };

      if (rec.nodeId || rec.edgeId) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const onMove = (e: PointerEvent) => {
      if (!rec || rec.pointerId !== e.pointerId || active > 1) return;
      const dist = Math.hypot(e.clientX - rec.sx, e.clientY - rec.sy);
      if (dist < 8 && !rec.dragging && !rec.lassoing) return;

      if (rec.edgeId) return;

      if (rec.nodeId) {
        const nodeId = rec.nodeId;
        const held = nodesRef.current.find((n) => n.id === nodeId) as
          | { locked?: boolean }
          | undefined;
        if (held?.locked) return;
        if (!rec.dragging) {
          rec.dragging = true;
          const id = rec.nodeId;
          const current = nodesRef.current;
          const already = current.some((n) => n.id === id && n.selected);
          const selectedIds = already
            ? current.filter((n) => n.selected).map((n) => n.id)
            : [id];
          rec.origins = new Map(
            current
              .filter((n) => selectedIds.includes(n.id))
              .map((n) => [n.id, { ...n.position }])
          );
          setHeldId(id);
          setNodes((nds) =>
            nds.map((n) => ({ ...n, selected: selectedIds.includes(n.id) }))
          );
          setEdges((eds) => eds.map((ed) => ({ ...ed, selected: false })));
          navigator.vibrate?.(8);
        }
        e.preventDefault();
        const z = getZoom() || 1;
        const dx = (e.clientX - rec.sx) / z;
        const dy = (e.clientY - rec.sy) / z;
        const origins = rec.origins;
        setNodes((nds) =>
          nds.map((n) => {
            const o = origins.get(n.id);
            return o ? { ...n, position: { x: o.x + dx, y: o.y + dy } } : n;
          })
        );
        return;
      }

      rec.lassoing = true;
      e.preventDefault();
      const cur = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const rect = {
        x: Math.min(rec.fx, cur.x),
        y: Math.min(rec.fy, cur.y),
        w: Math.abs(cur.x - rec.fx),
        h: Math.abs(cur.y - rec.fy),
      };
      setLassoRect(rect);
      const ids = hits(rect);
      setNodes((nds) => nds.map((n) => ({ ...n, selected: ids.has(n.id) })));
      setEdges((eds) => eds.map((ed) => ({ ...ed, selected: false })));
    };

    const finish = (e: PointerEvent) => {
      if (e.pointerId === rec?.pointerId || active > 0) active = Math.max(0, active - 1);
      if (!rec || rec.pointerId !== e.pointerId) return;
      const done = rec;
      rec = null;
      setHeldId(null);
      setLassoRect(null);

      if (done.dragging || done.lassoing) return;

      if (done.nodeId) {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === done.nodeId ? { ...n, selected: !n.selected } : n
          )
        );
        setEdges((eds) => eds.map((ed) => ({ ...ed, selected: false })));
        return;
      }
      if (done.edgeId) {
        const id = done.edgeId;
        setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
        setEdges((eds) =>
          eds.map((ed) => ({ ...ed, selected: ed.id === id ? !ed.selected : false }))
        );
        return;
      }
      setNodes((nds) => nds.map((n) => (n.selected ? { ...n, selected: false } : n)));
      setEdges((eds) => eds.map((ed) => (ed.selected ? { ...ed, selected: false } : ed)));
    };

    root.addEventListener('contextmenu', onContext);
    root.addEventListener('pointerdown', onDown, true);
    root.addEventListener('pointermove', onMove, true);
    root.addEventListener('pointerup', finish, true);
    root.addEventListener('pointercancel', finish, true);
    return () => {
      root.removeEventListener('contextmenu', onContext);
      root.removeEventListener('pointerdown', onDown, true);
      root.removeEventListener('pointermove', onMove, true);
      root.removeEventListener('pointerup', finish, true);
      root.removeEventListener('pointercancel', finish, true);
    };
  }, [coarsePointer, getZoom, screenToFlowPosition, setEdges, setNodes]);

  const commitPages = useCallback(
    (nextNodes: Node[], nextEdges: Edge[], nextPageId = pageId) => {
      setPages((ps) =>
        ps.map((p) =>
          p.id === nextPageId
            ? { ...p, nodes: storeNodes(nextNodes), edges: storeEdges(nextEdges) }
            : p
        )
      );
    },
    [pageId]
  );

  const loadPage = useCallback(
    (id: string, source = pages) => {
      const next = source.find((p) => p.id === id) ?? source[0];
      if (!next) return;
      setPageId(next.id);
      const nextNodes = hydrateNodes(next.nodes);
      setNodes(nextNodes);
      setEdges(hydrateEdges(next.edges, nextNodes));
      pastRef.current = [];
      futureRef.current = [];
      lastSnap.current = snapshot(nextNodes, hydrateEdges(next.edges, nextNodes));
      setCanUndo(false);
      setCanRedo(false);
    },
    [pages, setEdges, setNodes]
  );

  useEffect(() => {
    const snap = snapshot(nodes, edges);
    if (applyingHistory.current) {
      applyingHistory.current = false;
      lastSnap.current = snap;
      commitPages(nodes, edges);
      return;
    }
    if (snap === lastSnap.current) return;
    const timer = setTimeout(() => {
      if (lastSnap.current) pastRef.current.push(lastSnap.current);
      futureRef.current = [];
      lastSnap.current = snap;
      setCanUndo(pastRef.current.length > 0);
      setCanRedo(false);
      commitPages(nodes, edges);
    }, 280);
    return () => clearTimeout(timer);
  }, [nodes, edges, commitPages]);

  const applySnap = (raw: string) => {
    const parsed = JSON.parse(raw) as {
      nodes: BoardPage['nodes'];
      edges: BoardPage['edges'];
    };
    applyingHistory.current = true;
    const nextNodes = hydrateNodes(parsed.nodes);
    const nextEdges = hydrateEdges(parsed.edges, nextNodes);
    setNodes(nextNodes);
    setEdges(nextEdges);
    lastSnap.current = raw;
    commitPages(nextNodes, nextEdges);
  };

  const undo = useCallback(() => {
    const prev = pastRef.current.pop();
    if (!prev) return;
    futureRef.current.push(snapshot(nodes, edges));
    applySnap(prev);
    setCanUndo(pastRef.current.length > 0);
    setCanRedo(true);
  }, [edges, nodes, setEdges, setNodes]);

  const redo = useCallback(() => {
    const next = futureRef.current.pop();
    if (!next) return;
    pastRef.current.push(snapshot(nodes, edges));
    applySnap(next);
    setCanUndo(true);
    setCanRedo(futureRef.current.length > 0);
  }, [edges, nodes, setEdges, setNodes]);

  const persist = useCallback(
    (nextPages = pages, nextVersions = versions, nextName = name) => {
      saveWorkflow({
        id: workflow.id,
        name: nextName,
        createdAt: workflow.createdAt,
        pages: nextPages,
        versions: nextVersions,
        canvasBg,
      });
    },
    [canvasBg, name, pages, versions, workflow.createdAt, workflow.id]
  );

  useEffect(() => {
    const timer = setTimeout(() => persist(), 400);
    return () => clearTimeout(timer);
  }, [pages, name, versions, canvasBg, persist]);

  useLayoutEffect(() => {
    setEdges((eds) => {
      if (!eds.length) return eds;
      const byId = new Map(nodes.map((n) => [n.id, n]));
      let changed = false;
      const next = eds.map((e) => {
        const from = byId.get(e.source);
        const to = byId.get(e.target);
        if (!from || !to) return e;
        const face = facingHandles(from, to);
        if (
          e.sourceHandle === face.sourceHandle &&
          e.targetHandle === face.targetHandle
        ) {
          return e;
        }
        changed = true;
        return {
          ...e,
          sourceHandle: face.sourceHandle,
          targetHandle: face.targetHandle,
        };
      });
      return changed ? next : eds;
    });
  }, [nodes, setEdges]);

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) => {
        const from = nodes.find((n) => n.id === connection.source);
        const to = nodes.find((n) => n.id === connection.target);
        const face =
          from && to ? facingHandles(from, to) : {};
        return addEdge(
          {
            ...connection,
            ...face,
            id: newId('edge'),
            type: 'default',
            animated: true,
            style: { stroke: 'var(--accent)', strokeWidth: 1.75 },
            data: {
              color: '',
              kind: 'curved' as EdgeKind,
              label: '',
              startCap: 'none' as const,
              endCap: 'arrow' as const,
              midCap: false,
            },
          },
          eds
        );
      }),
    [nodes, setEdges]
  );

  const linkNodes = useCallback(
    (from: Node, to: Node) => {
      if (from.id === to.id) return;
      setEdges((eds) => {
        if (
          eds.some(
            (e) =>
              (e.source === from.id && e.target === to.id) ||
              (e.source === to.id && e.target === from.id)
          )
        ) {
          return eds;
        }
        return addEdge(
          {
            ...facingHandles(from, to),
            source: from.id,
            target: to.id,
            id: newId('edge'),
            type: 'default',
            animated: true,
            style: { stroke: 'var(--accent)', strokeWidth: 1.75 },
            data: {
              color: '',
              kind: 'curved' as EdgeKind,
              label: '',
              startCap: 'none' as const,
              endCap: 'arrow' as const,
              midCap: false,
            },
          },
          eds
        );
      });
    },
    [setEdges]
  );

  const connectSelected = useCallback(() => {
    const picked = nodes
      .filter((n) => n.selected)
      .sort(
        (a, b) =>
          a.position.x - b.position.x || a.position.y - b.position.y
      );
    for (let i = 0; i < picked.length - 1; i++) {
      linkNodes(picked[i], picked[i + 1]);
    }
  }, [linkNodes, nodes]);

  const deleteSelection = useCallback(() => {
    const n = nodes.filter((x) => x.selected).map((x) => ({ id: x.id }));
    const e = edges.filter((x) => x.selected).map((x) => ({ id: x.id }));
    if (!n.length && !e.length) return;
    deleteElements({ nodes: n, edges: e });
  }, [deleteElements, edges, nodes]);

  const addNodeAt = useCallback(
    (
      type: NodeKind,
      position: { x: number; y: number },
      extra?: Record<string, unknown>,
      size: { w: number; h: number } = DEFAULTS[type]
    ) => {
      setNodes((nds) => [
        ...nds.map((n) => (n.selected ? { ...n, selected: false } : n)),
        {
          id: newId('node'),
          type,
          position,
          width: size.w,
          height: size.h,
          style: { width: size.w, height: size.h },
          zIndex: type === 'section' ? -10 : 1,
          selected: true,
          data: { ...defaultData(type), ...extra },
        },
      ]);
      setEdges((eds) =>
        eds.some((e) => e.selected)
          ? eds.map((e) => (e.selected ? { ...e, selected: false } : e))
          : eds
      );
      setTool('select');
    },
    [setEdges, setNodes]
  );

  const addImageAt = useCallback(
    async (file: File, position: { x: number; y: number }) => {
      const src = await readFileAsDataUrl(file);
      const natural = await imageNaturalSize(src);
      const size = fitImageSize(natural.w, natural.h);
      addNodeAt('image', position, { src }, size);
    },
    [addNodeAt]
  );

  const addLinkAt = useCallback(
    (url: string, position: { x: number; y: number }, replaceId?: string) => {
      const seed = seedPreview(url);
      const size = DEFAULTS.link;
      if (replaceId) {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === replaceId
              ? {
                  ...n,
                  type: 'link',
                  width: size.w,
                  height: size.h,
                  style: { ...n.style, width: size.w, height: size.h },
                  data: seed,
                  selected: true,
                }
              : { ...n, selected: false }
          )
        );
      } else {
        addNodeAt('link', position, seed, { w: size.w, h: size.h });
      }
      resolvePreview(url).then((preview) => {
        setNodes((nds) =>
          nds.map((n) =>
            n.type === 'link' && (n.data as { url?: string }).url === url
              ? { ...n, data: preview }
              : n
          )
        );
      });
    },
    [addNodeAt, setNodes]
  );

  const addCentered = useCallback(
    (type: NodeKind = 'card') => {
      const rect = wrapperRef.current?.getBoundingClientRect();
      const point = rect
        ? { x: rect.left + 280 + rect.width / 3, y: rect.top + rect.height / 3 }
        : { x: 0, y: 0 };
      addNodeAt(type, screenToFlowPosition(point));
    },
    [addNodeAt, screenToFlowPosition]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = event.dataTransfer.files?.length
      ? 'copy'
      : 'move';
  }, []);

  const onDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();
      const pos = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      const files = [...event.dataTransfer.files].filter((f) =>
        f.type.startsWith('image/')
      );
      if (files.length) {
        for (let i = 0; i < files.length; i++) {
          await addImageAt(files[i], { x: pos.x + i * 24, y: pos.y + i * 24 });
        }
        return;
      }
      const type = event.dataTransfer.getData(DRAG_TYPE) as NodeKind;
      if (type) addNodeAt(type, pos);
      const dropped = event.dataTransfer.getData('text/uri-list') || event.dataTransfer.getData('text/plain');
      const url = extractUrl(dropped);
      if (url) addLinkAt(url, pos);
    },
    [addImageAt, addLinkAt, addNodeAt, screenToFlowPosition]
  );

  const onNodeDragStart: OnNodeDrag = useCallback(
    (event, node) => {
      const live = nodes.find((n) => n.id === node.id) ?? node;
      if (live.type === 'section') {
        sectionMoveRef.current = {
          ids: nodesInsideSection(live, nodes).map((n) => n.id),
          x: node.position.x,
          y: node.position.y,
        };
      } else {
        sectionMoveRef.current = null;
      }
      if (!('altKey' in event) || !event.altKey) return;

      const seeds = nodes.filter((n) => n.selected || n.id === node.id);
      const members = seeds.flatMap((n) =>
        n.type === 'section' ? nodesInsideSection(n, nodes) : []
      );
      const unique = new Map<string, Node>();
      for (const n of [...seeds, ...members]) unique.set(n.id, n);
      const group = [...unique.values()];
      const idMap = new Map(group.map((n) => [n.id, newId('node')]));
      const copies = group.map((n) => ({
        ...n,
        id: idMap.get(n.id)!,
        selected: false,
        dragging: false,
        position: { ...n.position },
      }));
      const ids = new Set(group.map((n) => n.id));
      const edgeCopies = edges
        .filter((e) => ids.has(e.source) && ids.has(e.target))
        .map((e) => ({
          ...e,
          id: newId('edge'),
          selected: false,
          source: idMap.get(e.source)!,
          target: idMap.get(e.target)!,
        }));
      setNodes((nds) => nds.concat(copies));
      if (edgeCopies.length) setEdges((eds) => eds.concat(edgeCopies));
    },
    [edges, nodes, setEdges, setNodes]
  );

  const onNodeDrag: OnNodeDrag = useCallback(
    (_e, node) => {
      const pack = sectionMoveRef.current;
      if (node.type === 'section' && pack) {
        const dx = node.position.x - pack.x;
        const dy = node.position.y - pack.y;
        if (dx || dy) {
          const idSet = new Set(pack.ids);
          setNodes((nds) =>
            nds.map((n) =>
              idSet.has(n.id)
                ? {
                    ...n,
                    position: { x: n.position.x + dx, y: n.position.y + dy },
                  }
                : n
            )
          );
          sectionMoveRef.current = { ...pack, x: node.position.x, y: node.position.y };
        }
        setGuides([]);
        return;
      }

      const selected = nodes.filter((n) => n.selected).length;
      if (selected > 1) {
        setGuides([]);
        return;
      }
      const others = nodes.filter((n) => n.id !== node.id && n.type !== 'section');
      const { position, guides: nextGuides } = snapDrag(node, others);
      setGuides(nextGuides);
      if (position.x !== node.position.x || position.y !== node.position.y) {
        setNodes((nds) =>
          nds.map((n) => (n.id === node.id ? { ...n, position } : n))
        );
      }
    },
    [nodes, setNodes]
  );

  const updateSelectedCard = (patch: Partial<CardData>) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.selected && n.type === 'card'
          ? { ...n, data: { ...n.data, ...patch } }
          : n
      )
    );
  };

  const updateSelectedText = (patch: Partial<TextBlockData>) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.selected && n.type === 'text'
          ? { ...n, data: { ...n.data, ...patch } }
          : n
      )
    );
  };

  const updateSelectedFill = (color?: string) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (!n.selected) return n;
        if (n.type === 'card') return { ...n, data: { ...n.data, background: color } };
        if (n.type === 'section') return { ...n, data: { ...n.data, color } };
        return n;
      })
    );
  };

  const updateSelectedInk = (key: 'headingColor' | 'textColor', color?: string) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.selected && n.type === 'card'
          ? { ...n, data: { ...n.data, [key]: color } }
          : n
      )
    );
  };

  const updateSelectedEdge = (patch: {
    color?: string | undefined;
    kind?: EdgeKind;
    label?: string;
    startCap?: EdgeCap;
    endCap?: EdgeCap;
    midCap?: boolean;
    dashed?: boolean;
    arrowSize?: number;
    dotSize?: number;
  }) => {
    setEdges((eds) =>
      eds.map((e) => {
        if (!e.selected) return e;
        const data = { ...(e.data as object), ...patch } as {
          color?: string;
          kind?: EdgeKind;
          label?: string;
          dashed?: boolean;
        };
        const kind = data.kind as EdgeKind | undefined;
        return {
          ...e,
          data,
          type: kind === 'angular' ? 'smoothstep' : 'default',
          label: data.label,
          style: {
            ...e.style,
            stroke: data.color || 'var(--accent)',
            strokeWidth: 1.75,
            strokeDasharray: data.dashed ? '7 6' : 'none',
          },
        };
      })
    );
  };

  const addPage = () => {
    const next = {
      id: newId('page'),
      name: `Board ${pages.length + 1}`,
      nodes: [],
      edges: [],
    };
    const nextPages = [...pages.map((p) =>
      p.id === pageId ? { ...p, nodes: storeNodes(nodes), edges: storeEdges(edges) } : p
    ), next];
    setPages(nextPages);
    loadPage(next.id, nextPages);
  };

  const renamePage = (id: string, next: string) => {
    if (!next.trim()) return;
    setPages((ps) =>
      ps.map((p) => (p.id === id ? { ...p, name: next.trim() } : p))
    );
  };

  const switchPage = (id: string) => {
    if (id === pageId) return;
    const nextPages = pages.map((pageItem) =>
      pageItem.id === pageId
        ? { ...pageItem, nodes: storeNodes(nodes), edges: storeEdges(edges) }
        : pageItem
    );
    setPages(nextPages);
    loadPage(id, nextPages);
  };

  const nudgeLayer = useCallback(
    (dir: 'forward' | 'backward' | 'front' | 'back') => {
      setNodes((nds) => {
        const selected = new Set(nds.filter((n) => n.selected).map((n) => n.id));
        if (!selected.size) return nds;
        const ranked = [...nds].sort(
          (a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0) || a.id.localeCompare(b.id)
        );
        if (dir === 'front') {
          const max = Math.max(...ranked.map((n) => n.zIndex ?? 0), 0);
          let step = 1;
          return nds.map((n) =>
            selected.has(n.id) ? { ...n, zIndex: max + step++ } : n
          );
        }
        if (dir === 'back') {
          const min = Math.min(...ranked.map((n) => n.zIndex ?? 0), 0);
          let step = selected.size;
          return nds.map((n) =>
            selected.has(n.id) ? { ...n, zIndex: min - step-- } : n
          );
        }
        const order = ranked.map((n) => n.id);
        if (dir === 'forward') {
          for (let i = order.length - 2; i >= 0; i--) {
            if (selected.has(order[i]) && !selected.has(order[i + 1])) {
              const swap = order[i];
              order[i] = order[i + 1];
              order[i + 1] = swap;
            }
          }
        } else {
          for (let i = 1; i < order.length; i++) {
            if (selected.has(order[i]) && !selected.has(order[i - 1])) {
              const swap = order[i];
              order[i] = order[i - 1];
              order[i - 1] = swap;
            }
          }
        }
        const zFor = new Map(order.map((id, i) => [id, i + 1]));
        return nds.map((n) => ({ ...n, zIndex: zFor.get(n.id) ?? n.zIndex }));
      });
    },
    [setNodes]
  );

  const copySelection = useCallback(() => {
    const picked = nodes.filter((n) => n.selected);
    if (!picked.length) return;
    const extras = picked.flatMap((n) =>
      n.type === 'section' ? nodesInsideSection(n, nodes) : []
    );
    const unique = new Map<string, Node>();
    for (const n of [...picked, ...extras]) unique.set(n.id, n);
    const group = [...unique.values()];
    const ids = new Set(group.map((n) => n.id));
    clipRef.current = {
      nodes: group,
      edges: edges.filter((e) => ids.has(e.source) && ids.has(e.target)),
    };
    void writeSelectionClipboard(group);
  }, [edges, nodes]);

  const pasteClipboard = useCallback(() => {
    const clip = clipRef.current;
    if (!clip?.nodes.length) return;
    const idMap = new Map(clip.nodes.map((n) => [n.id, newId('node')]));
    const nextNodes = clip.nodes.map((n) => ({
      ...n,
      id: idMap.get(n.id)!,
      selected: true,
      position: { x: n.position.x + 40, y: n.position.y + 40 },
    }));
    const nextEdges = clip.edges.map((e) => ({
      ...e,
      id: newId('edge'),
      source: idMap.get(e.source)!,
      target: idMap.get(e.target)!,
      selected: true,
    }));
    setNodes((nds) => [
      ...nds.map((n) => ({ ...n, selected: false })),
      ...nextNodes,
    ]);
    setEdges((eds) => [
      ...eds.map((e) => ({ ...e, selected: false })),
      ...nextEdges,
    ]);
  }, [setEdges, setNodes]);

  const removePage = (id: string) => {
    if (pages.length < 2) return;
    const board = pages.find((p) => p.id === id);
    if (
      !window.confirm(
        `Delete board “${board?.name ?? 'Board'}”? This cannot be undone.`
      )
    )
      return;
    const nextPages = pages.filter((p) => p.id !== id);
    setPages(nextPages);
    if (id === pageId) loadPage(nextPages[0].id, nextPages);
  };

  const onSaveVersion = (label?: string) => {
    const nameToSave = (label ?? versionName).trim() || `Version ${versions.length + 1}`;
    const currentPages = pages.map((p) =>
      p.id === pageId ? { ...p, nodes: storeNodes(nodes), edges: storeEdges(edges) } : p
    );
    const savedWf = saveVersion(workflow.id, nameToSave, currentPages);
    if (savedWf) {
      setVersions(savedWf.versions);
      setVersionName('');
    }
  };

  const onRestoreVersion = (version: WorkflowVersion) => {
    if (!window.confirm(`Restore “${version.name}”? Live boards will be replaced.`))
      return;
    const restored = restoreVersion(workflow.id, version.id);
    if (!restored) return;
    setPages(clonePages(restored.pages));
    setVersions(restored.versions);
    loadPage(restored.pages[0].id, restored.pages);
  };

  const onDeleteVersion = (version: WorkflowVersion) => {
    if (!window.confirm(`Delete version “${version.name}”?`)) return;
    const savedWf = deleteVersion(workflow.id, version.id);
    if (savedWf) setVersions(savedWf.versions);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (isTypingTarget(e.target)) return;
      if (e.code === 'Space') {
        if (!e.repeat) setSpacePan(true);
        e.preventDefault();
        return;
      }
      if (e.key === 'Escape') {
        setTool('select');
        setConnectFrom(null);
      }
      if (!mod && e.key.toLowerCase() === 'v') setTool('select');
      if (!mod && e.key.toLowerCase() === 'h') setTool('pan');
      if (!mod && e.key.toLowerCase() === 'l') setTool('connect');
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
      if (mod && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        copySelection();
      }
      if (mod && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        copySelection();
        pasteClipboard();
      }
      if (mod && e.key.toLowerCase() === 'v') {
        if (clipRef.current?.nodes.length) {
          e.preventDefault();
          pasteClipboard();
        }
      }
      if (e.key === ']' || e.key === '[') {
        e.preventDefault();
        const dir =
          e.key === ']'
            ? mod
              ? 'front'
              : 'forward'
            : mod
              ? 'back'
              : 'backward';
        nudgeLayer(dir);
      }
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpacePan(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onUp);
    };
  }, [copySelection, nudgeLayer, pasteClipboard, redo, undo]);

  useEffect(() => {
    const onPaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      const imageItem = items
        ? [...items].find((i) => i.type.startsWith('image/'))
        : undefined;
      const file =
        imageItem?.getAsFile() ??
        [...(e.clipboardData?.files ?? [])].find((f) =>
          f.type.startsWith('image/')
        );
      if (file) {
        const cards = nodes.filter((n) => n.selected && n.type === 'card');
        const imageNodes = nodes.filter((n) => n.selected && n.type === 'image');
        e.preventDefault();
        const src = await readFileAsDataUrl(file);
        if (cards.length) {
          setNodes((nds) =>
            nds.map((n) => {
              if (n.type !== 'card' || !n.selected) return n;
              const prev = cardImages(n.data as CardData);
              const images = [...prev, src];
              const size = hugCardSize(
                n.width ?? DEFAULTS.card.w,
                images.length
              );
              return {
                ...n,
                width: size.w,
                height: size.h,
                style: { ...n.style, width: size.w, height: size.h },
                data: { ...n.data, images, image: undefined },
              };
            })
          );
          return;
        }
        if (imageNodes.length) {
          const natural = await imageNaturalSize(src);
          const size = fitImageSize(natural.w, natural.h);
          setNodes((nds) =>
            nds.map((n) =>
              n.type === 'image' && n.selected
                ? {
                    ...n,
                    width: size.w,
                    height: size.h,
                    style: { ...n.style, width: size.w, height: size.h },
                    data: {
                      ...n.data,
                      src,
                      crop: { ...FULL_CROP },
                      cropMode: false,
                    },
                  }
                : n
            )
          );
          return;
        }
        await addImageAt(file, screenToFlowPosition(pointerRef.current));
        return;
      }
      const pasted = e.clipboardData?.getData('text/plain') ?? '';
      const url = extractUrl(pasted);
      if (url) {
        const textNode = nodes.find((n) => n.selected && n.type === 'text');
        e.preventDefault();
        addLinkAt(
          url,
          textNode?.position ?? screenToFlowPosition(pointerRef.current),
          textNode?.id
        );
        return;
      }
      if (isTypingTarget(e.target)) return;
      if (clipRef.current?.nodes.length) {
        e.preventDefault();
        pasteClipboard();
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [addImageAt, addLinkAt, nodes, pasteClipboard, screenToFlowPosition, setNodes]);

  const onSectionPointerDown = (e: React.PointerEvent) => {
    if (locked || tool !== 'section') return;
    const target = e.target as HTMLElement;
    if (
      target.closest(
        '.flow-tools, .flow-zoom, .flow-inspector, .flow-topbar, .flow-dock, .flow-minimap, .flow-node-del, .flow-node-more, .flow-node-menu'
      )
    ) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const start = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    drawRef.current = { start, current: start };
    setDrawRect({ x: start.x, y: start.y, w: 0, h: 0 });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    pointerRef.current = { x: e.clientX, y: e.clientY };
    if (!drawRef.current.start) return;
    const current = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    drawRef.current.current = current;
    const s = drawRef.current.start;
    setDrawRect({
      x: Math.min(s.x, current.x),
      y: Math.min(s.y, current.y),
      w: Math.abs(current.x - s.x),
      h: Math.abs(current.y - s.y),
    });
  };

  const finishDraw = () => {
    const start = drawRef.current.start;
    const current = drawRef.current.current;
    drawRef.current = { start: null, current: null };
    setDrawRect(null);
    if (tool !== 'section' || !start || !current) return;
    const x = Math.min(start.x, current.x);
    const y = Math.min(start.y, current.y);
    const w = Math.abs(current.x - start.x);
    const h = Math.abs(current.y - start.y);
    setTool('select');
    if (w < 48 || h < 48) return;
    setNodes((nds) =>
      nds.concat({
        id: newId('node'),
        type: 'section',
        position: { x, y },
        width: w,
        height: h,
        style: { width: w, height: h },
        zIndex: -10,
        data: defaultData('section'),
      })
    );
  };

  const chooseTool = (next: Tool) => {
    if (locked) return;
    if (next === 'image') {
      fileRef.current?.click();
      return;
    }
    if (next === tool && next !== 'select' && next !== 'pan' && next !== 'connect') {
      setTool('select');
      setConnectFrom(null);
      return;
    }
    setTool(next);
    if (next !== 'connect') setConnectFrom(null);
    if (next === 'card' || next === 'text') addCentered(next);
  };

  return (
    <div
      className={`flow-editor${linking || tool === 'connect' ? ' is-connecting' : ''}${locked ? ' is-locked' : ''}`}
      data-theme={theme}
      data-tool={tool}
      data-coarse={coarsePointer ? 'true' : 'false'}
      data-locked={locked ? 'true' : 'false'}
      ref={wrapperRef}
    >
      <header className="flow-topbar">
        <Link to="/flow" className="flow-back">
          Workflows
        </Link>
        <input
          className="flow-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Workflow name"
        />
        <Dropdown
          open={boardOpen}
          onOpenChange={(open) => {
            setBoardOpen(open);
            if (open) setVersionOpen(false);
          }}
          label={pages.find((p) => p.id === pageId)?.name ?? 'Board'}
        >
          {pages.map((p) => (
            <div key={p.id} className="flow-dd-row" data-on={p.id === pageId}>
              <button
                type="button"
                className="flow-dd-row-main"
                onClick={() => {
                  switchPage(p.id);
                  setBoardOpen(false);
                }}
                onDoubleClick={() => {
                  const next = window.prompt('Rename board', p.name);
                  if (next?.trim()) renamePage(p.id, next.trim());
                }}
              >
                {p.name}
                {p.id === pageId ? (
                  <span className="flow-dd-check">
                    <CheckIcon size={13} />
                  </span>
                ) : null}
              </button>
              {pages.length > 1 ? (
                <button
                  type="button"
                  className="flow-dd-row-del"
                  aria-label={`Delete ${p.name}`}
                  onClick={() => removePage(p.id)}
                >
                  <TrashIcon size={13} />
                </button>
              ) : null}
            </div>
          ))}
          <button
            type="button"
            className="flow-dd-add"
            onClick={() => addPage()}
          >
            New board
          </button>
        </Dropdown>
        <div className="flow-top-actions">
          <button
            type="button"
            className="flow-icon-btn"
            disabled={!canUndo}
            onClick={undo}
            data-tip="Undo"
            aria-label="Undo"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M6.2 4.2 3.4 7l2.8 2.8M3.6 7h6.2a3.2 3.2 0 1 1 0 6.4H8"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className="flow-icon-btn"
            disabled={!canRedo}
            onClick={redo}
            data-tip="Redo"
            aria-label="Redo"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M9.8 4.2 12.6 7 9.8 9.8M12.4 7H6.2a3.2 3.2 0 1 0 0 6.4H8"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <Dropdown
            open={versionOpen}
            onOpenChange={(open) => {
              setVersionOpen(open);
              if (open) setBoardOpen(false);
            }}
            label="Versions"
            align="right"
          >
            <form
              className="flow-version-add"
              onSubmit={(e) => {
                e.preventDefault();
                onSaveVersion();
              }}
            >
              <input
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                placeholder={`Version ${versions.length + 1}`}
                aria-label="New version name"
              />
              <button type="submit">
                {versions.length === 0 ? 'Add' : 'Save'}
              </button>
            </form>
            <div className="flow-version-list">
              {versions.length === 0 ? (
                <p className="flow-version-empty">No versions yet.</p>
              ) : (
                versions.map((v) => (
                  <div key={v.id} className="flow-dd-row">
                    <button
                      type="button"
                      className="flow-dd-row-main"
                      onClick={() => {
                        onRestoreVersion(v);
                        setVersionOpen(false);
                      }}
                    >
                      <span>
                        <strong>{v.name}</strong>
                        <em>
                          {new Date(v.createdAt).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </em>
                      </span>
                    </button>
                    <button
                      type="button"
                      className="flow-dd-row-del"
                      aria-label={`Delete ${v.name}`}
                      onClick={() => onDeleteVersion(v)}
                    >
                      <TrashIcon size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </Dropdown>
          <ThemeToggle theme={theme} onChange={setTheme} />
          <PhoneLink />
          <CanvasBgButton
            value={canvasBg}
            fallback={THEME_CANVAS[theme]}
            onChange={(color) => setCanvasBg(color)}
          />
        </div>
      </header>

      <div className="flow-stage">
        <div
          className="flow-canvas-wrap"
          style={{ ['--flow-canvas' as string]: canvasFill }}
          onPointerDown={onSectionPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={finishDraw}
          onPointerCancel={finishDraw}
        >
        <CanvasZoom />

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeDragStart={onNodeDragStart}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={() => {
            setGuides([]);
            sectionMoveRef.current = null;
          }}
          onNodeClick={(e, node) => {
            if (coarsePointer && tool === 'select') {
              e.stopPropagation();
              return;
            }
            if (tool !== 'connect') return;
            const from = nodes.find((n) => n.id === connectFrom);
            if (!from || from.id === node.id) {
              setConnectFrom(node.id);
              return;
            }
            linkNodes(from, node);
            setConnectFrom(node.id);
          }}
          onPaneClick={() => setConnectFrom(null)}
          onEdgeDoubleClick={(_e, edge) => {
            setEdges((eds) =>
              eds.map((e) =>
                e.id === edge.id
                  ? { ...e, selected: true, data: { ...e.data, editing: true } }
                  : { ...e, selected: false }
              )
            );
          }}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          zoomOnScroll={false}
          panOnScroll={!coarsePointer}
          panOnScrollSpeed={1.15}
          zoomOnPinch
          zoomOnDoubleClick={!coarsePointer}
          minZoom={0.12}
          maxZoom={3.5}
          preventScrolling
          colorMode={theme}
          style={{ background: canvasFill }}
          connectionMode={ConnectionMode.Loose}
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{ animated: true, type: 'default' }}
          nodesDraggable={!locked && tool !== 'connect' && tool !== 'pan'}
          nodesConnectable={!locked && tool === 'connect'}
          elementsSelectable={!locked && tool !== 'pan'}
          panOnDrag={
            locked || tool === 'pan' || spacePan
              ? true
              : tool === 'section' || tool === 'connect'
                ? false
                : coarsePointer
                  ? false
                  : [1, 2]
          }
          selectionOnDrag={!locked && tool === 'select' && !spacePan}
          selectionMode={SelectionMode.Partial}
          selectionKeyCode={null}
          multiSelectionKeyCode={['Shift', 'Meta', 'Control']}
          selectNodesOnDrag={!locked && tool !== 'connect' && tool !== 'pan'}
          onSelectionStart={(event) => {
            additiveMarqueeRef.current = isMultiSelectEvent(event)
              ? [...selectedIdsRef.current]
              : [];
          }}
          onSelectionEnd={() => {
            const keep = additiveMarqueeRef.current;
            additiveMarqueeRef.current = [];
            if (!keep.length) return;
            const extra = new Set(keep);
            setNodes((nds) =>
              nds.map((n) => (extra.has(n.id) ? { ...n, selected: true } : n))
            );
          }}
          className={
            tool === 'section'
              ? 'is-drawing'
              : tool === 'connect'
                ? 'is-connecting'
                : tool === 'pan' || spacePan
                  ? 'is-panning'
                  : 'is-selecting'
          }
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={22}
            size={1.5}
            bgColor={canvasFill}
            color={canvasDotColor(canvasFill)}
          />
          {coarsePointer ? null : (
            <MiniMap pannable zoomable className="flow-minimap" />
          )}
          <ViewportPortal>
            {guides.map((g, i) => (
              <div
                key={`${g.axis}-${g.at}-${i}`}
                className={`flow-guide is-${g.axis}`}
                style={g.axis === 'x' ? { left: g.at } : { top: g.at }}
              />
            ))}
            {drawRect ? (
              <div
                className="flow-draw-rect"
                style={{
                  left: drawRect.x,
                  top: drawRect.y,
                  width: drawRect.w,
                  height: drawRect.h,
                }}
              />
            ) : null}
            {lassoRect ? (
              <div
                className="flow-lasso-rect"
                style={{
                  left: lassoRect.x,
                  top: lassoRect.y,
                  width: lassoRect.w,
                  height: lassoRect.h,
                }}
              />
            ) : null}
          </ViewportPortal>
        </ReactFlow>

        {!locked && (selectedNodes.length || selectedEdges.length) ? (
          <aside
            className={`flow-inspector${coarsePointer ? ' is-mobile' : ''}${coarsePointer && inspectOpen ? ' is-open' : ''}`}
          >
            {coarsePointer ? (
              <button
                type="button"
                className="flow-inspect-grab"
                aria-label={inspectOpen ? 'Hide style' : 'Show style'}
                onClick={() => setInspectOpen((v) => !v)}
              />
            ) : null}
            <div className="flow-inspect-head">
              <p className="flow-palette-title">
                {selectedNodes.length + selectedEdges.length > 1
                  ? `${selectedNodes.length + selectedEdges.length} selected`
                  : selectedCards.length
                    ? 'Card'
                    : selectedTexts.length
                      ? 'Text'
                      : selectedSections.length
                        ? 'Section'
                        : selectedImages.length
                          ? 'Image'
                          : selectedLinks.length
                            ? 'Link'
                            : 'Line'}
              </p>
              {coarsePointer ? (
                <button
                  type="button"
                  className="flow-field-btn flow-inspect-toggle"
                  aria-expanded={inspectOpen}
                  onClick={() => setInspectOpen((v) => !v)}
                >
                  {inspectOpen ? 'Done' : 'Style'}
                </button>
              ) : null}
              {coarsePointer && !inspectOpen ? (
                <button
                  type="button"
                  className="flow-icon-btn"
                  onClick={copySelection}
                  aria-label="Copy"
                >
                  <CopyIcon size={15} />
                </button>
              ) : null}
              <button
                type="button"
                className="flow-icon-btn flow-delete-btn"
                onClick={deleteSelection}
                aria-label="Delete"
              >
                <TrashIcon size={15} />
              </button>
            </div>
            {coarsePointer && !inspectOpen ? null : (
              <>
            {selectedNodes.length ? (
              <div className="flow-ctx" role="toolbar" aria-label="Node actions">
                <button type="button" onClick={copySelection}>
                  <CopyIcon size={15} />
                  Copy
                </button>
                <span className="flow-ctx-rule" />
                <button
                  type="button"
                  data-tip="Bring to front"
                  aria-label="Bring to front"
                  onClick={() => nudgeLayer('front')}
                >
                  <LayerFrontIcon size={15} />
                </button>
                <button
                  type="button"
                  data-tip="Bring forward"
                  aria-label="Bring forward"
                  onClick={() => nudgeLayer('forward')}
                >
                  <LayerForwardIcon size={15} />
                </button>
                <button
                  type="button"
                  data-tip="Send backward"
                  aria-label="Send backward"
                  onClick={() => nudgeLayer('backward')}
                >
                  <LayerBackwardIcon size={15} />
                </button>
                <button
                  type="button"
                  data-tip="Send to back"
                  aria-label="Send to back"
                  onClick={() => nudgeLayer('back')}
                >
                  <LayerBackIcon size={15} />
                </button>
              </div>
            ) : null}
            {selectedNodes.length >= 2 ? (
              <button
                type="button"
                className="flow-field-btn is-block"
                onClick={connectSelected}
              >
                Connect selected
              </button>
            ) : null}
            {selectedCards.length || selectedSections.length ? (
              <ColorField
                label="Fill"
                value={
                  selectedCards[0]
                    ? (selectedCards[0].data as CardData).background
                    : (selectedSections[0].data as { color?: string }).color
                }
                onChange={updateSelectedFill}
              />
            ) : null}
            {selectedCards.length ? (
              <>
                <ColorField
                  label="Heading"
                  allowNone={false}
                  allowAuto
                  value={(selectedCards[0].data as CardData).headingColor}
                  preview={contrastInk((selectedCards[0].data as CardData).background)}
                  onChange={(color) => updateSelectedInk('headingColor', color)}
                />
                <ColorField
                  label="Text"
                  allowNone={false}
                  allowAuto
                  value={(selectedCards[0].data as CardData).textColor}
                  preview={contrastInk((selectedCards[0].data as CardData).background)}
                  onChange={(color) => updateSelectedInk('textColor', color)}
                />
              </>
            ) : null}
            {selectedTexts.length && !selectedCards.length ? (
              <ColorField
                label="Text"
                allowNone={false}
                value={(selectedTexts[0].data as TextBlockData).color}
                onChange={(color) => updateSelectedText({ color })}
              />
            ) : null}
            {selectedEdges.length ? (
              <div className="flow-inspect-block">
                <p className="flow-inspect-kicker">Connector</p>
                <ColorField
                  label="Color"
                  allowNone={false}
                  value={(selectedEdges[0].data as { color?: string })?.color}
                  onChange={(color) => updateSelectedEdge({ color })}
                />
                {coarsePointer ? null : (
                  <label className="flow-field">
                    <span>Label</span>
                    <input
                      className="flow-field-input"
                      value={
                        (selectedEdges[0].label as string) ||
                        (selectedEdges[0].data as { label?: string })?.label ||
                        ''
                      }
                      placeholder="Optional"
                      onChange={(e) => updateSelectedEdge({ label: e.target.value })}
                      aria-label="Connector label"
                    />
                  </label>
                )}
                <div className="flow-field is-stack">
                  <span>Start</span>
                  <div className="flow-seg flow-seg-caps">
                    {(['none', 'arrow', 'circle'] as const).map((cap) => (
                      <button
                        key={cap}
                        type="button"
                        data-on={
                          ((selectedEdges[0].data as { startCap?: string })
                            ?.startCap ?? 'none') === cap
                        }
                        title={cap === 'none' ? 'None' : cap === 'arrow' ? 'Arrow' : 'Dot'}
                        aria-label={
                          cap === 'none' ? 'No start cap' : `Start ${cap}`
                        }
                        onClick={() => updateSelectedEdge({ startCap: cap })}
                      >
                        <CapIcon cap={cap} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flow-field is-stack">
                  <span>End</span>
                  <div className="flow-seg flow-seg-caps">
                    {(['none', 'arrow', 'circle'] as const).map((cap) => (
                      <button
                        key={cap}
                        type="button"
                        data-on={
                          ((selectedEdges[0].data as { endCap?: string })?.endCap ??
                            'arrow') === cap
                        }
                        title={cap === 'none' ? 'None' : cap === 'arrow' ? 'Arrow' : 'Dot'}
                        aria-label={cap === 'none' ? 'No end cap' : `End ${cap}`}
                        onClick={() => updateSelectedEdge({ endCap: cap })}
                      >
                        <CapIcon cap={cap} />
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flow-field">
                  <span>Arrow</span>
                  <input
                    className="flow-opacity-range"
                    type="range"
                    min={10}
                    max={40}
                    value={
                      (selectedEdges[0].data as { arrowSize?: number })
                        ?.arrowSize ?? EDGE_ARROW_SIZE
                    }
                    onChange={(e) =>
                      updateSelectedEdge({
                        arrowSize: Number(e.target.value),
                      })
                    }
                    aria-label="Arrow size"
                  />
                </label>
                <label className="flow-field">
                  <span>Dot</span>
                  <input
                    className="flow-opacity-range"
                    type="range"
                    min={6}
                    max={28}
                    value={
                      (selectedEdges[0].data as { dotSize?: number })
                        ?.dotSize ?? EDGE_DOT_SIZE
                    }
                    onChange={(e) =>
                      updateSelectedEdge({
                        dotSize: Number(e.target.value),
                      })
                    }
                    aria-label="Dot size"
                  />
                </label>
                <div className="flow-field is-stack">
                  <span>Path</span>
                  <div className="flow-seg flow-seg-caps">
                    <button
                      type="button"
                      data-on={
                        ((selectedEdges[0].data as { kind?: EdgeKind })?.kind ??
                          'curved') !== 'angular'
                      }
                      title="Curve"
                      aria-label="Curved path"
                      onClick={() => updateSelectedEdge({ kind: 'curved' })}
                    >
                      Curve
                    </button>
                    <button
                      type="button"
                      data-on={
                        ((selectedEdges[0].data as { kind?: EdgeKind })?.kind ??
                          'curved') === 'angular'
                      }
                      title="Elbow"
                      aria-label="Elbow path"
                      onClick={() => updateSelectedEdge({ kind: 'angular' })}
                    >
                      Elbow
                    </button>
                  </div>
                </div>
                <div className="flow-field is-stack">
                  <span>Line</span>
                  <div className="flow-seg flow-seg-caps">
                    <button
                      type="button"
                      data-on={
                        !(selectedEdges[0].data as { dashed?: boolean })?.dashed
                      }
                      title="Solid"
                      aria-label="Solid line"
                      onClick={() => updateSelectedEdge({ dashed: false })}
                    >
                      <LineIcon dashed={false} />
                    </button>
                    <button
                      type="button"
                      data-on={Boolean(
                        (selectedEdges[0].data as { dashed?: boolean })?.dashed
                      )}
                      title="Dashed"
                      aria-label="Dashed line"
                      onClick={() => updateSelectedEdge({ dashed: true })}
                    >
                      <LineIcon dashed />
                    </button>
                  </div>
                </div>
                <div className="flow-field-row">
                  <button
                    type="button"
                    className="flow-field-btn"
                    onClick={() => {
                      const d = selectedEdges[0].data as {
                        startCap?: EdgeCap;
                        endCap?: EdgeCap;
                      };
                      updateSelectedEdge({
                        startCap: d.endCap ?? 'arrow',
                        endCap: d.startCap ?? 'none',
                      });
                    }}
                  >
                    Flip ends
                  </button>
                  <button
                    type="button"
                    className="flow-field-btn"
                    data-on={Boolean(
                      (selectedEdges[0].data as { midCap?: boolean })?.midCap
                    )}
                    onClick={() =>
                      updateSelectedEdge({
                        midCap: !(selectedEdges[0].data as { midCap?: boolean })
                          ?.midCap,
                      })
                    }
                  >
                    Mid arrow
                  </button>
                </div>
              </div>
            ) : null}
            {selectedCards.length === 1 &&
            cardImages(selectedCards[0].data as CardData).length ? (
              <div className="flow-inspect-thumbs">
                {cardImages(selectedCards[0].data as CardData).map((src, i) => (
                  <div key={`${src.slice(0, 20)}-${i}`} className="flow-inspect-thumb">
                    <img src={src} alt="" />
                    <button
                      type="button"
                      aria-label="Remove image"
                      onClick={() => {
                        const next = cardImages(
                          selectedCards[0].data as CardData
                        ).filter((_, j) => j !== i);
                        updateSelectedCard({ images: next, image: undefined });
                      }}
                    >
                      <TrashIcon size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
            {selectedImages.length ? (
              <div className="flow-field-stack">
                <div className="flow-field">
                  <span>Mask</span>
                  <button
                    type="button"
                    className="flow-field-btn"
                    data-on={selectedImages.some(
                      (n) => (n.data as ImageData).cropMode
                    )}
                    onClick={() => {
                      setNodes((nds) =>
                        nds.map((n) =>
                          n.type === 'image' && n.selected
                            ? {
                                ...n,
                                data: {
                                  ...n.data,
                                  cropMode: !(n.data as ImageData).cropMode,
                                },
                              }
                            : n
                        )
                      );
                    }}
                  >
                    {selectedImages.some((n) => (n.data as ImageData).cropMode)
                      ? 'Done'
                      : 'Crop'}
                  </button>
                </div>
                <div className="flow-field">
                  <span>Frame</span>
                  <button
                    type="button"
                    className="flow-field-btn"
                    onClick={() => {
                      setNodes((nds) =>
                        nds.map((n) =>
                          n.type === 'image' && n.selected
                            ? {
                                ...n,
                                data: {
                                  ...n.data,
                                  crop: { ...FULL_CROP },
                                  cropMode: false,
                                },
                              }
                            : n
                        )
                      );
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            ) : null}
            {selectedCards.length || selectedTexts.length ? (
              <label className="flow-field">
                <span>Size</span>
                <input
                  className="flow-opacity-range"
                  type="range"
                  min={0}
                  max={FONT_STEPS.length - 1}
                  step={1}
                  value={FONT_STEPS.indexOf(
                    snapFontSize(
                      (selectedCards[0]?.data as CardData | undefined)
                        ?.fontSize ??
                        (selectedTexts[0]?.data as TextBlockData | undefined)
                          ?.fontSize ??
                        16
                    )
                  )}
                  onChange={(e) => {
                    const n = FONT_STEPS[Number(e.target.value)] ?? 16;
                    updateSelectedCard({ fontSize: n });
                    updateSelectedText({ fontSize: n });
                  }}
                  aria-label="Text size"
                />
                <span className="flow-field-num">
                  {snapFontSize(
                    (selectedCards[0]?.data as CardData | undefined)
                      ?.fontSize ??
                      (selectedTexts[0]?.data as TextBlockData | undefined)
                        ?.fontSize ??
                      16
                  )}
                </span>
              </label>
            ) : null}
              </>
            )}
          </aside>
        ) : null}
        {coarsePointer && locked ? (
          <p className="flow-mode-hint">Canvas locked · Pinch to zoom · Unlock to edit</p>
        ) : coarsePointer && tool === 'select' ? (
          <p className="flow-mode-hint">Drag empty to select · Tap a connector to style it</p>
        ) : coarsePointer && tool === 'section' ? (
          <p className="flow-mode-hint">Drag a rectangle to draw a section</p>
        ) : null}
        <FlowToast />
        </div>
        <div className="flow-dock">
        <aside className="flow-tools" aria-label="Tools">
          {(
            [
              ['select', 'Select'],
              ['pan', 'Pan'],
              ['connect', 'Connect'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className="flow-tool"
              data-on={tool === id}
              data-tip={`${label}${id === 'select' ? ' (V)' : id === 'pan' ? ' (H)' : ' (L)'}`}
              aria-label={label}
              aria-pressed={tool === id}
              disabled={locked && id !== 'pan'}
              onClick={() => chooseTool(id)}
            >
              <ToolIcon id={id} />
            </button>
          ))}
          <button
            type="button"
            className="flow-tool is-lock"
            data-on={locked}
            data-tip={locked ? 'Unlock canvas' : 'Lock canvas'}
            aria-label={locked ? 'Unlock canvas' : 'Lock canvas'}
            aria-pressed={locked}
            onClick={() => {
              if (locked) {
                setLocked(false);
                setTool('select');
                return;
              }
              setLocked(true);
              setTool('pan');
              setConnectFrom(null);
              setInspectOpen(false);
              setNodes((nds) =>
                nds.map((n) => (n.selected ? { ...n, selected: false } : n))
              );
              setEdges((eds) =>
                eds.map((e) => (e.selected ? { ...e, selected: false } : e))
              );
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              {locked ? (
                <path
                  d="M6.2 8.2V6.4A2.8 2.8 0 0 1 9 3.6a2.8 2.8 0 0 1 2.8 2.8v1.8M5 8.2h8v6.4H5V8.2Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              ) : (
                <path
                  d="M6.2 8.2V6.1A2.8 2.8 0 0 1 9 3.3c1.1 0 2 .6 2.5 1.4M5 8.2h8v6.4H5V8.2Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          </button>
          <span className="flow-tool-rule" aria-hidden />
          {(
            [
              ['card', 'Card'],
              ['text', 'Text'],
              ['image', 'Image'],
              ['section', 'Section'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className="flow-tool"
              data-on={tool === id}
              data-tip={label}
              aria-label={label}
              disabled={locked}
              onClick={() => chooseTool(id)}
            >
              <ToolIcon id={id} />
            </button>
          ))}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            multiple
            onChange={async (e) => {
              const files = [...(e.target.files ?? [])];
              e.target.value = '';
              const rect = wrapperRef.current?.getBoundingClientRect();
              const point = rect
                ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 3 }
                : { x: 400, y: 200 };
              const pos = screenToFlowPosition(point);
              for (let i = 0; i < files.length; i++) {
                await addImageAt(files[i], { x: pos.x + i * 24, y: pos.y + i * 24 });
              }
            }}
          />
        </aside>
        {coarsePointer ? (
          <div className="flow-canvas-preview" aria-label="Canvas view">
            <MiniMap pannable zoomable className="flow-minimap" />
          </div>
        ) : null}
        </div>
      </div>
    </div>
  );
}

export function FlowCanvasPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const ready = useFlowSync();
  const [workflow, setWorkflow] = useState<Workflow | undefined>();

  useEffect(() => {
    if (!ready) return;
    if (!id) {
      navigate('/flow', { replace: true });
      return;
    }
    const next = getWorkflow(id);
    setWorkflow(next);
    if (!next) navigate('/flow', { replace: true });
  }, [ready, id, navigate]);

  useFlowStorageTick(() => {
    if (!id) return;
    const next = getWorkflow(id);
    if (next) setWorkflow(next);
  });

  if (!ready) return <RouteFallback />;
  if (!workflow) return <RouteFallback />;

  return (
    <ReactFlowProvider>
      <FlowEditor key={workflow.id} workflow={workflow} />
    </ReactFlowProvider>
  );
}
