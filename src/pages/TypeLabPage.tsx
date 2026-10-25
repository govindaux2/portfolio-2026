import { useEffect, useState } from 'react';
import { Nav } from '../components/Nav';
import './type-lab.css';

type FontId = 'editorial' | 'literary' | 'studio';
type ThemeId = 'dark' | 'light';
type SlideId = 'name' | 'essay' | 'manufacturing' | 'nile' | 'banking';

const fonts: { id: FontId; name: string; note: string }[] = [
  { id: 'editorial', name: 'Editorial', note: 'Crimson Pro + DM Sans' },
  { id: 'literary', name: 'Literary', note: 'Newsreader + Outfit' },
  { id: 'studio', name: 'Studio', note: 'Bricolage Grotesque' },
];

const works = [
  {
    id: 'manufacturing' as const,
    title: 'Manufacturing Intelligence',
    image: '/work/manufacturing.jpg?v=8',
    alt: 'A manufacturing worker holding a tablet in a factory',
  },
  {
    id: 'nile' as const,
    title: 'Nile AI Assistant',
    image: '/work/nile.jpg?v=14',
    alt: 'An engineer looking at a tablet between server racks',
  },
  {
    id: 'banking' as const,
    title: 'Small Business Banking on Mobile.',
    image: '/work/banking.jpg?v=6',
    alt: 'A customer looking at her phone over a desk',
  },
];

const slides: SlideId[] = ['name', 'essay', 'manufacturing', 'nile', 'banking'];

export function TypeLabPage() {
  const [font, setFont] = useState<FontId>('editorial');
  const [theme, setTheme] = useState<ThemeId>('dark');
  const [slide, setSlide] = useState<SlideId>('name');
  const [open, setOpen] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('lab.type.v1');
    if (saved) {
      try {
        const data = JSON.parse(saved) as { font?: FontId; theme?: ThemeId };
        if (data.font) setFont(data.font);
        if (data.theme) setTheme(data.theme);
      } catch {
        /* keep defaults */
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem('lab.type.v1', JSON.stringify({ font, theme }));
  }, [font, theme, ready]);

  const index = slides.indexOf(slide);

  return (
    <div className="type-lab" data-font={font} data-theme={theme}>
      <Nav variant="inner" />
      <div className="type-stage" aria-hidden="true">
        <div className="type-track" style={{ transform: `translateX(-${index * 20}%)` }}>
          <section className="type-panel type-panel-name">
            <p className="type-kicker">AI-first · 6 years exp</p>
            <h1>Govinda</h1>
            <p className="type-role">Product Design Lead</p>
          </section>
          <section className="type-panel type-panel-essay">
            <h2>
              Here’s my take on <em>what businesses want today</em> after designing{' '}
              <em>4 purpose-built AI products</em> for fast moving clients, in different industries.
            </h2>
            <p>
              Working prototypes that aim to deliver true impact, with great care for design-system
              guardrails, handed to engineering in days, not weeks.
            </p>
          </section>
          {works.map((work) => (
            <section className="type-panel type-panel-work" key={work.id}>
              <img src={work.image} alt={work.alt} />
              <h2>{work.title}</h2>
            </section>
          ))}
        </div>
      </div>

      <aside className="type-rail" aria-label="Portfolio">
        <button
          type="button"
          className={slide === 'name' ? 'is-on' : ''}
          onClick={() => setSlide('name')}
        >
          <span className="type-rail-kicker">Name</span>
          <strong>Govinda</strong>
          <span>Product Design Lead · Divami, Hyderabad</span>
        </button>
        <button
          type="button"
          className={slide === 'essay' ? 'is-on' : ''}
          onClick={() => setSlide('essay')}
        >
          <span className="type-rail-kicker">Write-up</span>
          <strong>Here’s my take on what businesses want today</strong>
          <span>4 purpose-built AI products for fast moving clients.</span>
        </button>
        <div className="type-rail-works">
          <p className="type-rail-kicker">My recent work</p>
          {works.map((work) => (
            <button
              key={work.id}
              type="button"
              className={slide === work.id ? 'is-on' : ''}
              onClick={() => setSlide(work.id)}
            >
              <img src={work.image} alt="" />
              <strong>{work.title}</strong>
            </button>
          ))}
        </div>
      </aside>

      <div className={`type-widget${open ? ' is-open' : ''}`}>
        {open ? (
          <div className="type-widget-panel" role="dialog" aria-label="Type options">
            <p>Font</p>
            {fonts.map((item) => (
              <button
                key={item.id}
                type="button"
                className={font === item.id ? 'is-on' : ''}
                onClick={() => setFont(item.id)}
              >
                <strong>{item.name}</strong>
                <span>{item.note}</span>
              </button>
            ))}
            <p>Theme</p>
            <div className="type-widget-themes">
              <button type="button" className={theme === 'dark' ? 'is-on' : ''} onClick={() => setTheme('dark')}>
                Dark
              </button>
              <button type="button" className={theme === 'light' ? 'is-on' : ''} onClick={() => setTheme('light')}>
                Light
              </button>
            </div>
            <button type="button" className="type-widget-close" onClick={() => setOpen(false)} aria-label="Collapse options">
              Close
            </button>
          </div>
        ) : (
          <button type="button" className="type-widget-dot" onClick={() => setOpen(true)} aria-label="Type options">
            Aa
          </button>
        )}
      </div>
    </div>
  );
}
