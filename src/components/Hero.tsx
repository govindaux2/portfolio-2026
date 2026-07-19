import { Suspense, lazy, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { heroFrag } from './gl/shaders';

const ShaderPlane = lazy(() => import('./gl/ShaderPlane'));

const reduced = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.x = e.clientX / window.innerWidth - 0.5;
      mouse.current.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useGSAP(
    () => {
      if (reduced()) return;
      gsap.from('.hero h1 .line > span', {
        yPercent: 110,
        duration: 1.1,
        stagger: 0.09,
        ease: 'power4.out',
        delay: 0.15,
      });
      gsap.from('.hero-sub, .hero-cta', {
        opacity: 0,
        y: 18,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
        delay: 0.55,
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="hero" id="top">
      <Suspense fallback={null}>
        <ShaderPlane frag={heroFrag} className="hero-gl" mouse={mouse} />
      </Suspense>
      <div className="hero-fade" />
      <div className="wrap hero-content">
        <h1>
          <span className="line">
            <span>Prototypes, shaders</span>
          </span>
          <span className="line">
            <span>and 3D for apps</span>
          </span>
          <span className="line">
            <span>people can feel.</span>
          </span>
        </h1>
        <p className="hero-sub">
          I design and build interactive work: clickable app prototypes, real-time
          shaders, and 3D scenes for products and websites.
        </p>
        <a className="hero-cta" href="#prototypes">
          View the work
        </a>
      </div>
    </section>
  );
}
