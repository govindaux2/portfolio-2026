import { useReactFlow } from '@xyflow/react';
import { useCallback, type RefObject } from 'react';

export function measureHug(
  el: HTMLElement,
  minW: number,
  minH: number,
  currentW: number
) {
  const prevWidth = el.style.width;
  const prevHeight = el.style.height;
  const prevMax = el.style.maxWidth;
  const flowW = Math.max(minW, currentW);
  el.style.height = 'auto';
  el.style.maxWidth = `${flowW}px`;
  el.style.width = `${flowW}px`;
  const h = Math.max(minH, Math.ceil(el.scrollHeight));
  el.style.width = prevWidth;
  el.style.height = prevHeight;
  el.style.maxWidth = prevMax;
  return { w: flowW, h };
}

export function measureContentHeight(
  el: HTMLElement,
  minH: number,
  currentW: number
) {
  const prevWidth = el.style.width;
  const prevHeight = el.style.height;
  const prevMax = el.style.maxWidth;
  const prevOverflow = el.style.overflow;
  el.style.overflow = 'visible';
  el.style.height = 'auto';
  el.style.maxWidth = `${currentW}px`;
  el.style.width = `${currentW}px`;
  const h = Math.max(minH, Math.ceil(el.scrollHeight));
  el.style.width = prevWidth;
  el.style.height = prevHeight;
  el.style.maxWidth = prevMax;
  el.style.overflow = prevOverflow;
  return h;
}

function applyNodeSize(
  setNodes: ReturnType<typeof useReactFlow>['setNodes'],
  id: string,
  width: number,
  height: number
) {
  setNodes((nds) =>
    nds.map((n) => {
      if (n.id !== id) return n;
      if (n.width === width && n.height === height) return n;
      return {
        ...n,
        width,
        height,
        style: { ...n.style, width, height },
      };
    })
  );
}

export function useHugToContent(
  id: string,
  ref: RefObject<HTMLElement | null>,
  minW: number,
  minH: number
) {
  const { setNodes, getNodes } = useReactFlow();
  const hug = useCallback(() => {
    const el = ref.current;
    const node = getNodes().find((n) => n.id === id);
    if (!el || !node) return;
    const nodeW = Math.max(minW, node.width ?? minW);
    const { w, h } = measureHug(el, minW, minH, nodeW);
    applyNodeSize(setNodes, id, w, h);
  }, [getNodes, id, minH, minW, ref, setNodes]);

  const fitHeight = useCallback(
    (growOnly = false) => {
      const el = ref.current;
      const node = getNodes().find((n) => n.id === id);
      if (!el || !node) return;
      const nodeW = Math.max(minW, node.width ?? minW);
      const nodeH = Math.max(minH, node.height ?? minH);
      const h = measureContentHeight(el, minH, nodeW);
      if (growOnly && h <= nodeH + 1) return;
      if (!growOnly && Math.abs(h - nodeH) < 1) return;
      applyNodeSize(setNodes, id, nodeW, growOnly ? Math.max(nodeH, h) : h);
    },
    [getNodes, id, minH, minW, ref, setNodes]
  );

  return { hug, fitHeight };
}
