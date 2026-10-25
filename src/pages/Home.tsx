import { Nav } from '../components/Nav';
import { Hero } from '../components/Hero';

export function Home() {
  return (
    <>
      <Nav />
      <main className="home-stack">
        <Hero />
      </main>
    </>
  );
}
