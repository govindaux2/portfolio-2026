import type { Workflow, WorkflowSummary } from './types';

const KEY = 'flow.workflows.v1';

export function newId(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function readAll(): Workflow[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Workflow[];
  } catch {
    return [];
  }
}

function writeAll(workflows: Workflow[]) {
  localStorage.setItem(KEY, JSON.stringify(workflows));
}

export function listWorkflows(): WorkflowSummary[] {
  return readAll()
    .map((w) => ({
      id: w.id,
      name: w.name,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
      nodeCount: w.nodes?.length ?? 0,
    }))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getWorkflow(id: string): Workflow | undefined {
  return readAll().find((w) => w.id === id);
}

export function createWorkflow(name = 'Untitled workflow'): Workflow {
  const now = Date.now();
  const workflow: Workflow = {
    id: newId('wf'),
    name,
    createdAt: now,
    updatedAt: now,
    nodes: [],
    edges: [],
  };
  writeAll([workflow, ...readAll()]);
  return workflow;
}

/** Insert or update a workflow, refreshing its updatedAt timestamp. */
export function saveWorkflow(
  workflow: Omit<Workflow, 'updatedAt'> & { updatedAt?: number }
): Workflow {
  const all = readAll();
  const idx = all.findIndex((w) => w.id === workflow.id);
  const next: Workflow = { ...workflow, updatedAt: Date.now() };
  if (idx === -1) {
    all.unshift(next);
  } else {
    all[idx] = next;
  }
  writeAll(all);
  return next;
}

export function renameWorkflow(id: string, name: string) {
  const all = readAll();
  const idx = all.findIndex((w) => w.id === id);
  if (idx === -1) return;
  all[idx] = { ...all[idx], name, updatedAt: Date.now() };
  writeAll(all);
}

export function deleteWorkflow(id: string) {
  writeAll(readAll().filter((w) => w.id !== id));
}
