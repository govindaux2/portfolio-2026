import { useRef, useState } from 'react';
import { useReactFlow, type Node, type NodeProps } from '@xyflow/react';
import { NONE, contrastInk, isNone } from './color';
import { SECTION_MIN } from './model';
import { CornerResize } from './CornerResize';
import { DictationMic, ListeningChip } from './DictationMic';
import { NodeMenu } from './NodeMenu';
import { NodePorts } from './NodePorts';
import { useCoarsePointer } from './useCoarsePointer';
import { useDictation } from './useDictation';
import { useNodeEdit } from './useNodeEdit';
import type { SectionData } from './types';

export type SectionNodeType = Node<SectionData, 'section'>;

export function SectionNode({ id, data, selected }: NodeProps<SectionNodeType>) {
  const { updateNodeData } = useReactFlow();
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const coarse = useCoarsePointer();
  const [focused, setFocused] = useState(false);
  const { editing, setEditing, onPointerDown, onPointerUp, onDoubleClick } =
    useNodeEdit(selected);
  const dictation = useDictation({
    enabled: Boolean(!coarse && editing && focused),
    value: data.title,
    placeholders: ['Section'],
    inputRef: titleRef,
    onChange: (title) => updateNodeData(id, { title }),
  });
  const fill = data.color && !isNone(data.color) ? data.color : NONE;
  const chip = isNone(data.color) ? 'var(--flow-surface)' : data.color;
  const title = data.title || 'Section';
  const ink = contrastInk(data.color);

  return (
    <div
      className={`flow-section${selected ? ' is-selected' : ''}${dictation.listening ? ' is-listening' : ''}`}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onDoubleClick={onDoubleClick}
      style={{
        background: fill,
        borderColor: isNone(data.color)
          ? 'color-mix(in srgb, var(--muted) 55%, var(--line))'
          : data.color,
      }}
    >
      <CornerResize minWidth={SECTION_MIN.w} minHeight={SECTION_MIN.h} />
      <NodeMenu id={id} onRename={() => setEditing(true)} />
      <NodePorts />
      {dictation.listening ? <ListeningChip field="title" /> : null}
      <div className="flow-section-label">
        {editing ? (
          <div className="flow-dictation-row">
            {!coarse && (focused || dictation.listening) ? (
              <DictationMic
                label="title"
                listening={dictation.listening}
                onToggle={dictation.toggle}
              />
            ) : null}
            <textarea
              ref={titleRef}
              className="flow-section-title nodrag"
              value={data.title}
              autoFocus
              rows={1}
              onFocus={() => setFocused(true)}
              onChange={(e) => updateNodeData(id, { title: e.target.value })}
              onPointerDown={(e) => {
                if (e.shiftKey || e.metaKey || e.ctrlKey) return;
                e.stopPropagation();
              }}
              onBlur={() => {
                if (dictation.listening) return;
                setEditing(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              placeholder="Section"
              style={{ background: chip, color: ink }}
            />
          </div>
        ) : (
          <button
            type="button"
            className="flow-section-title"
            onClick={() => selected && setEditing(true)}
            style={{ background: chip, color: ink }}
            title={title}
          >
            {title}
          </button>
        )}
      </div>
    </div>
  );
}
