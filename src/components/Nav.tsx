import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

type NavProps = {
  variant?: 'home' | 'inner';
};

type NavLink =
  | { to: string; label: string }
  | { hash: string; label: string };

const links: NavLink[] = [
  { to: '/work/manufacturing', label: 'Manufacturing Intelligence' },
  { to: '/work/nile', label: 'Nile AI Assistant' },
  { to: '/work/banking', label: 'Small Business Banking' },
];

type Theme = 'dark' | 'light';

const THEME_KEY = 'site.theme';

function readTheme(): Theme {
  try {
    return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function Nav({ variant = 'home' }: NavProps) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(readTheme);
  const headerRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  const onHome = pathname === '/';
  const onProject = links.some((item) => 'to' in item && item.to === pathname);

  const hrefFor = (item: NavLink) =>
    'to' in item ? item.to : variant === 'home' ? item.hash : `/${item.hash}`;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onDown = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* private browsing */
    }
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'light' ? '#f3eee6' : '#0b0b0c');
  }, [theme]);

  return (
    <header ref={headerRef} className={`nav${open ? ' is-open' : ''}`}>
      <nav
        className="nav-dock"
        aria-label="Primary"
        onClick={(event) => {
          if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
          if ((event.target as HTMLElement).closest('.nav-home, .nav-theme, .nav-pop-link')) return;
          setOpen((value) => !value);
        }}
      >
        <Link
          to="/"
          className={onHome ? 'nav-home is-here' : 'nav-home'}
          aria-label="Home"
          aria-current={onHome ? 'page' : undefined}
          onClick={() => setOpen(false)}
        >
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path
              d="M2.8 7.1 8 2.8l5.2 4.3V13a.7.7 0 0 1-.7.7H9.4V9.2H6.6v4.5H3.5a.7.7 0 0 1-.7-.7Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        <button
          type="button"
          className="nav-theme"
          aria-pressed={theme === 'light'}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          onClick={() => setTheme((value) => (value === 'dark' ? 'light' : 'dark'))}
        >
          {theme === 'dark' ? (
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <circle cx="8" cy="8" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <path
                d="M8 1.8v1.6M8 12.6v1.6M1.8 8h1.6M12.6 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M12.6 3.4l-1.1 1.1M4.5 11.5l-1.1 1.1"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path
                d="M10.2 2.2a5.2 5.2 0 1 0 3.6 8.8 4.4 4.4 0 0 1-3.6-8.8Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
        <div className="nav-menu">
          <button
            type="button"
            className={onProject ? 'nav-burger is-here' : 'nav-burger'}
            aria-current={onProject ? 'page' : undefined}
            aria-expanded={open}
            aria-haspopup="true"
            aria-label="Menu"
          >
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path
                d="M3.2 4.8h9.6M3.2 8h9.6M3.2 11.2h9.6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <div className="nav-pop" role="group" aria-label="Pages">
            {links.map((item) => {
              const here = 'to' in item && pathname === item.to;
              return 'to' in item ? (
                <Link
                  key={item.to}
                  to={{ pathname: item.to, search: '' }}
                  className={here ? 'nav-pop-link is-here' : 'nav-pop-link'}
                  aria-current={here ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.hash}
                  href={hrefFor(item)}
                  className="nav-pop-link"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
}
