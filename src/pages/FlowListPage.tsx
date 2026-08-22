import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  createWorkflow,
  deleteWorkflow,
  listWorkflows,
  renameWorkflow,
} from '../flow/storage';
import type { WorkflowSummary } from '../flow/types';
import './flow.css';

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function FlowListPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<WorkflowSummary[]>(() => listWorkflows());

  const refresh = () => setItems(listWorkflows());

  const onCreate = () => {
    const wf = createWorkflow();
    navigate(`/flow/${wf.id}`);
  };

  const onRename = (id: string, current: string) => {
    const next = window.prompt('Rename workflow', current);
    if (next && next.trim()) {
      renameWorkflow(id, next.trim());
      refresh();
    }
  };

  const onDelete = (id: string, name: string) => {
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteWorkflow(id);
      refresh();
    }
  };

  return (
    <div className="flow-list-page">
      <header className="flow-list-head">
        <div>
          <Link to="/" className="flow-back">
            ← Back to site
          </Link>
          <h1>Workflows</h1>
          <p className="flow-list-sub">
            Free-flowing canvases. Drag cards, connect them, attach images.
            Everything saves to this browser automatically.
          </p>
        </div>
        <button type="button" className="flow-new-btn" onClick={onCreate}>
          + New workflow
        </button>
      </header>

      {items.length === 0 ? (
        <div className="flow-empty">
          <p>No workflows yet.</p>
          <button type="button" className="flow-new-btn" onClick={onCreate}>
            + Create your first workflow
          </button>
        </div>
      ) : (
        <ul className="flow-grid">
          {items.map((w) => (
            <li key={w.id} className="flow-tile">
              <Link to={`/flow/${w.id}`} className="flow-tile-open">
                <span className="flow-tile-canvas" aria-hidden>
                  <span className="flow-tile-dot" />
                  <span className="flow-tile-dot" />
                  <span className="flow-tile-line" />
                </span>
                <span className="flow-tile-name">{w.name}</span>
                <span className="flow-tile-meta">
                  {w.nodeCount} {w.nodeCount === 1 ? 'node' : 'nodes'} ·
                  updated {formatDate(w.updatedAt)}
                </span>
              </Link>
              <div className="flow-tile-actions">
                <button type="button" onClick={() => onRename(w.id, w.name)}>
                  Rename
                </button>
                <button type="button" onClick={() => onDelete(w.id, w.name)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
