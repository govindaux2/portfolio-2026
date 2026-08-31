import { useMemo, useRef, useState } from 'react';
import {
  Chrome,
  FilmGrain,
  LinearGradient,
  Shader,
  isWebGPUSupported,
} from 'shaders/react';
import { useInView } from '../useInView';
import { SteelControls } from './SteelControls';
import { STEEL_DEFAULTS, steelShape, type SteelParams } from './steelParams';

function wrapDeg(n: number) {
  return ((((n + 180) % 360) + 360) % 360) - 180;
}

/** Stainless Steel 1 recreation via public Chrome + FilmGrain. */
export default function ThreeStage() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [params, setParams] = useState<SteelParams>(STEEL_DEFAULTS);
  const [open, setOpen] = useState(true);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; rotX: number; rotY: number } | null>(
    null
  );
  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gpu = useMemo(() => isWebGPUSupported(), []);

  const drawn: SteelParams = {
    ...params,
    rotX: wrapDeg(params.rotX + tilt.x),
    rotY: wrapDeg(params.rotY + tilt.y),
    rotation: (params.rotation + params.seed * 2.15) % 360,
    envRotation: (params.envRotation + params.seed * 11.3) % 360,
  };
  const rotY =
    !reduce && params.autoRotate > 0
      ? {
          type: 'auto-animate',
          mode: 'loop' as const,
          outputMin: -180,
          outputMax: 180,
          speed: params.autoRotate,
        }
      : drawn.rotY;
  const shape = steelShape(drawn, rotY);

  return (
    <div
      ref={ref}
      className="three-stage"
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest('.steel-controls')) return;
        (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
        drag.current = {
          x: e.clientX,
          y: e.clientY,
          rotX: params.rotX,
          rotY: params.rotY,
        };
      }}
      onPointerMove={(e) => {
        if (drag.current) {
          const dx = e.clientX - drag.current.x;
          const dy = e.clientY - drag.current.y;
          setParams((p) => ({
            ...p,
            rotY: wrapDeg(drag.current!.rotY + dx * 0.45),
            rotX: wrapDeg(drag.current!.rotX + dy * 0.35),
          }));
          return;
        }
        if (!params.followPointer) return;
        const box = e.currentTarget.getBoundingClientRect();
        const nx = (e.clientX - box.left) / box.width - 0.5;
        const ny = (e.clientY - box.top) / box.height - 0.5;
        setTilt({ y: nx * 38, x: ny * 28 });
      }}
      onPointerUp={() => {
        drag.current = null;
      }}
      onPointerLeave={() => {
        drag.current = null;
        setTilt({ x: 0, y: 0 });
      }}
    >
      {gpu && inView ? (
        <Shader className="three-stage-shader">
          <FilmGrain
            strength={params.grain}
            bias={params.grainBias}
            animated={params.grainAnimated && !reduce}
          >
            <LinearGradient
              colorA="#141416"
              colorB="#08080a"
              start={{ x: 0.5, y: 0.28 }}
              end={{ x: 0.5, y: 1 }}
            />
            <Chrome
              tint={drawn.tint}
              warmColor={drawn.warmColor}
              coolColor={drawn.coolColor}
              scale={drawn.scale}
              rotation={drawn.rotation}
              bevelWidth={drawn.bevelWidth}
              bevelShape={drawn.bevelShape}
              curvature={drawn.curvature}
              waviness={drawn.waviness}
              environment={drawn.environment}
              envRotation={drawn.envRotation}
              softness={drawn.softness}
              spectral={drawn.spectral}
              dispersion={drawn.dispersion}
              shadows={drawn.shadows}
              speed={reduce ? 0 : drawn.speed}
              edgeSoftness={drawn.edgeSoftness}
              shape={shape}
            />
          </FilmGrain>
        </Shader>
      ) : (
        <p className="three-stage-fallback">
          {gpu ? '' : 'WebGPU is required for this steel shader.'}
        </p>
      )}
      <SteelControls
        value={params}
        onChange={setParams}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  );
}
