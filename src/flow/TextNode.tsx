import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useReactFlow, type Node, type NodeProps } from '@xyflow/react';
import { TEXT_MIN } from './model';
import { CornerResize } from './CornerResize';
import { DictationMic } from './DictationMic';
import { NodeMenu } from './NodeMenu';
import { NodePorts } from './NodePorts';
import { RichBody } from './RichBody';
import { toSafeHtml } from './richText';
import { useCoarsePointer } from './useCoarsePointer';
import { useDictation } from './useDictation';
import { useHugToContent } from './useHugHeight';
import { useNodeEdit } from './useNodeEdit';
import type { TextBlockData } from './types';

export type TextNodeType = Node<TextBlockData, 'text'>;

export function TextNode({ id, data, selected }: NodeProps<TextNodeType>) {
  const { updateNodeData } = useReactFlow();
  const rootRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { hug, fitHeight } = useHugToContent(id, rootRef, TEXT_MIN.w, TEXT_MIN.h);
  const coarse = useCoarsePointer();
  const [focused, setFocused] = useState(false);
  const { editing, setEditing, onPointerDown, onPointerUp, onDoubleClick } =
    useNodeEdit(selected);
  const dictation = useDictation({
    enabled: Boolean(!coarse && editing && focused),
    value: data.text,
    placeholders: ['Text'],
    inputRef: ref,
    onChange: (text) => updateNodeData(id, { text }),
  });

  useEffect(() => {
    if (!editing) setFocused(false);
  }, [editing]);

  const fitRef = useRef(fitHeight);
  fitRef.current = fitHeight;
  const prevFont = useRef(data.fontSize);
  useLayoutEffect(() => {
    const sizeChanged = prevFont.current !== data.fontSize;
    prevFont.current = data.fontSize;
    fitRef.current(!sizeChanged);
  }, [data.text, data.fontSize, editing]);

  return (
    <div
      ref={rootRef}
      className={`flow-text${selected ? ' is-selected' : ''}${editing ? ' is-editing' : ''}${dictation.listening ? ' is-listening' : ''}`}
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
    >
      <CornerResize minWidth={TEXT_MIN.w} minHeight={TEXT_MIN.h} onHug={hug} />
      <NodeMenu id={id} onRename={() => setEditing(true)} />
      <NodePorts />
      {editing ? (
        <RichBody
          editorRef={ref}
          className="flow-text-input"
          placeholder="Type…"
          value={data.text}
          onChange={(text) => updateNodeData(id, { text })}
          onFocus={() => setFocused(true)}
          showToolbar={!coarse && focused}
          leading={
            !coarse && (focused || dictation.listening) ? (
              <DictationMic
                label="text"
                listening={dictation.listening}
                onToggle={dictation.toggle}
                onArm={dictation.arm}
              />
            ) : null
          }
          style={{
            color: data.color || undefined,
            fontSize: data.fontSize || 18,
            fontWeight: data.fontWeight || 500,
            textAlign: 'left',
          }}
        />
      ) : (
        <div
          className="flow-text-view"
          style={{
            color: data.color || undefined,
            fontSize: data.fontSize || 18,
            fontWeight: data.fontWeight || 500,
            textAlign: 'left',
          }}
          dangerouslySetInnerHTML={{
            __html: data.text ? toSafeHtml(data.text) : 'Text',
          }}
        />
      )}
    </div>
  );
}
