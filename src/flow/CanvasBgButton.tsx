import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ColorMap } from './ColorMap';
import { useCoarsePointer } from './useCoarsePointer';

export function CanvasBgButton({
  value,
  fallback,
  onChange,
}: {
  value?: string;
  fallback: string;
  onChange: (color: string | undefined) => void;
}) {
  const coarse = useCoarsePointer();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const width = 220;
    setPos({
      top: r.bottom + 6,
      left: Math.min(r.right - width, window.innerWidth - width - 10),
    });
    const onDoc = (e: PointerEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', onDoc);
    return () => document.removeEventListener('pointerdown', onDoc);
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className="flow-theme-icon"
        data-tip="Canvas color"
        aria-label="Canvas background color"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="flow-bg-swatch" style={{ background: value || fallback }} />
      </button>
      {open
        ? createPortal(
            <div
              ref={panelRef}
              className="flow-dd-panel flow-bg-panel"
              style={{ top: pos.top, left: pos.left, width: 220 }}
              role="dialog"
              aria-label="Canvas background"
            >
              <ColorMap
                value={value || fallback}
                onChange={(color) => onChange(color)}
                hideHex={coarse}
              />
              <button
                type="button"
                className="flow-dd-add"
                onClick={() => {
                  onChange(undefined);
                  setOpen(false);
                }}
              >
                Reset to theme
              </button>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
