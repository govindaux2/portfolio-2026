export type CardData = {
  heading: string;
  text: string;
  image?: string;
  images?: string[];
  background?: string;
  headingColor?: string;
  textColor?: string;
  fontSize?: number;
  fontWeight?: number;
};

export type TextBlockData = {
  text: string;
  color?: string;
  fontSize?: number;
  fontWeight?: number;
};

export type SectionData = {
  title: string;
  color?: string;
};

export type ImageCrop = { x: number; y: number; w: number; h: number };

export type ImageData = {
  src: string;
  crop?: ImageCrop;
  cropMode?: boolean;
};

export type LinkData = {
  url: string;
  title: string;
  description?: string;
  image?: string;
  site: string;
  kind: 'web' | 'video' | 'doc' | 'sheet';
  status: 'loading' | 'ready' | 'error';
};

export type NodeKind = 'card' | 'text' | 'section' | 'image' | 'link';

export type StoredNode = {
  id: string;
  type: NodeKind;
  position: { x: number; y: number };
  width?: number;
  height?: number;
  zIndex?: number;
  locked?: boolean;
  data: CardData | TextBlockData | SectionData | ImageData | LinkData;
};

export type EdgeKind = 'curved' | 'angular';

export type EdgeCap = 'none' | 'arrow' | 'circle';

export const EDGE_ARROW_SIZE = 18;
export const EDGE_DOT_SIZE = 10;

export type StoredEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
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

export type BoardPage = {
  id: string;
  name: string;
  nodes: StoredNode[];
  edges: StoredEdge[];
};

export type WorkflowVersion = {
  id: string;
  name: string;
  createdAt: number;
  pages: BoardPage[];
};

export type Workflow = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  pages: BoardPage[];
  versions: WorkflowVersion[];
  canvasBg?: string;
};

export type WorkflowSummary = Pick<
  Workflow,
  'id' | 'name' | 'createdAt' | 'updatedAt'
> & {
  nodeCount: number;
  pageCount: number;
};
