import { useEffect, useRef, type RefObject } from 'react';

type Mouse = { x: number; y: number };

export function useGlassPointer(
  root: RefObject<HTMLElement | null>,
  reduce: boolean | null
) {
  const mouse = useRef<Mouse>({ x: 0.52, y: 0.52 });
  const pressed = useRef(0);

  useEffect(() => {
    if (reduce) return;

    const onMove = (event: PointerEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest('[data-glass-controls]')
      ) {
        return;
      }
      const el = root.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      mouse.current.x = (event.clientX - rect.left) / Math.max(rect.width, 1);
      mouse.current.y = 1 - (event.clientY - rect.top) / Math.max(rect.height, 1);
    };

    const onUp = () => {
      pressed.current = 0;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [reduce, root]);

  return { mouse, pressed };
}
