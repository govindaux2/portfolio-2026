import { Handle, Position } from '@xyflow/react';

const SIDES = [
  { id: 'left', position: Position.Left },
  { id: 'top', position: Position.Top },
  { id: 'right', position: Position.Right },
  { id: 'bottom', position: Position.Bottom },
] as const;

export function NodePorts() {
  return (
    <>
      {SIDES.map((side) => (
        <Handle
          key={side.id}
          type="source"
          id={side.id}
          position={side.position}
          className="flow-handle"
          isConnectable
        />
      ))}
    </>
  );
}
