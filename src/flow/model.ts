import type { Edge, Node } from '@xyflow/react';
import type {
  BoardPage,
  CardData,
  EdgeCap,
  EdgeKind,
  ImageData,
  LinkData,
  NodeKind,
  SectionData,
  StoredEdge,
  StoredNode,
  TextBlockData,
  Workflow,
  WorkflowVersion,
} from './types';
import { newId } from './id';

export const CARD_MIN = { w: 200, h: 88 };
export const CARD_MAX = { w: 360, h: 720 };
export const TEXT_MIN = { w: 80, h: 40 };
export const TEXT_MAX = { w: 480, h: 720 };
export const SECTION_MIN = { w: 240, h: 160 };
export const IMAGE_MIN = { w: 80, h: 80 };
export const LINK_MIN = { w: 200, h: 160 };

export const DEFAULTS = {
  card: { w: 240, h: 200 },
  text: { w: 220, h: 72 },
  section: { w: 360, h: 220 },
  image: { w: 320, h: 240 },
  link: { w: 260, h: 208 },
} as const;

export const FULL_CROP = { x: 0, y: 0, w: 1, h: 1 };

export const FONT_STEPS = [12, 14, 16, 18, 20, 24, 30, 36, 42] as const;

export function snapFontSize(n: number): (typeof FONT_STEPS)[number] {
  return FONT_STEPS.reduce((best, step) =>
    Math.abs(step - n) < Math.abs(best - n) ? step : best
  );
}

export function emptyPage(name = 'Board 1'): BoardPage {
  return { id: newId('page'), name, nodes: [], edges: [] };
}

export function clonePages(pages: BoardPage[]): BoardPage[] {
  return JSON.parse(JSON.stringify(pages)) as BoardPage[];
}

export function normalizeWorkflow(raw: unknown): Workflow | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const w = raw as Record<string, unknown>;
  if (typeof w.id !== 'string') return undefined;

  let pages: BoardPage[] = [];
  if (Array.isArray(w.pages) && w.pages.length) {
    pages = (w.pages as BoardPage[]).map((p) => ({
      id: p.id || newId('page'),
      name: p.name || 'Board',
      nodes: (p.nodes ?? []).map(normalizeStoredNode),
      edges: (p.edges ?? []).map(normalizeStoredEdge),
    }));
  } else {
    pages = [
      {
        id: newId('page'),
        name: 'Board 1',
        nodes: Array.isArray(w.nodes)
          ? (w.nodes as StoredNode[]).map(normalizeStoredNode)
          : [],
        edges: Array.isArray(w.edges)
          ? (w.edges as StoredEdge[]).map(normalizeStoredEdge)
          : [],
      },
    ];
  }

  const versions = Array.isArray(w.versions)
    ? (w.versions as WorkflowVersion[]).map((v) => ({
        id: v.id || newId('ver'),
        name: v.name || 'Version',
        createdAt: v.createdAt || Date.now(),
        pages: clonePages(v.pages?.length ? v.pages : pages),
      }))
    : [];

  return {
    id: w.id,
    name: typeof w.name === 'string' ? w.name : 'Untitled workflow',
    createdAt: typeof w.createdAt === 'number' ? w.createdAt : Date.now(),
    updatedAt: typeof w.updatedAt === 'number' ? w.updatedAt : Date.now(),
    canvasBg: typeof w.canvasBg === 'string' ? w.canvasBg : undefined,
    pages,
    versions,
  };
}

function normalizeStoredNode(n: StoredNode): StoredNode {
  const type: NodeKind =
    n.type === 'text' ||
    n.type === 'section' ||
    n.type === 'image' ||
    n.type === 'link'
      ? n.type
      : 'card';
  return {
    id: n.id,
    type,
    position: n.position ?? { x: 0, y: 0 },
    width: n.width,
    height: n.height,
    zIndex: n.zIndex,
    data: normalizeNodeData(type, n.data),
  };
}

function normalizeNodeData(
  type: NodeKind,
  data: StoredNode['data'] | undefined
): StoredNode['data'] {
  const next = data ?? defaultData(type);
  if (type !== 'card') return next;
  const card = next as CardData;
  const images =
    card.images?.length ? card.images : card.image ? [card.image] : [];
  return { ...card, images, image: undefined };
}

export function cardImages(data: CardData): string[] {
  if (data.images?.length) return data.images;
  return data.image ? [data.image] : [];
}

function normalizeStoredEdge(e: StoredEdge): StoredEdge {
  return {
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle,
    targetHandle: e.targetHandle,
    color: e.color,
    kind: e.kind === 'angular' ? 'angular' : 'curved',
    label: e.label,
    startCap: e.startCap,
    endCap: e.endCap,
    midCap: e.midCap,
    dashed: e.dashed,
    arrowSize: e.arrowSize,
    dotSize: e.dotSize,
  };
}

export function defaultData(
  type: NodeKind
): CardData | TextBlockData | SectionData | ImageData | LinkData {
  if (type === 'text') return { text: '' };
  if (type === 'section') return { title: 'Section' };
  if (type === 'image') return { src: '', crop: { ...FULL_CROP } };
  if (type === 'link')
    return {
      url: '',
      title: '',
      site: '',
      kind: 'web',
      status: 'error',
    };
  return { heading: '', text: '', background: 'var(--flow-surface)' };
}

export function facingHandles(from: Node, to: Node) {
  const sides = ['left', 'top', 'right', 'bottom'] as const;
  let best = {
    sourceHandle: 'right',
    targetHandle: 'left',
    dist: Infinity,
  };
  for (const sourceHandle of sides) {
    const a = sideMid(from, sourceHandle);
    for (const targetHandle of sides) {
      const b = sideMid(to, targetHandle);
      const dist = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
      if (dist < best.dist) best = { sourceHandle, targetHandle, dist };
    }
  }
  return { sourceHandle: best.sourceHandle, targetHandle: best.targetHandle };
}

function sideMid(n: Node, side: 'left' | 'top' | 'right' | 'bottom') {
  const w = n.measured?.width ?? n.width ?? DEFAULTS.card.w;
  const h = n.measured?.height ?? n.height ?? DEFAULTS.card.h;
  const x = n.position.x;
  const y = n.position.y;
  if (side === 'left') return { x, y: y + h / 2 };
  if (side === 'right') return { x: x + w, y: y + h / 2 };
  if (side === 'top') return { x: x + w / 2, y };
  return { x: x + w / 2, y: y + h };
}

export function imageNaturalSize(src: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () =>
      resolve({ w: img.naturalWidth || 320, h: img.naturalHeight || 240 });
    img.onerror = () => resolve({ w: 320, h: 240 });
    img.src = src;
  });
}

export function fitImageSize(w: number, h: number, max = 360) {
  const scale = Math.min(max / w, max / h, 1);
  return {
    w: Math.max(IMAGE_MIN.w, Math.round(w * scale)),
    h: Math.max(IMAGE_MIN.h, Math.round(h * scale)),
  };
}

export const CARD_THUMB = 180;
export const CARD_THUMB_MIN = 72;
export const CARD_THUMB_MAX = Math.round(CARD_THUMB * 4.5);

export function hugCardSize(width: number, imageCount: number) {
  const w = Math.max(CARD_MIN.w, width);
  const padX = 40;
  const padY = 44;
  const gap = 8;
  const inner = Math.max(CARD_THUMB_MIN, w - padX);
  const cols =
    imageCount <= 1
      ? 1
      : Math.max(
          1,
          Math.min(
            imageCount,
            Math.floor((inner + gap) / (CARD_THUMB_MIN + gap))
          )
        );
  const cell =
    imageCount <= 1
      ? Math.min(CARD_THUMB, inner)
      : Math.min(
          CARD_THUMB,
          Math.floor((inner - (cols - 1) * gap) / cols)
        );
  const rows = imageCount ? Math.ceil(imageCount / cols) : 0;
  const thumbs = rows ? rows * cell + (rows - 1) * gap : 0;
  const copy = 88;
  const h = Math.max(
    CARD_MIN.h,
    Math.round(padY + thumbs + copy + (imageCount ? gap : 0))
  );
  return { w, h };
}

export function hydrateNodes(nodes: StoredNode[]): Node[] {
  return nodes.map((n) => {
    const type = n.type ?? 'card';
    const size = DEFAULTS[type];
    const min =
      type === 'card'
        ? CARD_MIN
        : type === 'text'
          ? TEXT_MIN
          : type === 'section'
            ? SECTION_MIN
            : type === 'image'
              ? IMAGE_MIN
              : type === 'link'
                ? LINK_MIN
                : CARD_MIN;
    const crushed = (n.width ?? size.w) < min.w * 0.6;
    const width = crushed ? size.w : Math.max(min.w, n.width ?? size.w);
    const height = crushed ? size.h : Math.max(min.h, n.height ?? size.h);
    return {
      id: n.id,
      type,
      position: n.position,
      data: n.data,
      width,
      height,
      style: { width, height },
      zIndex: n.zIndex ?? (type === 'section' ? -10 : 1),
      locked: Boolean(n.locked),
      draggable: !n.locked,
      selectable: true,
    };
  });
}

export function hydrateEdges(edges: StoredEdge[], nodes: Node[] = []): Edge[] {
  const sides = new Set(['left', 'top', 'right', 'bottom']);
  const byId = new Map(nodes.map((n) => [n.id, n]));
  return edges.map((e) => {
    let sourceHandle =
      e.sourceHandle && sides.has(e.sourceHandle) ? e.sourceHandle : undefined;
    let targetHandle =
      e.targetHandle && sides.has(e.targetHandle) ? e.targetHandle : undefined;
    const from = byId.get(e.source);
    const to = byId.get(e.target);
    if (from && to && (!sourceHandle || !targetHandle)) {
      const face = facingHandles(from, to);
      sourceHandle = sourceHandle ?? face.sourceHandle;
      targetHandle = targetHandle ?? face.targetHandle;
    }
    return {
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle,
      targetHandle,
      type: e.kind === 'angular' ? 'smoothstep' : 'default',
      label: e.label,
      animated: true,
      style: {
        stroke: e.color || 'var(--accent)',
        strokeWidth: 1.75,
        strokeDasharray: e.dashed ? '7 6' : undefined,
      },
      data: {
        color: e.color,
        kind: e.kind ?? 'curved',
        label: e.label ?? '',
        labelOffset: e.labelOffset,
        startCap: e.startCap ?? 'none',
        endCap: e.endCap ?? 'arrow',
        midCap: Boolean(e.midCap),
        dashed: Boolean(e.dashed),
        arrowSize: e.arrowSize,
        dotSize: e.dotSize,
      },
    };
  });
}

export function storeNodes(nodes: Node[]): StoredNode[] {
  return nodes.map((n) => {
    const data = { ...(n.data as StoredNode['data']) };
    if (n.type === 'image' && data && 'cropMode' in data) {
      delete (data as { cropMode?: boolean }).cropMode;
    }
    return {
      id: n.id,
      type: (n.type as NodeKind) || 'card',
      position: n.position,
      width: n.width ?? (n.style?.width as number | undefined),
      height: n.height ?? (n.style?.height as number | undefined),
      zIndex: n.zIndex,
      locked: Boolean((n as { locked?: boolean }).locked),
      data,
    };
  });
}

export function storeEdges(edges: Edge[]): StoredEdge[] {
  return edges.map((e) => {
    const data = (e.data ?? {}) as {
      color?: string;
      kind?: EdgeKind;
      label?: string;
      labelOffset?: { x: number; y: number };
      startCap?: EdgeCap;
      endCap?: EdgeCap;
      midCap?: boolean;
      dashed?: boolean;
      arrowSize?: number;
      dotSize?: number;
    };
    const kind: EdgeKind =
      data.kind ?? (e.type === 'smoothstep' || e.type === 'step' ? 'angular' : 'curved');
    return {
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle,
      color: data.color,
      kind,
      label: data.label || (typeof e.label === 'string' ? e.label : undefined),
      labelOffset: data.labelOffset,
      startCap: data.startCap,
      endCap: data.endCap,
      midCap: data.midCap,
      dashed: data.dashed,
      arrowSize: data.arrowSize,
      dotSize: data.dotSize,
    };
  });
}

export function snapshot(nodes: Node[], edges: Edge[]): string {
  return JSON.stringify({ nodes: storeNodes(nodes), edges: storeEdges(edges) });
}

export type Guide = { axis: 'x' | 'y'; at: number };

const SNAP = 6;

function bounds(n: Node) {
  const w = n.measured?.width ?? n.width ?? DEFAULTS.card.w;
  const h = n.measured?.height ?? n.height ?? DEFAULTS.card.h;
  const l = n.position.x;
  const t = n.position.y;
  return {
    l,
    t,
    r: l + w,
    b: t + h,
    cx: l + w / 2,
    cy: t + h / 2,
    w,
    h,
  };
}

export function nodesInsideSection(section: Node, nodes: Node[]): Node[] {
  const s = bounds(section);
  return nodes.filter((n) => {
    if (n.id === section.id || n.type === 'section') return false;
    const b = bounds(n);
    return b.cx >= s.l && b.cx <= s.r && b.cy >= s.t && b.cy <= s.b;
  });
}

export function snapDrag(
  dragging: Node,
  others: Node[]
): { position: { x: number; y: number }; guides: Guide[] } {
  const d = bounds(dragging);
  let x = dragging.position.x;
  let y = dragging.position.y;
  const guides: Guide[] = [];

  let bestX = SNAP + 1;
  let bestY = SNAP + 1;

  for (const other of others) {
    const o = bounds(other);
    const xPairs: [number, number, number][] = [
      [d.l, o.l, o.l],
      [d.l, o.r, o.r],
      [d.l, o.cx, o.cx],
      [d.r, o.l, o.l - d.w],
      [d.r, o.r, o.r - d.w],
      [d.r, o.cx, o.cx - d.w],
      [d.cx, o.l, o.l - d.w / 2],
      [d.cx, o.r, o.r - d.w / 2],
      [d.cx, o.cx, o.cx - d.w / 2],
    ];
    for (const [from, to, nextX] of xPairs) {
      const dist = Math.abs(from - to);
      if (dist < bestX && dist <= SNAP) {
        bestX = dist;
        x = nextX;
        guides[0] = { axis: 'x', at: to };
      }
    }

    const yPairs: [number, number, number][] = [
      [d.t, o.t, o.t],
      [d.t, o.b, o.b],
      [d.t, o.cy, o.cy],
      [d.b, o.t, o.t - d.h],
      [d.b, o.b, o.b - d.h],
      [d.b, o.cy, o.cy - d.h],
      [d.cy, o.t, o.t - d.h / 2],
      [d.cy, o.b, o.b - d.h / 2],
      [d.cy, o.cy, o.cy - d.h / 2],
    ];
    for (const [from, to, nextY] of yPairs) {
      const dist = Math.abs(from - to);
      if (dist < bestY && dist <= SNAP) {
        bestY = dist;
        y = nextY;
        guides[1] = { axis: 'y', at: to };
      }
    }
  }

  return {
    position: { x, y },
    guides: guides.filter(Boolean) as Guide[],
  };
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    el.isContentEditable
  );
}

export function isMultiSelectEvent(e: {
  shiftKey: boolean;
  metaKey: boolean;
  ctrlKey: boolean;
}) {
  return e.shiftKey || e.metaKey || e.ctrlKey;
}
