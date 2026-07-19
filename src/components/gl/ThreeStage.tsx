import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useInView } from '../useInView';

function Sculpture() {
  const group = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    if (!group.current) return;
    target.current.x = state.pointer.y * 0.35;
    target.current.y = state.pointer.x * 0.6;
    group.current.rotation.x +=
      (target.current.x - group.current.rotation.x) * 0.06;
    group.current.rotation.y +=
      (target.current.y + state.clock.elapsedTime * 0.15 - group.current.rotation.y) *
      0.06;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.08;
    void delta;
  });

  return (
    <group ref={group}>
      <mesh>
        <torusKnotGeometry args={[1, 0.32, 220, 36]} />
        <meshStandardMaterial
          color="#1c1d1f"
          roughness={0.25}
          metalness={0.9}
        />
      </mesh>
    </group>
  );
}

/** Lazy-mounted 3D showcase. Paused when scrolled out of view. */
export default function ThreeStage() {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div ref={ref} className="three-stage">
      <Canvas
        dpr={[1, 1.75]}
        frameloop={inView ? 'always' : 'never'}
        camera={{ position: [0, 0, 4.2], fov: 40 }}
        gl={{ antialias: true, powerPreference: 'low-power' }}
      >
        <ambientLight intensity={0.25} />
        <directionalLight position={[4, 5, 3]} intensity={2.2} color="#f0f0ec" />
        <directionalLight position={[-5, -2, -4]} intensity={1.4} color="#c6f24e" />
        <Sculpture />
      </Canvas>
    </div>
  );
}
