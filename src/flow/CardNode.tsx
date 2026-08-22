import { useRef } from 'react';
import {
  Handle,
  Position,
  useReactFlow,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import type { CardData } from './types';

export type CardNodeType = Node<CardData, 'card'>;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function CardNode({ id, data, selected }: NodeProps<CardNodeType>) {
  const { updateNodeData, deleteElements } = useReactFlow();
  const fileRef = useRef<HTMLInputElement>(null);

  const onPickImage = async (file: File | undefined) => {
    if (!file) return;
    const url = await readFileAsDataUrl(file);
    updateNodeData(id, { image: url });
  };

  return (
    <div className={`flow-card${selected ? ' is-selected' : ''}`}>
      <Handle type="target" position={Position.Left} className="flow-handle" />
      <Handle type="target" position={Position.Top} className="flow-handle" />

      <div className="flow-card-bar">
        <span className="flow-card-grip" aria-hidden>
          ⠿
        </span>
        <button
          type="button"
          className="flow-card-remove nodrag"
          title="Delete node"
          onClick={() => deleteElements({ nodes: [{ id }] })}
        >
          ×
        </button>
      </div>

      {data.image ? (
        <div className="flow-card-media">
          <img src={data.image} alt="" />
          <button
            type="button"
            className="flow-card-img-remove nodrag"
            title="Remove image"
            onClick={() => updateNodeData(id, { image: undefined })}
          >
            Remove
          </button>
        </div>
      ) : null}

      <input
        className="flow-card-heading nodrag"
        placeholder="Heading"
        value={data.heading}
        onChange={(e) => updateNodeData(id, { heading: e.target.value })}
      />

      <textarea
        className="flow-card-text nodrag nowheel"
        placeholder="Add text…"
        rows={3}
        value={data.text}
        onChange={(e) => updateNodeData(id, { text: e.target.value })}
      />

      {!data.image ? (
        <button
          type="button"
          className="flow-card-add-img nodrag"
          onClick={() => fileRef.current?.click()}
        >
          + Add image
        </button>
      ) : null}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          onPickImage(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      <Handle
        type="source"
        position={Position.Right}
        className="flow-handle"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="flow-handle"
      />
    </div>
  );
}
