import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { useReactFlow, type Node, type NodeProps } from '@xyflow/react';
import { FULL_CROP, IMAGE_MIN } from './model';
import { CornerResize } from './CornerResize';
import { NodeMenu } from './NodeMenu';
import { NodePorts } from './NodePorts';
import type { ImageCrop, ImageData } from './types';

export type ImageNodeType = Node<ImageData, 'image'>;

function clampCrop(c: ImageCrop): ImageCrop {
  const w = Math.min(1, Math.max(0.12, c.w));
  const h = Math.min(1, Math.max(0.12, c.h));
  return {
    w,
    h,
    x: Math.min(Math.max(0, c.x), 1 - w),
    y: Math.min(Math.max(0, c.y), 1 - h),
  };
}

function photoStyle(crop: ImageCrop): CSSProperties {
  return {
    width: `${100 / crop.w}%`,
    height: `${100 / crop.h}%`,
    left: `${(-crop.x / crop.w) * 100}%`,
    top: `${(-crop.y / crop.h) * 100}%`,
  };
}

export function ImageNode({ id, data, selected }: NodeProps<ImageNodeType>) {
  const { updateNodeData } = useReactFlow();
  const rootRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; crop: ImageCrop } | null>(null);
  const pinchRef = useRef<{ dist: number; crop: ImageCrop } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const crop = data.crop ?? FULL_CROP;
  const cropping = Boolean(data.cropMode);
  const [preview, setPreview] = useState(false);
  const tapRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!cropping) return;
    const onDown = (e: PointerEvent) => {
      const root = rootRef.current;
      const t = e.target as HTMLElement;
      if (root?.contains(t) || t.closest('.flow-inspector')) return;
      updateNodeData(id, { cropMode: false });
    };
    document.addEventListener('pointerdown', onDown, true);
    return () => document.removeEventListener('pointerdown', onDown, true);
  }, [cropping, id, updateNodeData]);

  const setCrop = (next: ImageCrop) => updateNodeData(id, { crop: clampCrop(next) });

  const begin = (e: React.PointerEvent) => {
    if (!cropping) return;
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    if (pts.length >= 2) {
      pinchRef.current = {
        dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
        crop,
      };
      dragRef.current = null;
      return;
    }
    dragRef.current = { x: e.clientX, y: e.clientY, crop };
  };

  const move = (e: React.PointerEvent) => {
    if (!cropping) return;
    if (pointers.current.has(e.pointerId)) {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }
    const pts = [...pointers.current.values()];
    if (pinchRef.current && pts.length >= 2) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const factor = pinchRef.current.dist / dist;
      const start = pinchRef.current.crop;
      const nextW = start.w * factor;
      const nextH = start.h * factor;
      setCrop({
        w: nextW,
        h: nextH,
        x: start.x - (nextW - start.w) / 2,
        y: start.y - (nextH - start.h) / 2,
      });
      return;
    }
    const drag = dragRef.current;
    if (!drag) return;
    const box = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const dx = (e.clientX - drag.x) / box.width;
    const dy = (e.clientY - drag.y) / box.height;
    setCrop({
      ...drag.crop,
      x: drag.crop.x - dx * drag.crop.w,
      y: drag.crop.y - dy * drag.crop.h,
    });
  };

  const end = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchRef.current = null;
    if (pointers.current.size === 0) dragRef.current = null;
  };

  return (
    <div
      ref={rootRef}
      className={`flow-image${selected ? ' is-selected' : ''}${
        cropping ? ' is-cropping' : ''
      }`}
    >
      {cropping ? null : (
        <CornerResize lockRatio minWidth={IMAGE_MIN.w} minHeight={IMAGE_MIN.h} />
      )}
      <NodeMenu id={id} />
      <NodePorts />

      <div
        className={`flow-image-frame${cropping ? ' nodrag nowheel' : ''}`}
        onPointerDown={(e) => {
          tapRef.current = { x: e.clientX, y: e.clientY };
          if (cropping) begin(e);
        }}
        onPointerMove={cropping ? move : undefined}
        onPointerUp={(e) => {
          if (cropping) {
            end(e);
            return;
          }
          const start = tapRef.current;
          tapRef.current = null;
          if (!start) return;
          const dist = Math.hypot(e.clientX - start.x, e.clientY - start.y);
          if (dist < 10) setPreview(true);
        }}
        onPointerCancel={cropping ? end : undefined}
      >
        <img src={data.src} alt="" draggable={false} style={photoStyle(crop)} />
      </div>
      {preview
        ? createPortal(
            <div
              className="flow-preview"
              onClick={() => setPreview(false)}
              role="dialog"
              aria-label="Image preview"
            >
              <img
                src={data.src}
                alt=""
                onClick={(e) => e.stopPropagation()}
              />
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
