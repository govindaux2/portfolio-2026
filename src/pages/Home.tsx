import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Nav } from '../components/Nav';
import { Hero } from '../components/Hero';
import { Prototypes } from '../components/Prototypes';
import { Shaders } from '../components/Shaders';
import { ThreeWork } from '../components/ThreeWork';
import { Footer } from '../components/Footer';

export function Home() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash]);

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Prototypes />
        <Shaders />
        <ThreeWork />
      </main>
      <Footer />
    </>
  );
}
