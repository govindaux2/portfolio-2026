import { useReactFlow } from '@xyflow/react';
import { TrashIcon } from './icons';

export function NodeDeleteButton({ id }: { id: string }) {
  const { deleteElements } = useReactFlow();
  return (
    <button
      type="button"
      className="flow-node-del nodrag nopan"
      aria-label="Delete"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        deleteElements({ nodes: [{ id }] });
      }}
    >
      <TrashIcon size={13} />
    </button>
  );
}
