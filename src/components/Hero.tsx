import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { heroFrag } from './gl/shaders';
import '../pages/work-project.css';

const ShaderPlane = lazy(() => import('./gl/ShaderPlane'));

const employers = [
  { name: 'Divami', src: '/logos/divami.svg', light: '/logos/divami-light.svg' },
  { name: 'Wells Fargo', src: '/logos/wells-fargo.svg', tile: true },
  { name: 'Neudesic, IBM', src: '/logos/neudesic-ibm.svg', light: '/logos/neudesic-ibm-light.svg' },
  { name: 'Trelleborg', src: '/logos/trelleborg.svg', light: '/logos/trelleborg-light.svg' },
  { name: 'EntLogics', src: '/logos/entlogics.svg', light: '/logos/entlogics-light.svg' },
  { name: 'QAD', src: '/logos/qad.svg' },
  { name: 'SSP Worldwide', src: '/logos/ssp.svg', light: '/logos/ssp-light.svg' },
  { name: 'Nile', src: '/logos/nile.png' },
] as const;

function EmployerMarks({ hidden = false, light = false }: { hidden?: boolean; light?: boolean }) {
  return (
    <ul aria-hidden={hidden || undefined}>
      {employers.map((company) => (
        <li key={company.name}>
          <img
            className={'tile' in company ? 'is-tile' : undefined}
            src={light && 'light' in company ? company.light : company.src}
            alt={hidden ? '' : company.name}
          />
          <span className="hero-logo-tip">{company.name}</span>
        </li>
      ))}
    </ul>
  );
}

const projects = [
  {
    name: 'Manufacturing Intelligence',
    lines: ['Manufacturing', 'Intelligence'],
    image: '/work/manufacturing.jpg?v=8',
    alt: 'A manufacturing worker holding a tablet and talking with an AI, over a factory traced in red',
    logo: '/logos/qad.svg',
    logoAlt: 'QAD',
    to: '/work/manufacturing',
    video: 'https://www.youtube-nocookie.com/embed/1OZxW5licUI',
  },
  {
    name: 'Nile AI Assistant',
    lines: ['Nile AI', 'Assistant'],
    image: '/work/nile.jpg?v=14',
    alt: 'A smiling engineer looking at a tablet between server racks',
    logo: '/logos/nile.png',
    logoAlt: 'Nile',
    compact: true,
    flip: true,
    to: '/work/nile',
  },
  {
    name: 'Small Business Banking on Mobile.',
    lines: ['Small Business', 'Banking on Mobile.'],
    image: '/work/banking.jpg?v=6',
    alt: 'A smiling customer looking at her phone over a banking desk',
    logo: '/logos/wells-fargo.svg',
    logoAlt: 'Wells Fargo',
    tile: true,
    flip: true,
    to: '/work/banking',
  },
] as const;

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const logosRef = useRef<HTMLDivElement>(null);
  const playRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const [videoOpen, setVideoOpen] = useState(false);
  const [light, setLight] = useState(
    () => document.documentElement.dataset.theme === 'light',
  );

  useEffect(() => {
    const el = document.documentElement;
    const sync = () => setLight(el.dataset.theme === 'light');
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(el, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!videoOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setVideoOpen(false);
      playRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [videoOpen]);

  useEffect(() => {
    const box = logosRef.current;
    if (!box) return;
    const track = box.querySelector<HTMLElement>('.hero-logos-track');
    const items = [...box.querySelectorAll<HTMLElement>('li')];
    if (!track || items.length === 0) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let centers: number[] = [];
    let width = 0;
    let frame = 0;
    let running = false;

    const measure = () => {
      width = box.clientWidth;
      centers = items.map((item) => item.offsetLeft + item.offsetWidth / 2);
    };

    const paint = () => {
      const shift = new DOMMatrix(getComputedStyle(track).transform).m41;
      const half = width / 2 || 1;
      items.forEach((item, index) => {
        const img = item.querySelector('img');
        if (!img) return;
        const x = centers[index] + shift;
        const dist = Math.abs(x - half) / half;
        const t = Math.min(1, Math.max(0, (dist - 0.22) / 0.78));
        img.style.setProperty('--logo-s', (1 - t * 0.32).toFixed(3));
        img.style.setProperty('--logo-o', (1 - t * 0.55).toFixed(3));
        img.style.setProperty('--logo-origin', x < half ? 'right' : 'left');
      });
    };

    const tick = () => {
      if (!running) return;
      paint();
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (reduce.matches || document.hidden) return;
      if (running) return;
      running = true;
      frame = requestAnimationFrame(tick);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    measure();
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) start();
      else stop();
    });
    observer.observe(box);
    const onResize = () => measure();
    const onHide = () => {
      if (document.hidden) stop();
      else start();
    };
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onHide);
    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onHide);
    };
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      mouse.current.x = x;
      mouse.current.y = y;
      const node = root.current;
      if (!node) return;
      node.style.setProperty('--px', x.toFixed(3));
      node.style.setProperty('--py', y.toFixed(3));
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <section ref={root} className="hero" id="top">
      <div className="hero-veil" aria-hidden="true">
        <Suspense fallback={null}>
          <ShaderPlane frag={heroFrag} className="hero-gl" mouse={mouse} dpr={[1, 1.25]} />
        </Suspense>
        <div className="hero-fade" />
      </div>

      <div className="hero-split">
        <div className="hero-id">
          <div className="hero-id-copy">
            <h1>
              <span className="line">
                <span>Govinda</span>
              </span>
            </h1>
            <p className="hero-bio">
              <span className="hero-years">AI-first | 6 years exp</span>
              <span className="hit">Product Design Lead</span>
              <span className="hero-domains">At Divami Design Labs, Hyderabad.</span>
              <span className="hero-domains hero-domains--quiet">
                Banking, Fintech, Manufacturing, Ed‑tech, and Enterprise platforms.
              </span>
            </p>
            <div className="hero-logos" ref={logosRef}>
              <div className="hero-logos-track">
                <EmployerMarks light={light} />
                <EmployerMarks hidden light={light} />
              </div>
            </div>
          </div>
        </div>

        <div className="hero-learn">
          <div className="hero-learn-inner">
            <h2>
              <span className="hero-lead">
                Here’s my take on <span className="hero-em">what businesses want today</span>
              </span>
              <span className="hero-sub">
                After designing <b>4 purpose-built AI products</b> for fast-moving clients from
                different industries, in the past 6 months, they need —
              </span>
            </h2>
            <div className="hero-essay">
              <p>
                <span className="hero-sentence" style={{ animationDelay: '0.22s' }}>
                  Working prototypes that aim to deliver true impact, with great care for
                  design-system guardrails, the best UX patterns and practices, all baked in, super
                  fast, and handed to engineering in days, not weeks.{' '}
                </span>
                <span className="hero-sentence" style={{ animationDelay: '0.4s' }}>
                  Product partners don’t want to see a fancy screen or a quick tour of the flow in
                  static screens.{' '}
                </span>
                <span className="hero-sentence" style={{ animationDelay: '0.58s' }}>
                  They want the idea working, so engineering can talk clearly, customers can test it,
                  and the team can ship with more confidence.
                </span>
              </p>
              <p>
                <span className="hero-sentence" style={{ animationDelay: '0.74s' }}>
                  <span className="hero-aside">“Tell me more”</span> was the old courtesy.{' '}
                </span>
                <span className="hero-sentence" style={{ animationDelay: '0.9s' }}>
                  The line I keep hearing is simple.{' '}
                </span>
                <span className="hero-sentence" style={{ animationDelay: '1.04s' }}>
                  <span className="hero-now">“Show me now.”</span>{' '}
                </span>
                <span className="hero-sentence" style={{ animationDelay: '1.18s' }}>
                  Agentic work doesn’t wait that long.{' '}
                </span>
                <span className="hero-sentence" style={{ animationDelay: '1.34s' }}>
                  I put something they can try on the table, see what holds, and ship it before the
                  chance slips.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="hero-work" aria-labelledby="recent-work">
        <div className="hero-work-in">
        <h3 id="recent-work">My Recent Work</h3>
          <ul className="hero-cards">
            {projects.map((project, index) => (
              <li key={project.name}>
                <Link to={project.to} className="hero-card">
                  <img
                    className={[
                      'hero-card-photo',
                      'flip' in project && 'is-flip',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    src={project.image}
                    alt={project.alt}
                  />
                  <div className="hero-card-copy">
                    <h4 className="hero-card-title">
                      <span>{project.lines[0]}</span>
                      <span className="hero-card-title-last">
                        {project.lines[1]}
                        <span className="hero-card-arrow" aria-hidden="true">
                          <svg viewBox="0 0 16 16" width="14" height="14">
                            <path
                              d="M2.5 8h10M8.5 4.25 12.75 8 8.5 11.75"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </span>
                    </h4>
                  </div>
                  {index < projects.length - 1 && (
                    <span className="hero-card-ai" aria-hidden="true">
                      <svg viewBox="0 0 16 16" aria-hidden="true">
                        <path
                          d="M8 1.1 9.15 6.15 14.2 7.3 9.15 8.45 8 13.5 6.85 8.45 1.8 7.3 6.85 6.15Z"
                          fill="currentColor"
                        />
                      </svg>
                      AI
                    </span>
                  )}
                  <span className="hero-card-mark">
                    <img
                      className={[
                        'hero-card-logo',
                        'tile' in project && 'is-tile',
                        'compact' in project && 'is-compact',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      src={project.logo}
                      alt={project.logoAlt}
                    />
                  </span>
                </Link>
                {'video' in project && (
                  <button
                    ref={playRef}
                    type="button"
                    className="work-project-play hero-card-play"
                    onClick={() => setVideoOpen(true)}
                  >
                    <span className="work-project-play-mark">
                      <svg viewBox="0 0 20 20" aria-hidden="true">
                        <path
                          d="M6.2 4.4 15.4 10 6.2 15.6Z"
                          fill="currentColor"
                          stroke="currentColor"
                          strokeWidth="2.6"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    <span className="work-project-play-label">
                      <span className="work-project-play-shine">Play demo video</span>
                    </span>
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>
      {videoOpen &&
        createPortal(
          <div
            className="work-project-player"
            role="dialog"
            aria-modal="true"
            aria-label="Manufacturing Intelligence video"
            onClick={() => {
              setVideoOpen(false);
              playRef.current?.focus();
            }}
          >
            <button
              ref={closeRef}
              type="button"
              className="work-project-player-close"
              aria-label="Close video"
              onClick={(event) => {
                event.stopPropagation();
                setVideoOpen(false);
                playRef.current?.focus();
              }}
            >
              Close
            </button>
            <div className="work-project-player-frame" onClick={(event) => event.stopPropagation()}>
              <iframe
                src={`${projects[0].video}?autoplay=1&rel=0&playsinline=1`}
                title="Manufacturing Intelligence video"
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}
