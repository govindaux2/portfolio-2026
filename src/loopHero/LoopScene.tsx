import { Suspense, lazy, useEffect, useRef, type RefObject } from 'react';
import type { LoopParams } from './loopParams';
import type { LoopPointer, LoopShift } from './LoopCanvas';
import { LoopGlError } from './LoopGlError';

const LoopCanvas = lazy(() =>
  import('./LoopCanvas').then((m) => ({ default: m.LoopCanvas }))
);

type Props = {
  params: LoopParams;
  paramsRef: RefObject<LoopParams>;
  reduce: boolean;
};

export function LoopScene({ params, paramsRef, reduce }: Props) {
  const stage = useRef<HTMLDivElement>(null);
  const mouse = useRef<LoopPointer>({ x: 0, y: 0 });
  const shift = useRef<LoopShift>({ x: 0, y: 0 });
  const near = useRef(0);
  const display = useRef({ x: 0, y: 0, near: 0 });
  const view = useRef({ left: 0, top: 0, w: 1, h: 1 });
  const hover = useRef(false);

  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    return () => {
      html.style.scrollBehavior = prev;
    };
  }, []);

  useEffect(() => {
    const node = stage.current;
    if (!node) return;
    const measure = () => {
      const r = node.getBoundingClientRect();
      view.current = { left: r.left, top: r.top, w: r.width, h: r.height };
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    const tick = () => {
      if (document.hidden) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const p = paramsRef.current;
      const d = display.current;
      const v = view.current;
      d.x += (mouse.current.x * 10 * p.mouse * p.parallax - d.x) * 0.1;
      d.y += (mouse.current.y * 8 * p.mouse * p.parallax - d.y) * 0.1;

      let targetNear = 0;
      if (hover.current) {
        const cx = v.w * 0.5 + d.x;
        const cy = v.h * 0.5 + d.y;
        const radius = (p.circleSize / 100) * 0.5 * Math.min(v.w, v.h);
        const px = (mouse.current.x * 0.5 + 0.5) * v.w;
        const py = (mouse.current.y * 0.5 + 0.5) * v.h;
        const ringDist = Math.abs(Math.hypot(px - cx, py - cy) - radius);
        const band = Math.max(48, radius * 0.42);
        const falloff = 1 - Math.min(1, ringDist / band);
        targetNear = falloff * falloff;
      }
      d.near += (targetNear - d.near) * 0.12;

      shift.current.x = d.x;
      shift.current.y = d.y;
      near.current = d.near;

      const layer = stage.current;
      if (layer) {
        layer.style.setProperty('--mx', `${d.x}px`);
        layer.style.setProperty('--my', `${d.y}px`);
        layer.style.setProperty('--near', d.near.toFixed(3));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paramsRef, reduce]);

  return (
    <div
      className={reduce ? 'loop-page is-reduce' : 'loop-page'}
      style={{ background: params.bgColor }}
    >
      <div
        ref={stage}
        className="loop-sticky"
        onPointerMove={(e) => {
          if (reduce) return;
          if ((e.target as HTMLElement).closest('.loop-ctrl')) return;
          hover.current = true;
          const v = view.current;
          mouse.current.x = ((e.clientX - v.left) / v.w) * 2 - 1;
          mouse.current.y = ((e.clientY - v.top) / v.h) * 2 - 1;
        }}
        onPointerLeave={() => {
          hover.current = false;
          mouse.current.x = 0;
          mouse.current.y = 0;
        }}
      >
        <div className="loop-anchor">
          <div
            className="loop-well"
            style={{
              width: `${params.circleSize}vmin`,
              ['--well-a' as string]: params.circleA,
              ['--well-b' as string]: params.circleB,
            }}
          />
        </div>

        <LoopGlError>
          <Suspense fallback={null}>
            <LoopCanvas
              paramsRef={paramsRef}
              mouse={mouse}
              shift={shift}
              near={near}
              reduce={reduce}
            />
          </Suspense>
        </LoopGlError>

        <div className="loop-rings" aria-hidden>
          <div
            className="loop-orbit"
            style={{
              width: `calc(${params.circleSize}vmin + ${params.ringGap * 2}px)`,
              animationDuration: reduce ? '0s' : '22s',
            }}
          />
          <div
            className="loop-tick"
            style={{
              width: `calc(${params.circleSize}vmin + ${params.ringGap * 2}px)`,
              animationDuration: reduce ? '0s' : '16s',
            }}
          />
        </div>

        <div className="loop-copy">
          <p className="loop-kicker">Human in the loop</p>
          <h1>The system moves. A person still signs.</h1>
        </div>
      </div>
    </div>
  );
}
