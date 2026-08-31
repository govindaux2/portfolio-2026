import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ColorMap } from './ColorMap';
import { NONE, isNone, parseColor, toColor } from './color';
import { useCoarsePointer } from './useCoarsePointer';

type Props = {
  label: string;
  value?: string;
  preview?: string;
  onChange: (color: string | undefined) => void;
  allowNone?: boolean;
  allowAuto?: boolean;
};

export function ColorField({
  label,
  value,
  preview,
  onChange,
  allowNone = true,
  allowAuto = false,
}: Props) {
  const parsed = parseColor(value || preview);
  const none = isNone(value) && !preview;
  const auto = isNone(value) && Boolean(preview);
  const pct = none ? 0 : auto ? 100 : Math.round(parsed.a * 100);
  const coarse = useCoarsePointer();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({
    top: 0,
    left: 0,
    width: 228,
    bottom: 0,
    sheet: false,
  });

  useEffect(() => {
    if (!open) return;
    const place = () => {
      if (coarse) {
        const pad = 10;
        const vv = window.visualViewport;
        const bottom = Math.max(
          12,
          window.innerHeight - (vv?.height ?? window.innerHeight) + 12
        );
        setPos({
          top: 0,
          left: pad,
          width: window.innerWidth - pad * 2,
          bottom,
          sheet: true,
        });
        return;
      }
      const r = btnRef.current?.getBoundingClientRect();
      if (!r) return;
      const width = 228;
      const left = Math.max(10, Math.min(r.left, window.innerWidth - width - 10));
      let top = r.bottom + 8;
      if (top + 280 > window.innerHeight) {
        top = Math.max(10, r.top - 288);
      }
      setPos({ top, left, width, bottom: 0, sheet: false });
    };
    place();
    const onDoc = (e: PointerEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', onDoc);
    window.addEventListener('resize', place);
    window.visualViewport?.addEventListener('resize', place);
    return () => {
      document.removeEventListener('pointerdown', onDoc);
      window.removeEventListener('resize', place);
      window.visualViewport?.removeEventListener('resize', place);
    };
  }, [open, coarse]);

  return (
    <div className="flow-color-field">
      <div className="flow-field">
        <span>{label}</span>
        <div className="flow-color-row">
          <button
            ref={btnRef}
            type="button"
            className={`flow-color-chip${none ? ' is-none' : ''}${auto ? ' is-auto' : ''}${open ? ' is-open' : ''}`}
            style={
              none
                ? undefined
                : {
                    background:
                      value?.startsWith('var(') || value?.startsWith('rgb')
                        ? value
                        : toColor(parsed.hex, auto ? 1 : parsed.a || 1),
                  }
            }
            aria-label={`${label} color`}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          />
          <input
            className="flow-opacity-range"
            type="range"
            min={0}
            max={100}
            value={pct}
            onChange={(e) => {
              const a = Number(e.target.value) / 100;
              onChange(a <= 0 ? NONE : toColor(parsed.hex, a));
            }}
            aria-label={`${label} opacity`}
          />
          <span className="flow-opacity-pct">{pct}%</span>
        </div>
      </div>
      {open
        ? createPortal(
            <div
              ref={panelRef}
              className={`flow-dd-panel flow-color-panel${pos.sheet ? ' is-sheet' : ''}`}
              style={
                pos.sheet
                  ? {
                      left: pos.left,
                      width: pos.width,
                      bottom: pos.bottom,
                      maxHeight: '70dvh',
                    }
                  : { top: pos.top, left: pos.left, width: pos.width }
              }
              role="dialog"
              aria-label={`${label} color`}
            >
              <ColorMap
                value={none ? undefined : value || preview}
                onChange={(color) => onChange(color)}
                hideHex
              />
              {allowNone ? (
                <button
                  type="button"
                  className="flow-dd-add"
                  onClick={() => {
                    onChange(NONE);
                    setOpen(false);
                  }}
                >
                  No fill
                </button>
              ) : null}
              {allowAuto ? (
                <button
                  type="button"
                  className="flow-dd-add"
                  onClick={() => {
                    onChange(undefined);
                    setOpen(false);
                  }}
                >
                  Auto contrast
                </button>
              ) : null}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
