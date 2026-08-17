import { useMemo, useRef, type RefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { baseVert, glassWaitlistFragV2 } from '../gl/shaders';
import { hueToRgb, hueToRgbVivid, type GlassParamsV2 } from './glassParams';

type Mouse = { x: number; y: number };

type PlaneProps = {
  mouse: RefObject<Mouse>;
  button: RefObject<HTMLButtonElement | null>;
  pressed: RefObject<number>;
  hover: RefObject<number>;
  params: RefObject<GlassParamsV2>;
  reduce: boolean | null;
};

function GlassPlaneV2({ mouse, button, pressed, hover, params, reduce }: PlaneProps) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uMouse: { value: new THREE.Vector2(0.5, 0.52) },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uPillCenter: { value: new THREE.Vector2(0.5, 0.5) },
      uPillPx: { value: new THREE.Vector2(240, 52) },
      uPressed: { value: 0 },
      uHover: { value: 0 },
      uLightIntensity: { value: 0.26 },
      uLightSize: { value: 0.5 },
      uLightColor: { value: new THREE.Vector3(0.32, 0.8, 0.84) },
      uRefraction: { value: 0.016 },
      uMagnify: { value: 0.055 },
      uFrost: { value: 0.38 },
      uTint: { value: 0.14 },
      uRim: { value: 0.3 },
      uGrain: { value: 0.006 },
      uSpill: { value: 0.05 },
      uInnerGlow: { value: 0.06 },
      uVel: { value: new THREE.Vector2(0, 0) },
      uReact: { value: 0.55 },
      uHoverDim: { value: 0.68 },
      uStack: { value: 0 },
      uEdgeReact: { value: 0.62 },
      uEdgeWidth: { value: 7 },
      uEdgeReach: { value: 0.7 },
      uEdgeTop: { value: 0.2 },
      uInnerAmt: { value: 0.85 },
      uInnerVis: { value: 1 },
      uInnerInset: { value: 8 },
      uInnerBlur: { value: 12 },
      uInnerReact: { value: 0.55 },
      uInnerLight: { value: 0.7 },
      uInnerFrost: { value: 0.4 },
      uInnerNear: { value: 0.72 },
      uInnerFollow: { value: 0.5 },
      uInnerSpread: { value: 0.28 },
      uInnerColor: { value: new THREE.Vector3(0.28, 0.78, 0.88) },
    }),
    []
  );

  useFrame((state, delta) => {
    const material = mat.current;
    const p = params?.current;
    if (!material || !p) return;

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

    const vel = material.uniforms.uVel.value as THREE.Vector2;
    const target = mouse.current;
    const light = material.uniforms.uMouse.value as THREE.Vector2;
    const dt = Math.min(delta, 0.032);

    if (reduce) {
      const c = material.uniforms.uPillCenter.value as THREE.Vector2;
      light.set(c.x / Math.max(res.x, 1), c.y / Math.max(res.y, 1));
      vel.set(0, 0);
    } else if (target) {
      const mass = 0.9;
      const ax = ((target.x - light.x) * p.stiffness - vel.x * p.damping) / mass;
      const ay = ((target.y - light.y) * p.stiffness - vel.y * p.damping) / mass;
      vel.x += ax * dt;
      vel.y += ay * dt;
      light.x += vel.x * dt;
      light.y += vel.y * dt;
    }

    material.uniforms.uPressed.value +=
      ((pressed.current ?? 0) - material.uniforms.uPressed.value) * 0.18;
    material.uniforms.uHover.value +=
      ((hover.current ?? 0) - material.uniforms.uHover.value) * 0.12;

    material.uniforms.uLightIntensity.value = p.lightIntensity;
    material.uniforms.uLightSize.value = p.lightSize;
    const rgb = hueToRgb(p.lightHue);
    (material.uniforms.uLightColor.value as THREE.Vector3).set(rgb[0], rgb[1], rgb[2]);
    material.uniforms.uRefraction.value = p.refraction;
    material.uniforms.uMagnify.value = p.magnify;
    material.uniforms.uFrost.value = p.frost;
    material.uniforms.uTint.value = p.tint;
    material.uniforms.uRim.value = p.rim;
    material.uniforms.uGrain.value = p.grain;
    material.uniforms.uSpill.value = p.spill;
    material.uniforms.uInnerGlow.value = p.innerGlow;
    material.uniforms.uReact.value = p.react;
    material.uniforms.uHoverDim.value = p.hoverDim;
    material.uniforms.uStack.value = p.stack;
    material.uniforms.uEdgeReact.value = p.edgeReact ?? 0.62;
    material.uniforms.uEdgeWidth.value = p.edgeWidth ?? 7;
    material.uniforms.uEdgeReach.value = p.edgeReach ?? 0.7;
    material.uniforms.uEdgeTop.value = p.edgeTop ?? 0.2;
    material.uniforms.uInnerAmt.value = p.innerAmt ?? 0.85;
    const visOn = (p.innerVis ?? 1) >= 0.5 ? 1 : 0;
    uniforms.uInnerVis.value = visOn;
    if (material.uniforms.uInnerVis) {
      material.uniforms.uInnerVis.value = visOn;
    }
    material.uniforms.uInnerInset.value = p.innerInset ?? 8;
    material.uniforms.uInnerBlur.value = p.innerBlur ?? 9;
    material.uniforms.uInnerReact.value = p.innerReact ?? 0.6;
    material.uniforms.uInnerLight.value = p.innerLight ?? 0.85;
    material.uniforms.uInnerFrost.value = p.innerFrost ?? 0.35;
    material.uniforms.uInnerNear.value = p.innerNear ?? 0.55;
    material.uniforms.uInnerFollow.value = p.innerFollow ?? 0.35;
    material.uniforms.uInnerSpread.value = p.innerSpread ?? 0.28;
    const innerRgb = hueToRgbVivid(p.innerHue ?? 198);
    (material.uniforms.uInnerColor.value as THREE.Vector3).set(innerRgb[0], innerRgb[1], innerRgb[2]);

    if (pill && button.current && canvas.width > 0) {
      const lightX = light.x * canvas.width;
      const lightY = canvas.height - light.y * canvas.height;
      const lx = ((lightX - (pill.left - canvas.left)) / Math.max(pill.width, 1)) * 100;
      const ly = ((lightY - (pill.top - canvas.top)) / Math.max(pill.height, 1)) * 100;
      button.current.style.setProperty('--lx', `${lx}%`);
      button.current.style.setProperty('--ly', `${ly}%`);
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
        vertexShader={baseVert}
        fragmentShader={glassWaitlistFragV2}
        uniforms={uniforms}
      />
    </mesh>
  );
}

type Props = {
  mouse: RefObject<Mouse>;
  button: RefObject<HTMLButtonElement | null>;
  pressed: RefObject<number>;
  hover: RefObject<number>;
  params: RefObject<GlassParamsV2>;
  reduce: boolean | null;
};

export function GlassWaitlistCanvasV2({
  mouse,
  button,
  pressed,
  hover,
  params,
  reduce,
}: Props) {
  return (
    <div className="glass-lab__gl" aria-hidden>
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
        orthographic
        camera={{ position: [0, 0, 1] }}
      >
        <GlassPlaneV2
          mouse={mouse}
          button={button}
          pressed={pressed}
          hover={hover}
          params={params}
          reduce={reduce}
        />
      </Canvas>
    </div>
  );
}
