import { useEffect, useRef, useState } from 'react';
import { useStore } from '@xyflow/react';
import { isTypingTarget } from './model';
import { useCoarsePointer } from './useCoarsePointer';

/**
 * FigJam-style edit: first click selects/drags, second click or
 * double-click (or Enter) edits. Phone: double-tap only.
 */
export function useNodeEdit(selected: boolean) {
  const coarse = useCoarsePointer();
  const sole = useStore((s) => {
    if (!selected) return false;
    let n = 0;
    for (const node of s.nodes) if (node.selected) n += 1;
    return n === 1;
  });
  const [editing, setEditing] = useState(false);
  const gesture = useRef({ x: 0, y: 0, armed: false });

  useEffect(() => {
    if (!selected) setEditing(false);
  }, [selected]);

  useEffect(() => {
    if (!sole || editing) return;
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setEditing(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sole, editing]);

  useEffect(() => {
    if (!editing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      setEditing(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editing]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || editing) {
      gesture.current.armed = false;
      return;
    }
    gesture.current = {
      x: e.clientX,
      y: e.clientY,
      armed: !coarse && selected && sole,
    };
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!gesture.current.armed) return;
    const dist = Math.hypot(
      e.clientX - gesture.current.x,
      e.clientY - gesture.current.y
    );
    gesture.current.armed = false;
    if (dist < 5) setEditing(true);
  };

  const onDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (coarse && selected) setEditing(true);
  };

  return {
    editing: editing && selected,
    setEditing,
    onPointerDown,
    onPointerUp,
    onDoubleClick,
  };
}
