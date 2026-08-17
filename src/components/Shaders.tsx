import { Suspense, lazy, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ribbonFrag, orbFrag, gridFrag } from './gl/shaders';

const ShaderPlane = lazy(() => import('./gl/ShaderPlane'));

gsap.registerPlugin(useGSAP, ScrollTrigger);

const pieces = [
  { name: 'Ribbon field', usedIn: 'App onboarding background', frag: ribbonFrag },
  { name: 'Signal orb', usedIn: 'Voice assistant state', frag: orbFrag },
  { name: 'Warp grid', usedIn: 'Website hero texture', frag: gridFrag },
];

export function Shaders() {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!wrap.current || !track.current) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: '(min-width: 768px)',
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { isDesktop, reduceMotion } = context.conditions ?? {};
          if (!isDesktop || reduceMotion || !track.current) return;

          const distance = () =>
            Math.max(0, track.current!.scrollWidth - window.innerWidth);

          gsap.to(track.current, {
            x: () => -distance(),
            ease: 'none',
            scrollTrigger: {
              trigger: wrap.current,
              start: 'top top',
              end: () => `+=${distance()}`,
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true,
            },
          });
        },
        wrap.current
      );

      return () => mm.revert();
    },
    { scope: wrap }
  );

  return (
    <section className="shaders" id="shaders">
      <div ref={wrap} className="shaders-pin">
        <div ref={track} className="shaders-track">
          <div className="shaders-intro">
            <h2>Live shaders</h2>
            <p>
              GLSL running right here, not video captures. Built for app
              backgrounds, state indicators, and website textures.
            </p>
          </div>
          {pieces.map((s) => (
            <figure key={s.name} className="shader-tile">
              <Suspense fallback={<div className="gl" />}>
                <ShaderPlane frag={s.frag} className="gl" />
              </Suspense>
              <figcaption>
                <strong>{s.name}</strong>
                <span>{s.usedIn}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
