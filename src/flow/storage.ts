import { howCursorBuildsWorkflow, HOW_CURSOR_BUILDS_ID } from './exampleHowCursorBuilds';
import { newId } from './id';
import { clonePages, emptyPage, normalizeWorkflow } from './model';
import type { Workflow, WorkflowSummary, WorkflowVersion } from './types';

export { newId };

const KEY = 'flow.workflows.v1';
const FLOW_SYNC = 'flow-storage';

let cache: Workflow[] | null = null;
let fileSync = false;
let fileUpdated = '';
let lastLocalWrite = 0;
let initOnce: Promise<void> | null = null;
let pushTimer = 0;

export function isFileSync() {
  return fileSync;
}

export function initFlowStorage() {
  if (!initOnce) initOnce = boot();
  return initOnce;
}

async function boot() {
  try {
    const res = await fetch('/__flow');
    if (res.ok) {
      const data = (await res.json()) as {
        updated?: string | null;
        workflows?: unknown[];
      };
      fileSync = true;
      fileUpdated = data.updated ?? '';
      const remote = parseList(data.workflows);
      const local = readLocalRaw();
      cache = withExample(mergeWorkflows(remote, local));
      pushNow(cache);
      return;
    }
  } catch {
    /* dev server without the sync plugin */
  }
  cache = withExample(readLocalRaw());
}

export async function fetchPhoneOrigin() {
  try {
    const res = await fetch('/__flow/meta');
    if (!res.ok) return null;
    const meta = (await res.json()) as { port?: number; ips?: string[] };
    const ip = meta.ips?.[0];
    if (!ip) return null;
    return `http://${ip}:${meta.port || 5173}`;
  } catch {
    return null;
  }
}

export async function pullFlowStorage() {
  if (!fileSync) return false;
  if (Date.now() - lastLocalWrite < 2500) return false;
  try {
    const res = await fetch('/__flow');
    if (!res.ok) return false;
    const data = (await res.json()) as {
      updated?: string | null;
      workflows?: unknown[];
    };
    if ((data.updated ?? '') === fileUpdated) return false;
    fileUpdated = data.updated ?? '';
    cache = withExample(parseList(data.workflows), false);
    window.dispatchEvent(new Event(FLOW_SYNC));
    return true;
  } catch {
    return false;
  }
}

export function onFlowStorage(fn: () => void) {
  window.addEventListener(FLOW_SYNC, fn);
  return () => window.removeEventListener(FLOW_SYNC, fn);
}

function mergeWorkflows(remote: Workflow[], local: Workflow[]): Workflow[] {
  const byId = new Map<string, Workflow>();
  for (const w of local) byId.set(w.id, w);
  for (const w of remote) {
    const cur = byId.get(w.id);
    if (!cur || w.updatedAt >= cur.updatedAt) byId.set(w.id, w);
  }
  return [...byId.values()];
}

function parseList(raw: unknown): Workflow[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => normalizeWorkflow(item))
    .filter((w): w is Workflow => Boolean(w));
}

function readLocalRaw(): Workflow[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return parseList(JSON.parse(raw));
  } catch {
    return [];
  }
}

function readAll(): Workflow[] {
  if (cache) return cache;
  cache = withExample(readLocalRaw());
  return cache;
}

function exampleNeedsRefresh(workflow: Workflow) {
  const ideas = workflow.pages
    .flatMap((p) => p.nodes)
    .find((n) => n.id === 'c-ideas');
  return ideas?.height !== 400 || ideas?.position.y !== 128;
}

function withExample(list: Workflow[], persist = true): Workflow[] {
  const seed = howCursorBuildsWorkflow();
  const idx = list.findIndex((w) => w.id === HOW_CURSOR_BUILDS_ID);
  if (idx === -1) {
    const next = [seed, ...list];
    if (persist) writeAll(next);
    return next;
  }
  if (exampleNeedsRefresh(list[idx])) {
    const next = [...list];
    next[idx] = seed;
    if (persist) writeAll(next);
    return next;
  }
  return list;
}

function writeAll(workflows: Workflow[]) {
  cache = workflows;
  try {
    localStorage.setItem(KEY, JSON.stringify(workflows));
  } catch {
    /* quota */
  }
  if (!fileSync || typeof window === 'undefined') return;
  lastLocalWrite = Date.now();
  window.clearTimeout(pushTimer);
  pushTimer = window.setTimeout(() => pushNow(workflows), 280);
}

function pushNow(workflows: Workflow[]) {
  lastLocalWrite = Date.now();
  void fetch('/__flow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workflows }),
  })
    .then((res) => (res.ok ? res.json() : null))
    .then((data: { updated?: string } | null) => {
      if (data?.updated) fileUpdated = data.updated;
    })
    .catch(() => {
      /* offline / plugin missing */
    });
}

export function listWorkflows(): WorkflowSummary[] {
  return readAll()
    .map((w) => ({
      id: w.id,
      name: w.name,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
      nodeCount: w.pages.reduce((n, p) => n + (p.nodes?.length ?? 0), 0),
      pageCount: w.pages.length,
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
    pages: [emptyPage('Board 1')],
    versions: [],
  };
  writeAll([workflow, ...readAll()]);
  return workflow;
}

export function saveWorkflow(
  workflow: Omit<Workflow, 'updatedAt'> & { updatedAt?: number }
): Workflow {
  const all = readAll();
  const idx = all.findIndex((w) => w.id === workflow.id);
  const next: Workflow = {
    pages: workflow.pages?.length ? workflow.pages : [emptyPage('Board 1')],
    versions: workflow.versions ?? [],
    id: workflow.id,
    name: workflow.name,
    createdAt: workflow.createdAt,
    canvasBg: workflow.canvasBg,
    updatedAt: Date.now(),
  };
  if (idx === -1) all.unshift(next);
  else all[idx] = next;
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

export function saveVersion(id: string, name: string, pages = getWorkflow(id)?.pages) {
  const all = readAll();
  const idx = all.findIndex((w) => w.id === id);
  if (idx === -1 || !pages) return;
  const version: WorkflowVersion = {
    id: newId('ver'),
    name,
    createdAt: Date.now(),
    pages: clonePages(pages),
  };
  all[idx] = {
    ...all[idx],
    versions: [version, ...all[idx].versions],
    updatedAt: Date.now(),
  };
  writeAll(all);
  return all[idx];
}

export function renameVersion(id: string, versionId: string, name: string) {
  const all = readAll();
  const idx = all.findIndex((w) => w.id === id);
  if (idx === -1) return;
  all[idx] = {
    ...all[idx],
    versions: all[idx].versions.map((v) =>
      v.id === versionId ? { ...v, name } : v
    ),
    updatedAt: Date.now(),
  };
  writeAll(all);
  return all[idx];
}

export function deleteVersion(id: string, versionId: string) {
  const all = readAll();
  const idx = all.findIndex((w) => w.id === id);
  if (idx === -1) return;
  all[idx] = {
    ...all[idx],
    versions: all[idx].versions.filter((v) => v.id !== versionId),
    updatedAt: Date.now(),
  };
  writeAll(all);
  return all[idx];
}

export function restoreVersion(id: string, versionId: string): Workflow | undefined {
  const all = readAll();
  const idx = all.findIndex((w) => w.id === id);
  if (idx === -1) return;
  const version = all[idx].versions.find((v) => v.id === versionId);
  if (!version) return;
  all[idx] = {
    ...all[idx],
    pages: clonePages(version.pages),
    updatedAt: Date.now(),
  };
  writeAll(all);
  return all[idx];
}
