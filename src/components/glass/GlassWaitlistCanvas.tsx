import { useMemo, useRef, type RefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { baseVert, glassWaitlistFragV1 } from '../gl/shaders';

type Mouse = { x: number; y: number };

type PlaneProps = {
  mouse: RefObject<Mouse>;
  button: RefObject<HTMLButtonElement | null>;
  pressed: RefObject<number>;
  reduce: boolean | null;
};

function GlassPlane({ mouse, button, pressed, reduce }: PlaneProps) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uMouse: { value: new THREE.Vector2(0.5, 0.52) },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uPillCenter: { value: new THREE.Vector2(0.5, 0.5) },
      uPillPx: { value: new THREE.Vector2(240, 52) },
      uPressed: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    const material = mat.current;
    if (!material) return;

    const res = material.uniforms.uResolution.value as THREE.Vector2;
    res.set(state.size.width, state.size.height);

    const canvas = state.gl.domElement.getBoundingClientRect();
    const pill = button.current?.getBoundingClientRect();
    if (pill && canvas.width > 0 && canvas.height > 0) {
      const cx = pill.left + pill.width * 0.5 - canvas.left;
      const cy = canvas.height - (pill.top + pill.height * 0.5 - canvas.top);
      (material.uniforms.uPillCenter.value as THREE.Vector2).set(cx, cy);
      (material.uniforms.uPillPx.value as THREE.Vector2).set(pill.width, pill.height);
    }

    const target = mouse.current;
    const light = material.uniforms.uMouse.value as THREE.Vector2;
    if (reduce) {
      const c = material.uniforms.uPillCenter.value as THREE.Vector2;
      light.set(c.x / Math.max(res.x, 1), c.y / Math.max(res.y, 1));
    } else if (target) {
      light.x += (target.x - light.x) * 0.07;
      light.y += (target.y - light.y) * 0.07;
    }

    const press = material.uniforms.uPressed;
    const goal = pressed.current ?? 0;
    press.value += (goal - press.value) * 0.18;
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
        vertexShader={baseVert}
        fragmentShader={glassWaitlistFragV1}
        uniforms={uniforms}
      />
    </mesh>
  );
}

type GlassWaitlistCanvasProps = {
  mouse: RefObject<Mouse>;
  button: RefObject<HTMLButtonElement | null>;
  pressed: RefObject<number>;
  reduce: boolean | null;
};

export function GlassWaitlistCanvas({
  mouse,
  button,
  pressed,
  reduce,
}: GlassWaitlistCanvasProps) {
  return (
    <div className="glass-lab__gl" aria-hidden>
      <Canvas
        dpr={[1, 1.25]}
        gl={{ antialias: false, powerPreference: 'high-performance', alpha: false }}
        orthographic
        camera={{ position: [0, 0, 1] }}
      >
        <GlassPlane
          mouse={mouse}
          button={button}
          pressed={pressed}
          reduce={reduce}
        />
      </Canvas>
    </div>
  );
}
