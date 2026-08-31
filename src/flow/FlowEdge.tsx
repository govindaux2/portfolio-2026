import { useMemo, useRef, useState } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  getSmoothStepPath,
  Position,
  useReactFlow,
  type EdgeProps,
} from '@xyflow/react';
import { EDGE_ARROW_SIZE, EDGE_DOT_SIZE, type EdgeCap } from './types';

const STUB = 16;

function offset(x: number, y: number, pos: Position, d: number) {
  if (pos === Position.Left) return { x: x - d, y };
  if (pos === Position.Right) return { x: x + d, y };
  if (pos === Position.Top) return { x, y: y - d };
  return { x, y: y + d };
}

function stripMove(d: string) {
  return d.replace(/^M[\s\d.+eE,-]+/, '');
}

type EdgeData = {
  editing?: boolean;
  label?: string;
  labelOffset?: { x: number; y: number };
  startCap?: EdgeCap;
  endCap?: EdgeCap;
  midCap?: boolean;
  color?: string;
  dashed?: boolean;
  arrowSize?: number;
  dotSize?: number;
};

function quadThrough(
  x1: number,
  y1: number,
  mx: number,
  my: number,
  x2: number,
  y2: number
) {
  const cx = 2 * mx - (x1 + x2) / 2;
  const cy = 2 * my - (y1 + y2) / 2;
  return `M ${x1},${y1} Q ${cx},${cy} ${x2},${y2}`;
}

function markerEl(
  id: string,
  cap: EdgeCap,
  stroke: string,
  start: boolean,
  size: number
) {
  if (cap === 'none') return null;
  if (cap === 'circle') {
    return (
      <marker
        id={id}
        viewBox="0 0 12 12"
        refX="6"
        refY="6"
        markerWidth={size}
        markerHeight={size}
        markerUnits="userSpaceOnUse"
        orient="auto"
      >
        <circle cx="6" cy="6" r="4.2" fill={stroke} />
      </marker>
    );
  }
  return (
    <marker
      id={id}
      viewBox="0 0 12 12"
      refX={start ? 1 : 11}
      refY="6"
      markerWidth={size}
      markerHeight={size}
      markerUnits="userSpaceOnUse"
      orient={start ? 'auto-start-reverse' : 'auto'}
    >
      <path d="M1 2.2 11 6 1 9.8Z" fill={stroke} />
    </marker>
  );
}

function pathMid(d: string) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  el.setAttribute('d', d);
  const len = el.getTotalLength();
  if (!len) return null;
  const a = el.getPointAtLength(len * 0.5);
  const b = el.getPointAtLength(Math.min(len, len * 0.5 + 2));
  return {
    x: a.x,
    y: a.y,
    ang: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI,
  };
}

export function FlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  selected,
  label,
  data,
  type,
}: EdgeProps) {
  const { setEdges, getZoom } = useReactFlow();
  const inputRef = useRef<HTMLInputElement>(null);
  const drag = useRef<{
    x: number;
    y: number;
    ox: number;
    oy: number;
  } | null>(null);
  const [hot, setHot] = useState(false);
  const extra = (data ?? {}) as EdgeData;
  const editing = Boolean(extra.editing);
  const text = String(label ?? extra.label ?? '');
  const ox = extra.labelOffset?.x ?? 0;
  const oy = extra.labelOffset?.y ?? 0;
  const startCap = extra.startCap ?? 'none';
  const endCap = extra.endCap ?? 'arrow';
  const midCap = Boolean(extra.midCap);
  const dashed = Boolean(extra.dashed);
  const arrowSize = extra.arrowSize ?? EDGE_ARROW_SIZE;
  const dotSize = extra.dotSize ?? EDGE_DOT_SIZE;
  const stroke = String(style?.stroke || 'var(--accent)');
  const s = offset(sourceX, sourceY, sourcePosition, STUB);
  const t = offset(targetX, targetY, targetPosition, STUB);
  const [midPath, restX, restY] =
    type === 'smoothstep'
      ? getSmoothStepPath({
          sourceX: s.x,
          sourceY: s.y,
          targetX: t.x,
          targetY: t.y,
          sourcePosition,
          targetPosition,
        })
      : getBezierPath({
          sourceX: s.x,
          sourceY: s.y,
          targetX: t.x,
          targetY: t.y,
          sourcePosition,
          targetPosition,
        });
  const x = restX + ox;
  const y = restY + oy;
  const follow = ox !== 0 || oy !== 0;
  const body = follow
    ? type === 'smoothstep'
      ? `L ${x},${s.y} L ${x},${y} L ${t.x},${y} L ${t.x},${t.y}`
      : stripMove(quadThrough(s.x, s.y, x, y, t.x, t.y))
    : stripMove(midPath);
  const path = `M ${sourceX},${sourceY} L ${s.x},${s.y} ${body} L ${targetX},${targetY}`;

  const patch = (next: Partial<EdgeData> & { label?: string }) => {
    setEdges((eds) =>
      eds.map((e) =>
        e.id === id
          ? {
              ...e,
              label: next.label ?? e.label,
              selected: true,
              data: { ...e.data, ...next },
            }
          : e
      )
    );
  };

  const width = selected || hot ? 2.6 : Number(style?.strokeWidth ?? 1.75);
  const startId = `${id}-cap-s`;
  const endId = `${id}-cap-e`;
  const mid = useMemo(
    () => (midCap ? pathMid(path) : null),
    [midCap, path]
  );
  const half = arrowSize * 0.62;
  const rise = arrowSize * 0.38;

  return (
    <>
      <g
        className={`flow-edge-hit${hot || selected ? ' is-hot' : ''}`}
        onMouseEnter={() => setHot(true)}
        onMouseLeave={() => setHot(false)}
        onDoubleClick={(e) => {
          e.stopPropagation();
          patch({ editing: true, label: text });
          requestAnimationFrame(() => inputRef.current?.focus());
        }}
      >
        <defs>
          {markerEl(
            startId,
            startCap,
            stroke,
            true,
            startCap === 'circle' ? dotSize : arrowSize
          )}
          {markerEl(
            endId,
            endCap,
            stroke,
            false,
            endCap === 'circle' ? dotSize : arrowSize
          )}
        </defs>
        <BaseEdge
          id={id}
          path={path}
          markerStart={startCap === 'none' ? undefined : `url(#${startId})`}
          markerEnd={endCap === 'none' ? undefined : `url(#${endId})`}
          interactionWidth={40}
          style={{
            ...style,
            strokeWidth: width,
            strokeDasharray: dashed ? '7 6' : style?.strokeDasharray,
          }}
        />
        {mid && midCap ? (
          <path
            d={`M ${-half} ${-rise} L ${half} 0 L ${-half} ${rise} Z`}
            fill={stroke}
            transform={`translate(${mid.x} ${mid.y}) rotate(${mid.ang})`}
          />
        ) : null}
      </g>
      <EdgeLabelRenderer>
        {editing || text ? (
          <div
            className={`flow-edge-tag nodrag nopan${text || editing ? ' is-visible' : ''}${
              selected ? ' is-selected' : ''
            }`}
            style={{
              transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
              pointerEvents: 'all',
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              patch({ editing: true, label: text });
              requestAnimationFrame(() => inputRef.current?.focus());
            }}
            onPointerDown={(e) => {
              if (editing || !text) return;
              e.stopPropagation();
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              drag.current = { x: e.clientX, y: e.clientY, ox, oy };
            }}
            onPointerMove={(e) => {
              if (!drag.current) return;
              const z = getZoom() || 1;
              const labelOffset = {
                x: drag.current.ox + (e.clientX - drag.current.x) / z,
                y: drag.current.oy + (e.clientY - drag.current.y) / z,
              };
              setEdges((eds) =>
                eds.map((ed) =>
                  ed.id === id
                    ? { ...ed, data: { ...ed.data, labelOffset } }
                    : ed
                )
              );
            }}
            onPointerUp={() => {
              drag.current = null;
            }}
          >
            {editing ? (
              <input
                ref={inputRef}
                className="flow-edge-input"
                defaultValue={text}
                placeholder="Label"
                autoFocus
                onPointerDown={(e) => e.stopPropagation()}
                onBlur={(e) =>
                  patch({
                    editing: false,
                    label: e.currentTarget.value.trim(),
                  })
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.currentTarget.blur();
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    patch({ editing: false, label: text });
                  }
                }}
              />
            ) : (
              <span>{text}</span>
            )}
          </div>
        ) : null}
      </EdgeLabelRenderer>
    </>
  );
}
