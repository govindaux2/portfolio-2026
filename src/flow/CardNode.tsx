import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useReactFlow, useStore, type Node, type NodeProps } from '@xyflow/react';
import { contrastInk } from './color';
import { CARD_MIN, CARD_THUMB_MIN, cardImages, readFileAsDataUrl } from './model';
import { measureContentHeight, useHugToContent } from './useHugHeight';
import { CornerResize } from './CornerResize';
import { TrashIcon } from './icons';
import { DictationMic } from './DictationMic';
import { NodeMenu } from './NodeMenu';
import { NodePorts } from './NodePorts';
import { RichBody } from './RichBody';
import { toSafeHtml } from './richText';
import { useCoarsePointer } from './useCoarsePointer';
import { useDictation } from './useDictation';
import { useNodeEdit } from './useNodeEdit';
import type { CardData } from './types';

export type CardNodeType = Node<CardData, 'card'>;

export function CardNode({ id, data, selected }: NodeProps<CardNodeType>) {
  const { updateNodeData, setNodes } = useReactFlow();
  const rootRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLTextAreaElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const { hug, fitHeight } = useHugToContent(id, rootRef, CARD_MIN.w, CARD_MIN.h);
  const coarse = useCoarsePointer();
  const [preview, setPreview] = useState<number | null>(null);
  const [focusField, setFocusField] = useState<'heading' | 'body' | null>(null);
  const images = cardImages(data);
  const locked = useStore((s) =>
    Boolean((s.nodes.find((n) => n.id === id) as { locked?: boolean } | undefined)?.locked)
  );
  const { editing, setEditing, onPointerDown, onPointerUp, onDoubleClick } =
    useNodeEdit(selected && !locked);
  const headingVoice = useDictation({
    enabled: Boolean(!coarse && editing && !locked && focusField === 'heading'),
    value: data.heading,
    placeholders: ['Heading'],
    inputRef: headingRef,
    onChange: (heading) => updateNodeData(id, { heading }),
  });
  const bodyVoice = useDictation({
    enabled: Boolean(!coarse && editing && !locked && focusField === 'body'),
    value: data.text,
    placeholders: ['Text', 'Add text…'],
    inputRef: textRef,
    onChange: (text) => updateNodeData(id, { text }),
  });
  const autoInk = contrastInk(data.background);
  const headingInk = data.headingColor || autoInk;
  const bodyInk = data.textColor || autoInk;
  const headingSize = data.fontSize
    ? Math.min(42, data.fontSize)
    : undefined;
  const bodySize = data.fontSize || undefined;
  const weight = data.fontWeight || undefined;

  useEffect(() => {
    if (!editing) setFocusField(null);
  }, [editing]);

  const fitRef = useRef(fitHeight);
  fitRef.current = fitHeight;
  const prevFont = useRef(data.fontSize);
  useLayoutEffect(() => {
    const heading = headingRef.current;
    if (heading) {
      heading.style.height = 'auto';
      heading.style.height = `${heading.scrollHeight}px`;
    }
    const sizeChanged = prevFont.current !== data.fontSize;
    prevFont.current = data.fontSize;
    fitRef.current(!sizeChanged);
  }, [data.heading, data.text, data.fontSize, editing, images.length]);

  const addFiles = async (files: File[]) => {
    const urls: string[] = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      urls.push(await readFileAsDataUrl(file));
    }
    if (!urls.length) return;
    const nextImages = [...images, ...urls];
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id
          ? {
              ...n,
              data: { ...n.data, images: nextImages, image: undefined },
            }
          : n
      )
    );
  };

  return (
    <div
      ref={rootRef}
      className={`flow-card${selected ? ' is-selected' : ''}${editing ? ' is-editing' : ''}${headingVoice.listening || bodyVoice.listening ? ' is-listening' : ''}`}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onDoubleClick={(e) => {
        if (!coarse) {
          e.stopPropagation();
          hug();
          return;
        }
        onDoubleClick(e);
      }}
      style={{
        background:
          data.background === 'transparent'
            ? 'transparent'
            : data.background || undefined,
        textAlign: 'left',
      }}
    >
      <CornerResize
        minWidth={CARD_MIN.w}
        minHeight={CARD_MIN.h}
        onHug={hug}
        minSizeFor={(w) => {
          const el = rootRef.current;
          const minW = Math.max(
            CARD_MIN.w,
            images.length ? CARD_THUMB_MIN + 40 : CARD_MIN.w
          );
          const width = Math.max(minW, w);
          const minH = el
            ? measureContentHeight(el, CARD_MIN.h, width)
            : CARD_MIN.h;
          return { w: minW, h: minH };
        }}
      />
      <NodeMenu id={id} onRename={() => setEditing(true)} />
      <NodePorts />

      {images.length ? (
        <div className="flow-card-thumbs">
          {images.map((src, i) => (
            <div key={`${src.slice(0, 24)}-${i}`} className="flow-card-thumb-wrap">
              <button
                type="button"
                className="flow-card-thumb nodrag"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreview(i);
                }}
              >
                <img src={src} alt="" />
              </button>
              <button
                type="button"
                className="flow-thumb-del nodrag nopan"
                aria-label="Remove image"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  const next = images.filter((_, j) => j !== i);
                  updateNodeData(id, { images: next, image: undefined });
                  setPreview(null);
                }}
              >
                <TrashIcon size={12} />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {editing ? (
        <>
          <div className="flow-dictation-row">
            {!coarse && (focusField === 'heading' || headingVoice.listening) ? (
              <DictationMic
                label="heading"
                listening={headingVoice.listening}
                onToggle={headingVoice.toggle}
                onArm={headingVoice.arm}
              />
            ) : null}
            <textarea
              ref={headingRef}
              className="flow-card-heading nodrag"
              placeholder="Heading"
              rows={1}
              value={data.heading}
              onFocus={() => setFocusField('heading')}
              onChange={(e) => updateNodeData(id, { heading: e.target.value })}
              onPointerDown={(e) => {
                if (e.shiftKey || e.metaKey || e.ctrlKey) return;
                e.stopPropagation();
              }}
              style={{
                color: headingInk,
                fontSize: headingSize,
                fontWeight: weight,
                textAlign: 'left',
              }}
            />
          </div>
          <RichBody
            editorRef={textRef}
            className="flow-card-text"
            placeholder="Add text…"
            value={data.text}
            onChange={(text) => updateNodeData(id, { text })}
            onFocus={() => setFocusField('body')}
            showToolbar={!coarse && focusField === 'body'}
            leading={
              !coarse && (focusField === 'body' || bodyVoice.listening) ? (
                <DictationMic
                  label="text"
                  listening={bodyVoice.listening}
                  onToggle={bodyVoice.toggle}
                  onArm={bodyVoice.arm}
                />
              ) : null
            }
            style={{
              color: bodyInk,
              fontSize: bodySize,
              fontWeight: weight,
              textAlign: 'left',
            }}
          />
          <button
            type="button"
            className="flow-card-add-img nodrag"
            onClick={() => fileRef.current?.click()}
          >
            {images.length ? 'Add images' : 'Add image'}
          </button>
        </>
      ) : (
        <>
          <div
            className="flow-card-heading"
            style={{
              color: headingInk,
              fontSize: headingSize,
              fontWeight: weight,
              textAlign: 'left',
            }}
          >
            {data.heading || 'Heading'}
          </div>
          <div
            className="flow-card-text"
            style={{
              color: bodyInk,
              fontSize: bodySize,
              fontWeight: weight,
              textAlign: 'left',
            }}
            dangerouslySetInnerHTML={{
              __html: data.text ? toSafeHtml(data.text) : 'Text',
            }}
          />
        </>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        multiple
        onChange={(e) => {
          addFiles([...(e.target.files ?? [])]);
          e.target.value = '';
        }}
      />

      {preview !== null && images[preview]
        ? createPortal(
            <div
              className="flow-preview"
              onClick={() => setPreview(null)}
              role="dialog"
              aria-label="Image preview"
            >
              <img
                src={images[preview]}
                alt=""
                onClick={(e) => e.stopPropagation()}
              />
              {images.length > 1 ? (
                <div className="flow-preview-nav" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() =>
                      setPreview((i) =>
                        i === null ? 0 : (i + images.length - 1) % images.length
                      )
                    }
                  >
                    ‹
                  </button>
                  <span>
                    {preview + 1} / {images.length}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setPreview((i) =>
                        i === null ? 0 : (i + 1) % images.length
                      )
                    }
                  >
                    ›
                  </button>
                </div>
              ) : null}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
