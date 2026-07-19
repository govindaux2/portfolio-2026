import { Link } from 'react-router-dom';

type NavProps = {
  variant?: 'home' | 'inner';
};

export function Nav({ variant = 'home' }: NavProps) {
  const section = (hash: string) =>
    variant === 'home' ? hash : `/${hash}`;

  return (
    <header className="nav">
      <div className="wrap nav-inner">
        <Link to="/" className="nav-name">
          Govinda
        </Link>
        <nav className="nav-links">
          <a href={section('#prototypes')}>Prototypes</a>
          <a href={section('#shaders')}>Shaders</a>
          <a href={section('#three')}>3D</a>
          <a href={section('#contact')}>Contact</a>
        </nav>
      </div>
    </header>
  );
}
