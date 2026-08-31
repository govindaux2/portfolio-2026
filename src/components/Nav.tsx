import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

type NavProps = {
  variant?: 'home' | 'inner';
};

type NavLink =
  | { to: string; label: string }
  | { hash: string; label: string };

const links: NavLink[] = [
  { to: '/work/ndla', label: 'NDLA' },
  { to: '/work/ndla-b2', label: 'NDLA B2' },
  { hash: '#prototypes', label: 'Prototypes' },
  { hash: '#shaders', label: 'Shaders' },
  { hash: '#three', label: '3D' },
  { hash: '#contact', label: 'Contact' },
];

export function Nav({ variant = 'home' }: NavProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const headerRef = useRef<HTMLElement>(null);

  const hrefFor = (item: NavLink) =>
    'to' in item ? item.to : variant === 'home' ? item.hash : `/${item.hash}`;

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const closeOnDesktop = () => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener('change', closeOnDesktop);
    return () => mq.removeEventListener('change', closeOnDesktop);
  }, []);

  useEffect(() => {
    const header = headerRef.current;
    const vv = window.visualViewport;
    if (!header || !vv) return;

    const pin = () => {
      const s = vv.scale || 1;
      header.style.width = `${vv.width * s}px`;
      header.style.transform = `translate(${vv.offsetLeft}px, ${vv.offsetTop}px) scale(${1 / s})`;
    };
    pin();
    vv.addEventListener('resize', pin);
    vv.addEventListener('scroll', pin);
    return () => {
      vv.removeEventListener('resize', pin);
      vv.removeEventListener('scroll', pin);
      header.style.transform = '';
      header.style.width = '';
    };
  }, []);

  return (
    <header ref={headerRef} className={`nav${open ? ' is-open' : ''}`}>
      <div className="wrap nav-inner">
        <Link to="/" className="nav-name" onClick={() => setOpen(false)}>
          Govinda
        </Link>

        <nav className="nav-links" aria-label="Primary">
          {links.map((l) =>
            'to' in l ? (
              <Link
                key={l.to}
                to={{ pathname: l.to, search: '' }}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ) : (
              <a key={l.hash} href={hrefFor(l)}>
                {l.label}
              </a>
            )
          )}
          <Link to="/flow">Flow</Link>
        </nav>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="nav-toggle-bar" />
          <span className="nav-toggle-bar" />
        </button>
      </div>

      <div
        id={menuId}
        className="nav-drawer"
        hidden={!open}
        aria-hidden={!open}
      >
        <nav className="nav-drawer-links" aria-label="Mobile">
          {links.map((l) =>
            'to' in l ? (
              <Link
                key={l.to}
                to={{ pathname: l.to, search: '' }}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ) : (
              <a key={l.hash} href={hrefFor(l)} onClick={() => setOpen(false)}>
                {l.label}
              </a>
            )
          )}
          <Link to="/flow" onClick={() => setOpen(false)}>
            Flow
          </Link>
        </nav>
      </div>
    </header>
  );
}
