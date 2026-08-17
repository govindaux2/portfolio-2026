import { Suspense, lazy, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useReducedMotion } from 'motion/react';
import { GlassWaitlistButton } from '../components/glass/GlassWaitlistButton';
import { useGlassPointer } from '../components/glass/useGlassPointer';
import './glass-lab.css';

const GlassWaitlistCanvas = lazy(() =>
  import('../components/glass/GlassWaitlistCanvas').then((m) => ({
    default: m.GlassWaitlistCanvas,
  }))
);

export function GlassLabV1Page() {
  const scene = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();
  const { mouse, pressed } = useGlassPointer(scene, reduce);

  return (
    <div ref={scene} className="glass-lab">
      <Link to="/" className="glass-lab__back">
        Back to site
      </Link>
      <nav className="glass-lab__versions" aria-label="Lab versions">
        <Link to="/lab/glass/v1" aria-current="page">
          V1
        </Link>
        <Link to="/lab/glass">V2</Link>
      </nav>
      <Suspense fallback={<div className="glass-lab__gl" aria-hidden />}>
        <GlassWaitlistCanvas
          mouse={mouse}
          button={button}
          pressed={pressed}
          reduce={reduce}
        />
      </Suspense>
      <div className="glass-lab__stage">
        <GlassWaitlistButton
          ref={button}
          onPointerDown={() => {
            pressed.current = 1;
          }}
        />
        <p className="glass-lab__note">
          V1 snapshot. One shader light, no controls.
        </p>
      </div>
    </div>
  );
}
