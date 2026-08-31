import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useReactFlow } from '@xyflow/react';
import { newId } from './id';
import { MoreIcon } from './icons';

type Props = {
  id: string;
  onRename?: () => void;
};

export function NodeMenu({ id, onRename }: Props) {
  const { getNode, setNodes, deleteElements } = useReactFlow();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const node = getNode(id);
  const locked = Boolean(node && 'locked' in node && node.locked);

  useEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const width = 220;
    const left = Math.min(Math.max(8, r.right - width), window.innerWidth - width - 8);
    let top = r.bottom + 6;
    if (top + 280 > window.innerHeight) top = Math.max(8, r.top - 286);
    setPos({ top, left });
    const onDoc = (e: PointerEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onDoc);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDoc);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  const duplicate = () => {
    const source = getNode(id);
    if (!source) return;
    const copy = {
      ...source,
      id: newId('node'),
      selected: true,
      position: { x: source.position.x + 36, y: source.position.y + 36 },
    };
    setNodes((nds) =>
      nds.map((n) => ({ ...n, selected: false })).concat(copy)
    );
    close();
  };

  const toggleLock = () => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id
          ? { ...n, locked: !locked, draggable: locked }
          : n
      )
    );
    close();
  };

  const layer = (dir: 'front' | 'back') => {
    setNodes((nds) => {
      if (dir === 'front') {
        const max = Math.max(...nds.map((n) => n.zIndex ?? 0), 0);
        return nds.map((n) => (n.id === id ? { ...n, zIndex: max + 1 } : n));
      }
      const min = Math.min(...nds.map((n) => n.zIndex ?? 0), 0);
      return nds.map((n) => (n.id === id ? { ...n, zIndex: min - 1 } : n));
    });
    close();
  };

  const remove = () => {
    deleteElements({ nodes: [{ id }] });
    close();
  };

  const mac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className="flow-node-more nodrag nopan"
        aria-label="Node menu"
        aria-expanded={open}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <MoreIcon size={16} />
      </button>
      {open
        ? createPortal(
            <div
              ref={panelRef}
              className="flow-node-menu"
              role="menu"
              style={{ top: pos.top, left: pos.left }}
            >
              <button type="button" role="menuitem" onClick={duplicate}>
                Duplicate
                <span>{mac ? '⌘D' : 'Ctrl+D'}</span>
              </button>
              {onRename ? (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onRename();
                    close();
                  }}
                >
                  Rename
                </button>
              ) : null}
              <button type="button" role="menuitem" onClick={toggleLock}>
                {locked ? 'Unlock' : 'Lock'}
              </button>
              <hr />
              <button type="button" role="menuitem" onClick={() => layer('front')}>
                Bring to front
              </button>
              <button type="button" role="menuitem" onClick={() => layer('back')}>
                Send to back
              </button>
              <hr />
              <button type="button" role="menuitem" className="is-danger" onClick={remove}>
                Delete
              </button>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
