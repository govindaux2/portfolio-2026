import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useInView } from '../useInView';
import { baseVert } from './shaders';

type PlaneProps = {
  frag: string;
  mouse?: React.RefObject<{ x: number; y: number }>;
};

function Plane({ frag, mouse }: PlaneProps) {
  const mat = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uAspect: { value: 1 },
    }),
    []
  );

  useFrame((state, delta) => {
    if (!mat.current) return;
    mat.current.uniforms.uTime.value += delta;
    mat.current.uniforms.uAspect.value =
      state.size.width / Math.max(state.size.height, 1);
    if (mouse?.current) {
      // Ease toward the pointer so movement feels fluid, not tracked
      const u = mat.current.uniforms.uMouse.value as THREE.Vector2;
      u.x += (mouse.current.x - u.x) * 0.05;
      u.y += (mouse.current.y - u.y) * 0.05;
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
        vertexShader={baseVert}
        fragmentShader={frag}
        uniforms={uniforms}
      />
    </mesh>
  );
}

type ShaderPlaneProps = {
  frag: string;
  className?: string;
  mouse?: React.RefObject<{ x: number; y: number }>;
};

/**
 * Fullscreen-quad shader canvas. Pauses rendering entirely when offscreen
 * so a page full of shader tiles costs only what is visible.
 */
export default function ShaderPlane({ frag, className, mouse }: ShaderPlaneProps) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div ref={ref} className={className}>
      <Canvas
        dpr={[1, 1.5]}
        frameloop={inView ? 'always' : 'never'}
        gl={{ antialias: false, powerPreference: 'low-power' }}
        orthographic
        camera={{ position: [0, 0, 1] }}
      >
        <Plane frag={frag} mouse={mouse} />
      </Canvas>
    </div>
  );
}
