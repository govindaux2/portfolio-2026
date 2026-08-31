import { useRef } from 'react';
import { useNodeId, useReactFlow, useStoreApi } from '@xyflow/react';

export function CornerResize({
  minWidth,
  minHeight,
  lockRatio = false,
  onHug,
  minSizeFor,
}: {
  minWidth: number;
  minHeight: number;
  lockRatio?: boolean;
  onHug?: () => void;
  minSizeFor?: (width: number, height: number) => { w: number; h: number };
}) {
  const id = useNodeId();
  const store = useStoreApi();
  const { setNodes, getZoom } = useReactFlow();
  const drag = useRef<{
    w: number;
    h: number;
    x: number;
    y: number;
    ratio: number;
    moved: boolean;
  } | null>(null);

  return (
    <button
      type="button"
      className="flow-resize-corner nodrag nopan"
      aria-label="Resize"
      onDoubleClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onHug?.();
      }}
      onPointerDown={(e) => {
        if (!id) return;
        e.preventDefault();
        e.stopPropagation();
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        const node = store.getState().nodeLookup.get(id);
        if (!node) return;
        const w = node.measured.width ?? node.width ?? minWidth;
        const h = node.measured.height ?? node.height ?? minHeight;
        drag.current = {
          w,
          h,
          x: e.clientX,
          y: e.clientY,
          ratio: w / Math.max(h, 1),
          moved: false,
        };
      }}
      onPointerMove={(e) => {
        if (!id || !drag.current) return;
        const zoom = getZoom() || 1;
        const dx = (e.clientX - drag.current.x) / zoom;
        const dy = (e.clientY - drag.current.y) / zoom;
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) drag.current.moved = true;
        const keep = lockRatio && !e.shiftKey;
        let w: number;
        let h: number;
        if (keep) {
          const s = (drag.current.w + dx) / drag.current.w;
          w = Math.max(minWidth, drag.current.w * s);
          h = w / drag.current.ratio;
          if (h < minHeight) {
            h = minHeight;
            w = h * drag.current.ratio;
          }
        } else {
          w = Math.max(minWidth, drag.current.w + dx);
          h = Math.max(minHeight, drag.current.h + dy);
        }
        if (minSizeFor) {
          const floor = minSizeFor(w, h);
          w = Math.max(w, floor.w);
          h = Math.max(h, floor.h);
        }
        setNodes((nds) =>
          nds.map((n) =>
            n.id === id
              ? {
                  ...n,
                  width: w,
                  height: h,
                  style: { ...n.style, width: w, height: h },
                }
              : n
          )
        );
      }}
      onPointerUp={() => {
        drag.current = null;
      }}
      onPointerCancel={() => {
        drag.current = null;
      }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
        <path
          d="M11 5.5V11H5.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
