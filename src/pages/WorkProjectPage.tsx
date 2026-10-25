import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Nav } from '../components/Nav';
import './work-project.css';

const projects = {
  manufacturing: {
    title: 'Manufacturing Intelligence',
    client: 'QAD',
    image: '/work/manufacturing.jpg?v=8',
    logo: '/logos/qad.svg',
    alt: 'A manufacturing worker holding a tablet and talking with an AI, over a factory traced in red',
    video: 'https://www.youtube-nocookie.com/embed/1OZxW5licUI',
    chapters: [
      {
        name: 'The signal',
        copy: 'Between the signal and the decision. What changed, why it matters, and what to do next — brought to the person on the floor.',
      },
      {
        name: 'Why it matters',
        copy: 'A late part, a line at risk, a promise to a customer. The work is to notice that while there is still time to act.',
      },
      {
        name: 'The next move',
        copy: 'The person on the floor gets a clear next step, not another screen of numbers to hunt through.',
      },
    ],
  },
  nile: {
    title: 'Nile AI Assistant',
    client: 'Nile',
    image: '/work/nile.jpg?v=14',
    logo: '/logos/nile.png',
    alt: 'A smiling engineer looking at a tablet between server racks',
    flip: true,
    chapters: [
      {
        name: 'The question',
        copy: 'A smiling engineer looking at a tablet between server racks.',
      },
      {
        name: 'The answer',
        copy: 'The assistant stays with the work in front of them, instead of sending them off to find a document.',
      },
      {
        name: 'The handoff',
        copy: 'When the answer is enough, the next person can pick it up without starting the search again.',
      },
    ],
  },
  banking: {
    title: 'Small Business Banking on Mobile.',
    client: 'Wells Fargo',
    image: '/work/banking.jpg?v=6',
    logo: '/logos/wells-fargo.svg',
    alt: 'A smiling customer looking at her phone over a banking desk',
    tile: true,
    flip: true,
    chapters: [
      {
        name: 'The task',
        copy: 'A smiling customer looking at her phone over a banking desk.',
      },
      {
        name: 'NDLA',
        image: '/work/banking-ndla.png',
        title: 'New Digital Lending Application',
        role: 'Active design role, 2-week sprint',
        points: [
          'Faster processing for a small-business line of credit, cutting the delay by 3 to 4 days.',
          'A simpler way to fill in the application.',
        ],
        note: 'These screens are refurbished. The real designs are not shown, for NDA reasons.',
      },
      {
        name: 'The confirmation',
        copy: 'She can see what was done, and what is still hers to decide, before she leaves the screen.',
      },
    ],
  },
} as const;

type ProjectSlug = keyof typeof projects;
type Layout = { order: string[]; hidden: string[] };

function readLayout(slug: string, names: readonly string[]): Layout {
  const fallback = { order: [...names], hidden: [] as string[] };
  try {
    const raw = localStorage.getItem(`work.sections.v1.${slug}`);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<Layout>;
    const known = new Set<string>(names);
    const order = (parsed.order ?? []).filter((name): name is string => known.has(name));
    for (const name of names) if (!order.includes(name)) order.push(name);
    let hidden = (parsed.hidden ?? []).filter((name): name is string => known.has(name));
    if (hidden.length >= order.length) hidden = [];
    return { order, hidden };
  } catch {
    return fallback;
  }
}

export function WorkProjectPage() {
  const { slug } = useParams();
  const stageRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const playRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const jumping = useRef(false);
  const layoutRef = useRef<Layout>({ order: [], hidden: [] });
  const dragName = useRef<string | null>(null);
  const project = slug && slug in projects ? projects[slug as ProjectSlug] : null;
  const video = project && 'video' in project ? project.video : null;
  const names = project ? project.chapters.map((chapter) => chapter.name) : [];
  const [videoOpen, setVideoOpen] = useState(false);
  const [activeName, setActiveName] = useState<string>(() => names[0] ?? '');
  const [layout, setLayout] = useState<Layout>(() => (slug ? readLayout(slug, names) : { order: [], hidden: [] }));
  const [sectionsOpen, setSectionsOpen] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  layoutRef.current = layout;

  const visible = (() => {
    if (!project) return [];
    const byName = new Map<string, (typeof project.chapters)[number]>(
      project.chapters.map((chapter) => [chapter.name, chapter]),
    );
    const known = new Set<string>(names);
    const order = layout.order.filter((name) => known.has(name));
    const source = order.length === names.length ? order : names;
    return source.flatMap((name) => {
      if (layout.hidden.includes(name)) return [];
      const chapter = byName.get(name);
      return chapter ? [chapter] : [];
    });
  })();
  const visibleKey = visible.map((chapter) => chapter.name).join('|');
  const active = Math.max(
    0,
    visible.findIndex((chapter) => chapter.name === activeName),
  );

  useEffect(() => {
    if (!project || !slug) return;
    setVideoOpen(false);
    setSectionsOpen(false);
    const nextNames = project.chapters.map((chapter) => chapter.name);
    setLayout(readLayout(slug, nextNames));
    setActiveName(nextNames[0]);
    railRef.current?.scrollTo({ top: 0 });
  }, [slug, project]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || !project) return;
    const sync = () => {
      if (jumping.current) return;
      const nodes = [...rail.querySelectorAll<HTMLElement>('[data-chapter]')];
      if (!nodes.length) return;
      const mid = rail.getBoundingClientRect().top + rail.clientHeight / 2;
      let current = nodes[0];
      for (const node of nodes) {
        if (node.getBoundingClientRect().top <= mid) current = node;
        else break;
      }
      const name = current.dataset.chapter ?? '';
      setActiveName((prev) => (prev === name ? prev : name));
    };
    sync();
    rail.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    return () => {
      rail.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, [project, visibleKey]);

  useEffect(() => {
    const stage = stageRef.current;
    const rail = railRef.current;
    if (!stage || !rail) return;
    const onWheel = (event: WheelEvent) => {
      if (event.deltaY === 0) return;
      rail.scrollBy({ top: event.deltaY });
      event.preventDefault();
    };
    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, [project]);

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
    if (!sectionsOpen || videoOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSectionsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sectionsOpen, videoOpen]);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce.matches) return;
    const node = pageRef.current;
    if (!node) return;
    const onMove = (event: PointerEvent) => {
      node.style.setProperty('--px', (event.clientX / window.innerWidth - 0.5).toFixed(3));
      node.style.setProperty('--py', (event.clientY / window.innerHeight - 0.5).toFixed(3));
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  const saveLayout = (next: Layout) => {
    setLayout(next);
    if (!slug) return;
    try {
      localStorage.setItem(`work.sections.v1.${slug}`, JSON.stringify(next));
    } catch {
      /* keep the change for this visit */
    }
  };

  const placeSection = (from: string, to: string) => {
    const current = layoutRef.current;
    const order = [...current.order];
    const fromIndex = order.indexOf(from);
    const toIndex = order.indexOf(to);
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
    order.splice(fromIndex, 1);
    order.splice(toIndex, 0, from);
    const next = { ...current, order };
    layoutRef.current = next;
    saveLayout(next);
  };

  const onSectionPointerDown = (event: ReactPointerEvent<HTMLUListElement>) => {
    const row = (event.target as HTMLElement).closest<HTMLElement>('[data-section]');
    if (!row || (event.target as HTMLElement).closest('button') || event.button !== 0) return;
    dragName.current = row.dataset.section ?? null;
    setDragging(dragName.current);
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* the drag still follows the pointer inside the list */
    }
  };

  const onSectionPointerMove = (event: ReactPointerEvent<HTMLUListElement>) => {
    const from = dragName.current;
    if (!from) return;
    const rows = [...event.currentTarget.querySelectorAll<HTMLElement>('[data-section]')];
    const fromIndex = rows.findIndex((row) => row.dataset.section === from);
    if (fromIndex < 0) return;
    let next = fromIndex;
    rows.forEach((row, index) => {
      const box = row.getBoundingClientRect();
      const mid = box.top + box.height / 2;
      if (index > fromIndex && event.clientY > mid) next = index;
      if (index < fromIndex && event.clientY < mid) next = Math.min(next, index);
    });
    const target = rows[next]?.dataset.section;
    if (target) placeSection(from, target);
  };

  const endSectionDrag = (event: ReactPointerEvent<HTMLUListElement>) => {
    if (!dragName.current) return;
    dragName.current = null;
    setDragging(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const hideSection = (name: string) => {
    const hidden = layout.hidden.includes(name)
      ? layout.hidden.filter((item) => item !== name)
      : [...layout.hidden, name];
    if (hidden.length >= layout.order.length) return;
    saveLayout({ ...layout, hidden });
    if (hidden.includes(activeName)) {
      const still = layout.order.find((item) => !hidden.includes(item));
      if (still) setActiveName(still);
    }
  };

  const jump = (index: number) => {
    const chapter = visible[index];
    const rail = railRef.current;
    const section = chapter ? rail?.querySelector<HTMLElement>(`[data-chapter="${CSS.escape(chapter.name)}"]`) : null;
    if (!rail || !section || !chapter) return;
    jumping.current = true;
    setActiveName(chapter.name);
    rail.scrollTop = section.offsetTop;
    window.setTimeout(() => {
      jumping.current = false;
    }, 80);
  };

  if (!project) return <Navigate to="/" replace />;

  return (
    <div className="work-project" ref={pageRef}>
      <Nav variant="inner" />
      <div className="work-project-stage" ref={stageRef}>
        <div className="work-project-reel">
          {visible.map((chapter, index) => {
            const cover = chapter.name === project.chapters[0].name;
            return (
              <div className={index === active ? 'work-project-scene is-on' : 'work-project-scene'} key={chapter.name}>
                {'image' in chapter ? (
                  <img className="work-project-board" src={chapter.image} alt="" />
                ) : cover ? (
                  <>
                    <div className="work-project-shift">
                      <div className={'flip' in project ? 'work-project-frame is-flip' : 'work-project-frame'}>
                        <img className="work-project-still" src={project.image} alt={project.alt} />
                      </div>
                    </div>
                    <h1>{project.title}</h1>
                    {video && (
                      <button
                        ref={playRef}
                        type="button"
                        className="work-project-play"
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
                  </>
                ) : (
                  <>
                    <div className="work-project-shift">
                      <div className={'flip' in project ? 'work-project-frame is-flip' : 'work-project-frame'}>
                        <img className="work-project-still" src={project.image} alt="" />
                      </div>
                    </div>
                    <p className="work-project-scene-label">{chapter.name}</p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <aside className="work-project-rail">
        <div className="work-project-rail-head">
          <p className="work-project-kicker">Recent work</p>
          <p className={'tile' in project ? 'work-project-client is-tile' : 'work-project-client'}>
            <img src={project.logo} alt={project.client === 'QAD' ? project.client : ''} />
            {project.client !== 'QAD' && <span>{project.client}</span>}
          </p>
        </div>
        <div className="work-project-rail-scroll" ref={railRef}>
          {visible.map((chapter) => (
            <section className="work-project-section" data-chapter={chapter.name} key={chapter.name}>
              <h2>{chapter.name}</h2>
              {'title' in chapter ? (
                <>
                  <p className="work-project-section-title">{chapter.title}</p>
                  <p className="work-project-section-role">{chapter.role}</p>
                  <p className="work-project-section-label">Objectives</p>
                  <ul>
                    {chapter.points.map((point, pointIndex) => (
                      <li className={pointIndex === 0 ? 'is-lead' : undefined} key={point}>
                        {point}
                      </li>
                    ))}
                  </ul>
                  <p className="work-project-section-note">{chapter.note}</p>
                </>
              ) : (
                <p>{chapter.copy}</p>
              )}
            </section>
          ))}
        </div>
        <nav className="work-project-dots" aria-label="Project sections">
          {visible.map((chapter, index) => (
            <button
              key={chapter.name}
              type="button"
              className={index === active ? 'is-active' : undefined}
              aria-current={index === active ? 'true' : undefined}
              aria-label={chapter.name}
              onClick={() => jump(index)}
            >
              <span className="work-project-dot" />
              <span className="work-project-dot-tip">{chapter.name}</span>
            </button>
          ))}
        </nav>
        <div className={sectionsOpen ? 'work-sections is-open' : 'work-sections'}>
          {sectionsOpen && (
            <div className="work-sections-panel" role="dialog" aria-label="Arrange sections">
              <p className="work-sections-label">Sections</p>
              <ul
                onPointerDown={onSectionPointerDown}
                onPointerMove={onSectionPointerMove}
                onPointerUp={endSectionDrag}
                onPointerCancel={endSectionDrag}
              >
                {layout.order.map((name) => {
                  const hidden = layout.hidden.includes(name);
                  const rowClass = [
                    hidden ? 'is-hidden' : '',
                    dragging === name ? 'is-dragging' : '',
                  ]
                    .filter(Boolean)
                    .join(' ');
                  return (
                    <li
                      key={name}
                      data-section={name}
                      className={rowClass || undefined}
                      tabIndex={0}
                      aria-label={name}
                      onKeyDown={(event) => {
                        if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
                        event.preventDefault();
                        const index = layout.order.indexOf(name);
                        const next = index + (event.key === 'ArrowUp' ? -1 : 1);
                        const target = layout.order[next];
                        if (target) placeSection(name, target);
                      }}
                    >
                      <span className="work-sections-grip" aria-hidden="true">
                        <svg viewBox="0 0 10 14">
                          <circle cx="2" cy="2" r="1.15" fill="currentColor" />
                          <circle cx="8" cy="2" r="1.15" fill="currentColor" />
                          <circle cx="2" cy="7" r="1.15" fill="currentColor" />
                          <circle cx="8" cy="7" r="1.15" fill="currentColor" />
                          <circle cx="2" cy="12" r="1.15" fill="currentColor" />
                          <circle cx="8" cy="12" r="1.15" fill="currentColor" />
                        </svg>
                      </span>
                      <span>{name}</span>
                      <button
                        type="button"
                        className="work-sections-hide"
                        aria-label={hidden ? `Show ${name}` : `Hide ${name}`}
                        aria-pressed={hidden}
                        disabled={!hidden && visible.length <= 1}
                        onClick={() => hideSection(name)}
                      >
                        <svg viewBox="0 0 20 20" aria-hidden="true">
                          {hidden ? (
                            <>
                              <path
                                d="M3.2 4.2 16.8 16.2"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                              <path
                                d="M8 6.2A8 8 0 0 1 10 5.6c3.4 0 5.8 2.4 7.2 4.4.2.4.2.8 0 1.2-.6.9-1.4 1.8-2.4 2.5M4.6 7.6C3.4 8.6 2.6 9.8 2.2 10.4c-.2.4-.2.8 0 1.2C3.6 13.6 6 16 10 16c.8 0 1.6-.1 2.3-.4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                              <circle cx="10" cy="10.2" r="1.7" fill="none" stroke="currentColor" strokeWidth="1.5" />
                            </>
                          ) : (
                            <>
                              <path
                                d="M2.2 10S5 5.2 10 5.2 17.8 10 17.8 10 15 14.8 10 14.8 2.2 10 2.2 10Z"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinejoin="round"
                              />
                              <circle cx="10" cy="10" r="2.1" fill="none" stroke="currentColor" strokeWidth="1.5" />
                            </>
                          )}
                        </svg>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <button
            type="button"
            className="work-sections-toggle"
            aria-expanded={sectionsOpen}
            aria-label={sectionsOpen ? 'Close section controls' : 'Arrange sections'}
            onClick={() => setSectionsOpen((open) => !open)}
          >
            <svg viewBox="0 0 20 20" aria-hidden="true">
              {sectionsOpen ? (
                <path d="M5.2 5.2 14.8 14.8M14.8 5.2 5.2 14.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              ) : (
                <path d="M4.5 6.5h11M4.5 10h11M4.5 13.5h11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </aside>
      {videoOpen && video && (
        <div
          className="work-project-player"
          role="dialog"
          aria-modal="true"
          aria-label={`${project.title} video`}
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
              src={`${video}?autoplay=1&rel=0&playsinline=1`}
              title={`${project.title} video`}
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </div>
      )}
    </div>
  );
}
