import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useLiveGl } from '../components/gl/useLiveGl';
import { hexToRgb, type LoopParams } from './loopParams';
import { baseVert, loopTunnelFrag } from './loopShader';

export type LoopPointer = { x: number; y: number };
export type LoopShift = { x: number; y: number };

type Shared = {
  paramsRef: RefObject<LoopParams>;
  mouse: RefObject<LoopPointer>;
  shift: RefObject<LoopShift>;
  near: RefObject<number>;
  reduce: boolean;
};

function TunnelPlane({ paramsRef, mouse, shift, near, reduce }: Shared) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const nearSmoothed = useRef(0);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uScroll: { value: 0 },
      uSpeed: { value: 0.32 },
      uDensity: { value: 1.35 },
      uThickness: { value: 0.014 },
      uFog: { value: 0.1 },
      uWarp: { value: 0.07 },
      uRoomW: { value: 2.35 },
      uRoomH: { value: 1.18 },
      uPulse: { value: 0.22 },
      uNear: { value: 0 },
      uBg: { value: new THREE.Vector3(0.047, 0.047, 0.055) },
      uLine: { value: new THREE.Vector3(0.78, 0.77, 0.83) },
      uGlow: { value: new THREE.Vector3(0.82, 0.44, 0.88) },
      uCircleCenter: { value: new THREE.Vector2(0.5, 0.5) },
      uCircleRadius: { value: 120 },
      uCircleSoft: { value: 36 },
    }),
    []
  );

  useFrame((state, delta) => {
    const material = mat.current;
    if (!material) return;
    const p = paramsRef.current;
    const u = material.uniforms;
    const step = Math.min(delta, 0.05);
    const ease = 1 - Math.exp(-step * 8);

    if (!reduce) u.uTime.value += step;
    u.uSpeed.value = reduce ? 0 : p.speed;
    u.uDensity.value = p.density;
    u.uThickness.value = p.thickness;
    u.uFog.value = p.fog;
    u.uWarp.value = reduce ? 0 : p.warp;
    u.uRoomW.value = p.roomW;
    u.uRoomH.value = p.roomH;
    u.uPulse.value = reduce ? 0 : p.pulse;
    u.uCircleSoft.value = p.circleSoft;

    nearSmoothed.current += (near.current - nearSmoothed.current) * ease;
    u.uNear.value = reduce ? 0 : nearSmoothed.current * p.glow;

    const [br, bg, bb] = hexToRgb(p.bgColor);
    (u.uBg.value as THREE.Vector3).set(br, bg, bb);
    const [lr, lg, lb] = hexToRgb(p.lineColor);
    (u.uLine.value as THREE.Vector3).set(lr, lg, lb);
    const [gr, gg, gb] = hexToRgb(p.glowColor);
    (u.uGlow.value as THREE.Vector3).set(gr, gg, gb);

    (u.uResolution.value as THREE.Vector2).set(state.size.width, state.size.height);

    const m = u.uMouse.value as THREE.Vector2;
    const target = mouse.current;
    m.x += (target.x * p.mouse - m.x) * 0.06;
    m.y += (-target.y * p.mouse - m.y) * 0.06;

    const el = state.gl.domElement;
    const cssW = Math.max(el.clientWidth, 1);
    const cssH = Math.max(el.clientHeight, 1);
    const sx = state.size.width / cssW;
    const sy = state.size.height / cssH;
    const vmin = Math.min(cssW, cssH);
    (u.uCircleCenter.value as THREE.Vector2).set(
      state.size.width * 0.5 + shift.current.x * sx,
      state.size.height * 0.5 - shift.current.y * sy
    );
    u.uCircleRadius.value = (p.circleSize / 100) * 0.5 * vmin * sx;
  });

  return (
    <mesh renderOrder={-1} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
        vertexShader={baseVert}
        fragmentShader={loopTunnelFrag}
        uniforms={uniforms}
        toneMapped={false}
        transparent
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

function Bust({
  paramsRef,
  mouse,
  near,
  reduce,
}: Omit<Shared, 'shift'>) {
  const group = useRef<THREE.Group>(null);
  const key = useRef<THREE.DirectionalLight>(null);
  const fill = useRef<THREE.DirectionalLight>(null);
  const rimL = useRef<THREE.DirectionalLight>(null);
  const rimR = useRef<THREE.DirectionalLight>(null);
  const amb = useRef<THREE.AmbientLight>(null);
  const look = useRef({ x: 0, y: 0 });

  const shoulder = useMemo(
    () => [
      new THREE.Vector2(0.13, 0.08),
      new THREE.Vector2(0.17, 0.02),
      new THREE.Vector2(0.22, -0.06),
      new THREE.Vector2(0.48, -0.2),
      new THREE.Vector2(0.62, -0.3),
      new THREE.Vector2(0.58, -0.42),
      new THREE.Vector2(0.5, -0.62),
      new THREE.Vector2(0.44, -0.88),
      new THREE.Vector2(0.0, -0.92),
    ],
    []
  );

  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#070708',
        roughness: 0.38,
        metalness: 0.02,
      }),
    []
  );

  useEffect(() => () => mat.dispose(), [mat]);

  useFrame((state, delta) => {
    const p = paramsRef.current;
    const g = group.current;
    if (!g) return;

    const t = state.clock.elapsedTime;
    const step = Math.min(delta, 0.05);
    const breathe = reduce ? 0 : p.breathe;
    const s = p.figureScale * 0.36 * (1 + Math.sin(t * 0.65) * 0.01 * breathe);
    g.scale.setScalar(s);
    g.position.y = p.figureY;
    g.position.z = near.current * 0.04;

    const targetX = reduce ? 0 : mouse.current.y * 0.07 * p.mouse;
    const targetY = p.figureRotY + (reduce ? 0 : mouse.current.x * 0.12 * p.mouse);
    const ease = 1 - Math.exp(-step * 5);
    look.current.x += (targetX - look.current.x) * ease;
    look.current.y += (targetY - look.current.y) * ease;
    g.rotation.x = look.current.x;
    g.rotation.y = look.current.y;

    if (key.current) key.current.intensity = p.keyLight;
    if (fill.current) fill.current.intensity = p.fillLight;
    if (rimL.current) rimL.current.intensity = p.rimLight;
    if (rimR.current) rimR.current.intensity = p.rimLight * 0.45;
    if (amb.current) amb.current.intensity = p.ambient;
  });

  return (
    <>
      <ambientLight ref={amb} intensity={0.02} color="#c8c4bc" />
      <directionalLight ref={key} position={[-1.1, 2.6, 2.4]} intensity={0.55} color="#fff6ee" />
      <directionalLight ref={fill} position={[1.8, 0.2, 1.4]} intensity={0.06} color="#9aa7b8" />
      <directionalLight ref={rimL} position={[-2.2, 1.6, -2.0]} intensity={2.8} color="#f7f3ea" />
      <directionalLight ref={rimR} position={[2.2, 0.6, -1.4]} intensity={1.2} color="#ffffff" />
      <group ref={group} position={[0, -0.06, 0]}>
        <mesh position={[0, 0.54, 0]} scale={[0.86, 1.04, 0.9]} material={mat}>
          <sphereGeometry args={[0.4, 48, 36]} />
        </mesh>
        <mesh position={[0.335, 0.52, -0.02]} scale={[0.42, 1, 0.72]} material={mat}>
          <sphereGeometry args={[0.09, 16, 12]} />
        </mesh>
        <mesh position={[-0.335, 0.52, -0.02]} scale={[0.42, 1, 0.72]} material={mat}>
          <sphereGeometry args={[0.09, 16, 12]} />
        </mesh>
        <mesh position={[0, 0.16, 0]} material={mat}>
          <cylinderGeometry args={[0.125, 0.155, 0.24, 20]} />
        </mesh>
        <mesh material={mat}>
          <latheGeometry args={[shoulder, 40]} />
        </mesh>
      </group>
    </>
  );
}

type LoopCanvasProps = Shared;

export function LoopCanvas({ paramsRef, mouse, shift, near, reduce }: LoopCanvasProps) {
  const { ref, live } = useLiveGl<HTMLDivElement>('20%', true);

  return (
    <div ref={ref} className="loop-gl" aria-hidden>
      <Canvas
        dpr={[1, 1.25]}
        frameloop={live ? 'always' : 'never'}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'default',
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
        camera={{ position: [0, 0.12, 2.55], fov: 28 }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <TunnelPlane
          paramsRef={paramsRef}
          mouse={mouse}
          shift={shift}
          near={near}
          reduce={reduce}
        />
        <Bust paramsRef={paramsRef} mouse={mouse} near={near} reduce={reduce} />
      </Canvas>
    </div>
  );
}
