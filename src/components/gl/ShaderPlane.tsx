import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useLiveGl } from './useLiveGl';
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
    mat.current.uniforms.uTime.value += Math.min(delta, 0.05);
    mat.current.uniforms.uAspect.value =
      state.size.width / Math.max(state.size.height, 1);
    if (mouse?.current) {
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
  dpr?: [number, number];
};

/**
 * Fullscreen-quad shader. Stops the loop offscreen and when the tab is hidden.
 */
export default function ShaderPlane({
  frag,
  className,
  mouse,
  dpr = [1, 1.25],
}: ShaderPlaneProps) {
  const { ref, live } = useLiveGl<HTMLDivElement>();

  return (
    <div ref={ref} className={className}>
      <Canvas
        dpr={dpr}
        frameloop={live ? 'always' : 'never'}
        gl={{ antialias: false, powerPreference: 'low-power' }}
        orthographic
        camera={{ position: [0, 0, 1] }}
      >
        <Plane frag={frag} mouse={mouse} />
      </Canvas>
    </div>
  );
}
