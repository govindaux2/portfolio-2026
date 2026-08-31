import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PhoneLink } from '../flow/PhoneLink';
import { FlowToast } from '../flow/FlowToast';
import {
  createWorkflow,
  deleteWorkflow,
  listWorkflows,
  renameWorkflow,
} from '../flow/storage';
import { ThemeToggle } from '../flow/ThemeToggle';
import { readTheme, type FlowTheme } from '../flow/theme';
import { useFlowStorageTick, useFlowSync } from '../flow/useFlowSync';
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
  const ready = useFlowSync();
  const [items, setItems] = useState<WorkflowSummary[]>([]);
  const [theme, setTheme] = useState<FlowTheme>(() => readTheme());

  const refresh = useCallback(() => setItems(listWorkflows()), []);

  useEffect(() => {
    if (ready) refresh();
  }, [ready, refresh]);

  useFlowStorageTick(refresh);

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
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    deleteWorkflow(id);
    refresh();
  };

  if (!ready) return <div className="route-fallback" aria-hidden />;

  return (
    <div className="flow-list-page" data-theme={theme}>
      <header className="flow-list-head">
        <div>
          <Link to="/" className="flow-back">
            ← Back to site
          </Link>
          <h1>Workflows</h1>
          <p className="flow-list-sub">
            Every board on this Mac. Copy the phone link, same Wi-Fi, no deploy.
          </p>
          <PhoneLink showUrl />
        </div>
        <div className="flow-list-actions">
          <ThemeToggle theme={theme} onChange={setTheme} />
          <button type="button" className="flow-new-btn" onClick={onCreate}>
            New
          </button>
        </div>
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
              <Link
                to={`/flow/${encodeURIComponent(w.id)}`}
                className="flow-tile-open"
              >
                <span className="flow-tile-canvas" aria-hidden>
                  <span className="flow-tile-dot" />
                  <span className="flow-tile-dot" />
                  <span className="flow-tile-line" />
                </span>
                <span className="flow-tile-name">{w.name}</span>
                <span className="flow-tile-meta">
                  {w.nodeCount} {w.nodeCount === 1 ? 'node' : 'nodes'}
                  {w.pageCount > 1 ? ` · ${w.pageCount} boards` : ''} ·
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
      <FlowToast />
    </div>
  );
}
