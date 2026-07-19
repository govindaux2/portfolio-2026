import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home';

const PrototypePage = lazy(() =>
  import('./pages/PrototypePage').then((m) => ({ default: m.PrototypePage }))
);

export default function App() {
  return (
    <Suspense fallback={<div className="route-fallback" aria-hidden />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/prototypes/:slug" element={<PrototypePage />} />
      </Routes>
    </Suspense>
  );
}
