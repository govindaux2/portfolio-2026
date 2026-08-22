import { useEffect, useId, useState } from 'react';
import { Link } from 'react-router-dom';

type NavProps = {
  variant?: 'home' | 'inner';
};

const links = [
  { hash: '#prototypes', label: 'Prototypes' },
  { hash: '#shaders', label: 'Shaders' },
  { hash: '#three', label: '3D' },
  { hash: '#contact', label: 'Contact' },
] as const;

export function Nav({ variant = 'home' }: NavProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  const hrefFor = (hash: string) => (variant === 'home' ? hash : `/${hash}`);

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

  return (
    <header className={`nav${open ? ' is-open' : ''}`}>
      <div className="wrap nav-inner">
        <Link to="/" className="nav-name" onClick={() => setOpen(false)}>
          Govinda
        </Link>

        <nav className="nav-links" aria-label="Primary">
          {links.map((l) => (
            <a key={l.hash} href={hrefFor(l.hash)}>
              {l.label}
            </a>
          ))}
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
          {links.map((l) => (
            <a
              key={l.hash}
              href={hrefFor(l.hash)}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <Link to="/flow" onClick={() => setOpen(false)}>
            Flow
          </Link>
        </nav>
      </div>
    </header>
  );
}
