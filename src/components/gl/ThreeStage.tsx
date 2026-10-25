import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useLiveGl } from './useLiveGl';

function Mark({
  rot,
  spin,
}: {
  rot: { x: number; y: number };
  spin: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const spinY = useRef(0);

  useFrame((_, delta) => {
    const group = ref.current;
    if (!group) return;
    if (spin) spinY.current += Math.min(delta, 0.05) * 0.35;
    group.rotation.x = THREE.MathUtils.degToRad(rot.x);
    group.rotation.y = THREE.MathUtils.degToRad(rot.y) + spinY.current;
  });

  return (
    <group ref={ref}>
      <mesh>
        <icosahedronGeometry args={[0.9, 1]} />
        <meshStandardMaterial color="#c5c9d1" metalness={0.82} roughness={0.32} />
      </mesh>
    </group>
  );
}

/** Small 3D mark on the same WebGL stack as the hero shader. */
export default function ThreeStage() {
  const { ref, live } = useLiveGl<HTMLDivElement>('200px');
  const [armed, setArmed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [rot, setRot] = useState({ x: -18, y: 24 });
  const drag = useRef<{ x: number; y: number; rotX: number; rotY: number } | null>(
    null
  );
  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (live) setArmed(true);
  }, [live]);

  return (
    <div
      ref={ref}
      className="three-stage"
      onPointerDown={(e) => {
        (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
        drag.current = { x: e.clientX, y: e.clientY, rotX: rot.x, rotY: rot.y };
        setDragging(true);
      }}
      onPointerMove={(e) => {
        if (!drag.current) return;
        const dx = e.clientX - drag.current.x;
        const dy = e.clientY - drag.current.y;
        setRot({
          y: drag.current.rotY + dx * 0.45,
          x: drag.current.rotX + dy * 0.35,
        });
      }}
      onPointerUp={() => {
        drag.current = null;
        setDragging(false);
      }}
      onPointerCancel={() => {
        drag.current = null;
        setDragging(false);
      }}
    >
      {armed ? (
        <Canvas
          dpr={[1, 1.25]}
          frameloop={live ? 'always' : 'never'}
          gl={{ antialias: true, powerPreference: 'low-power' }}
          camera={{ position: [0, 0, 5.2], fov: 28 }}
        >
          <color attach="background" args={['#101114']} />
          <ambientLight intensity={0.55} />
          <directionalLight position={[2.4, 3.2, 4]} intensity={1.35} />
          <directionalLight position={[-3, -1, -2]} intensity={0.35} color="#8aa0c8" />
          <Mark rot={rot} spin={!reduce && !dragging} />
        </Canvas>
      ) : null}
    </div>
  );
}
