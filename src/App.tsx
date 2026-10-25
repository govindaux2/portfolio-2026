import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { RouteFallback } from './components/RouteFallback';
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
const NdlaCasePage = lazy(() =>
  import('./pages/NdlaCasePage').then((m) => ({ default: m.NdlaCasePage }))
);
const NdlaB2Page = lazy(() =>
  import('./pages/NdlaB2Page').then((m) => ({ default: m.NdlaB2Page }))
);
const LoopHeroPage = lazy(() =>
  import('./pages/LoopHeroPage').then((m) => ({ default: m.LoopHeroPage }))
);
const TypeLabPage = lazy(() =>
  import('./pages/TypeLabPage').then((m) => ({ default: m.TypeLabPage }))
);
const WorkProjectPage = lazy(() =>
  import('./pages/WorkProjectPage').then((m) => ({ default: m.WorkProjectPage }))
);

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/work/ndla" element={<NdlaCasePage />} />
        <Route path="/work/ndla-b2" element={<NdlaB2Page />} />
        <Route path="/work/:slug" element={<WorkProjectPage />} />
        <Route path="/prototypes/:slug" element={<PrototypePage />} />
        <Route path="/lab/glass" element={<GlassLabPage />} />
        <Route path="/lab/glass/v1" element={<GlassLabV1Page />} />
        <Route path="/lab/loop" element={<LoopHeroPage />} />
        <Route path="/lab/type" element={<TypeLabPage />} />
        <Route path="/flow" element={<FlowListPage />} />
        <Route path="/flow/:id" element={<FlowCanvasPage />} />
      </Routes>
    </Suspense>
  );
}
