import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useCoarsePointer } from './useCoarsePointer';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: string;
  align?: 'left' | 'right';
  children: React.ReactNode;
};

export function Dropdown({
  open,
  onOpenChange,
  label,
  align = 'left',
  children,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const coarse = useCoarsePointer();
  const [pos, setPos] = useState({ top: 0, left: 0, width: 240, maxHeight: 280, bottom: 0, sheet: false });

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const place = () => {
      const r = triggerRef.current?.getBoundingClientRect();
      if (!r) return;
      const pad = 10;
      if (coarse) {
        const bottom = Math.max(12, window.innerHeight - (window.visualViewport?.height ?? window.innerHeight) + 72);
        setPos({
          top: 0,
          left: pad,
          width: window.innerWidth - pad * 2,
          maxHeight: Math.min(420, window.innerHeight * 0.55),
          bottom: Math.max(72, bottom),
          sheet: true,
        });
        return;
      }
      const width = Math.min(280, window.innerWidth - pad * 2);
      let left = align === 'right' ? r.right - width : r.left;
      left = Math.max(pad, Math.min(left, window.innerWidth - width - pad));
      const maxHeight = Math.min(360, window.innerHeight - pad * 2);
      let top = r.bottom + 6;
      if (top + 160 > window.innerHeight - pad) {
        top = Math.max(pad, r.top - 6 - Math.min(maxHeight, 240));
      }
      setPos({ top, left, width, maxHeight, bottom: 0, sheet: false });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    window.visualViewport?.addEventListener('resize', place);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
      window.visualViewport?.removeEventListener('resize', place);
    };
  }, [open, align, coarse]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: PointerEvent) => {
      const t = e.target as Node;
      if (ref.current?.contains(t) || panelRef.current?.contains(t)) return;
      onOpenChange(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('pointerdown', onDoc);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDoc);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onOpenChange]);

  return (
    <div className="flow-dd" ref={ref}>
      <button
        ref={triggerRef}
        type="button"
        className="flow-dd-trigger"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="dialog"
        onClick={() => onOpenChange(!open)}
      >
        <span>{label}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <path
            d="M3 4.5 6 8l3-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </button>
      {open
        ? createPortal(
            <div
              ref={panelRef}
              id={menuId}
              className={`flow-dd-panel is-${align}${pos.sheet ? ' is-sheet' : ''}`}
              role="dialog"
              style={
                pos.sheet
                  ? {
                      left: pos.left,
                      width: pos.width,
                      bottom: pos.bottom,
                      maxHeight: pos.maxHeight,
                    }
                  : {
                      top: pos.top,
                      left: pos.left,
                      width: pos.width,
                      maxHeight: pos.maxHeight,
                    }
              }
            >
              {children}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
