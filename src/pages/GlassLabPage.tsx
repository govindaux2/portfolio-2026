import { Suspense, lazy, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useReducedMotion } from 'motion/react';
import { GlassWaitlistButton } from '../components/glass/GlassWaitlistButton';
import { GlassLabControls } from '../components/glass/GlassLabControls';
import { useGlassPointer } from '../components/glass/useGlassPointer';
import {
  GLASS_V2_DEFAULTS,
  type GlassParamsV2,
} from '../components/glass/glassParams';
import './glass-lab.css';

const GlassWaitlistCanvasV2 = lazy(() =>
  import('../components/glass/GlassWaitlistCanvasV2').then((m) => ({
    default: m.GlassWaitlistCanvasV2,
  }))
);

export function GlassLabPage() {
  const scene = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const hover = useRef(0);
  const [params, setParams] = useState<GlassParamsV2>(GLASS_V2_DEFAULTS);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const updateParams = (next: GlassParamsV2) => {
    paramsRef.current = next;
    setParams(next);
  };
  const reduce = useReducedMotion();
  const { mouse, pressed } = useGlassPointer(scene, reduce);

  return (
    <div ref={scene} className="glass-lab">
      <Link to="/" className="glass-lab__back">
        Back to site
      </Link>
      <nav className="glass-lab__versions" aria-label="Lab versions">
        <Link to="/lab/glass/v1">V1</Link>
        <Link to="/lab/glass" aria-current="page">
          V2
        </Link>
      </nav>
      <Suspense fallback={<div className="glass-lab__gl" aria-hidden />}>
        <GlassWaitlistCanvasV2
          mouse={mouse}
          button={button}
          pressed={pressed}
          hover={hover}
          params={paramsRef}
          reduce={reduce}
        />
      </Suspense>
      <div className="glass-lab__stage">
        <GlassWaitlistButton
          ref={button}
          className="gwb--v2"
          style={{ width: params.pillW, height: params.pillH }}
          onPointerEnter={() => {
            hover.current = 1;
          }}
          onPointerLeave={() => {
            hover.current = 0;
          }}
          onPointerDown={() => {
            pressed.current = 1;
          }}
        />
        <p className="glass-lab__note">
          Name a look, save it, then hit Use to put those settings on the button.
        </p>
      </div>
      <GlassLabControls value={params} onChange={updateParams} />
    </div>
  );
}
