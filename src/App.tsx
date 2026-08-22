import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home';

const PrototypePage = lazy(() =>
  import('./pages/PrototypePage').then((m) => ({ default: m.PrototypePage }))
);
const GlassLabPage = lazy(() =>
  import('./pages/GlassLabPage').then((m) => ({ default: m.GlassLabPage }))
);
const GlassLabV1Page = lazy(() =>
  import('./pages/GlassLabV1Page').then((m) => ({ default: m.GlassLabV1Page }))
);
const FlowListPage = lazy(() =>
  import('./pages/FlowListPage').then((m) => ({ default: m.FlowListPage }))
);
const FlowCanvasPage = lazy(() =>
  import('./pages/FlowCanvasPage').then((m) => ({ default: m.FlowCanvasPage }))
);

export default function App() {
  return (
    <Suspense fallback={<div className="route-fallback" aria-hidden />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/prototypes/:slug" element={<PrototypePage />} />
        <Route path="/lab/glass" element={<GlassLabPage />} />
        <Route path="/lab/glass/v1" element={<GlassLabV1Page />} />
        <Route path="/flow" element={<FlowListPage />} />
        <Route path="/flow/:id" element={<FlowCanvasPage />} />
      </Routes>
    </Suspense>
  );
}
