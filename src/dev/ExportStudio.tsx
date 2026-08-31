import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import './export-studio.css';

type Layout = { scale: number; x: number; y: number };
type Store = {
  updated: string | null;
  current: Record<string, Layout>;
  snapshots: { at: string; layout: Record<string, Layout> }[];
};

const KEY = 'govinda-export-studio';
const empty: Store = { updated: null, current: {}, snapshots: [] };

function readLocal(): Record<string, Layout> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') as Record<string, Layout>;
  } catch {
    return {};
  }
}

function writeLocal(next: Record<string, Layout>) {
  localStorage.setItem(KEY, JSON.stringify(next));
}

function studioOn() {
  return import.meta.env.DEV && new URLSearchParams(window.location.search).has('studio');
}

async function fetchStore(): Promise<Store> {
  try {
    const r = await fetch('/__studio');
    if (!r.ok) return empty;
    return (await r.json()) as Store;
  } catch {
    return empty;
  }
}

async function postStore(current: Record<string, Layout>, snapshot = false): Promise<Store> {
  const r = await fetch('/__studio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ current, snapshot }),
  });
  return (await r.json()) as Store;
}

export function StudioDock() {
  const [on, setOn] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setOn(studioOn());
  }, []);

  if (!on) return null;

  async function save(snapshot: boolean) {
    const store = await postStore(readLocal(), snapshot);
    setMsg(snapshot ? `snap ${store.snapshots.length}` : 'saved to repo');
    setTimeout(() => setMsg(''), 1600);
  }

  async function restoreLast() {
    const store = await fetchStore();
    const last = store.snapshots.at(-1);
    if (!last) {
      setMsg('no snapshot');
      setTimeout(() => setMsg(''), 1600);
      return;
    }
    writeLocal(last.layout);
    await postStore(last.layout, false);
    window.location.reload();
  }

  function resetAll() {
    writeLocal({});
    void postStore({}, false).then(() => window.location.reload());
  }

  return (
    <div className="xstu-dock">
      <span>studio</span>
      <button type="button" onClick={() => void save(false)}>
        save
      </button>
      <button type="button" onClick={() => void save(true)}>
        snap
      </button>
      <button type="button" onClick={() => void restoreLast()}>
        last
      </button>
      <button type="button" onClick={resetAll}>
        reset all
      </button>
      {msg ? <em>{msg}</em> : null}
    </div>
  );
}

export function ExportStudio({ id, children }: { id: string; children: ReactNode }) {
  const [on, setOn] = useState(false);
  const [layout, setLayout] = useState<Layout>({ scale: 1, x: 0, y: 0 });
  const layoutRef = useRef(layout);
  layoutRef.current = layout;
  const wrapRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    if (!studioOn()) return;
    setOn(true);
    void (async () => {
      const store = await fetchStore();
      const fromFile = store.current[id];
      const fromLocal = readLocal()[id];
      if (fromFile) setLayout(fromFile);
      else if (fromLocal) setLayout(fromLocal);
    })();
  }, [id]);

  const commit = useCallback(
    (next: Layout) => {
      setLayout(next);
      writeLocal({ ...readLocal(), [id]: next });
    },
    [id],
  );

  const setAlign = (v: boolean) => {
    wrapRef.current?.closest('.ndla-fig-row-inner')?.classList.toggle('xstu-align', v);
  };

  if (!on) return children;

  return (
    <div
      ref={wrapRef}
      className="xstu"
      style={{ transform: `translate(${layout.x}px, ${layout.y}px) scale(${layout.scale})` }}
    >
      <div
        className="xstu-bar"
        onPointerDown={(e) => {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          drag.current = { x: e.clientX, y: e.clientY, ox: layout.x, oy: layout.y };
          setAlign(true);
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          commit({
            scale: layoutRef.current.scale,
            x: d.ox + (e.clientX - d.x),
            y: d.oy + (e.clientY - d.y),
          });
        }}
        onPointerUp={() => {
          drag.current = null;
          setAlign(false);
        }}
      >
        <span className="xstu-grip" aria-hidden />
        <label>
          {Math.round(layout.scale * 100)}
          <input
            type="range"
            min={0.45}
            max={1.15}
            step={0.01}
            value={layout.scale}
            onPointerDown={(e) => e.stopPropagation()}
            onChange={(e) => commit({ ...layout, scale: Number(e.target.value) })}
          />
        </label>
        <span className="xstu-xy">
          {Math.round(layout.x)} / {Math.round(layout.y)}
        </span>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => commit({ scale: 1, x: 0, y: 0 })}
        >
          reset
        </button>
      </div>
      {children}
    </div>
  );
}
