export type CardData = {
  heading: string;
  text: string;
  /** Data URL or remote URL for an optional image. */
  image?: string;
};

export type StoredNode = {
  id: string;
  position: { x: number; y: number };
  data: CardData;
};

export type StoredEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
};

export type Workflow = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  nodes: StoredNode[];
  edges: StoredEdge[];
};

export type WorkflowSummary = Pick<
  Workflow,
  'id' | 'name' | 'createdAt' | 'updatedAt'
> & {
  nodeCount: number;
};
