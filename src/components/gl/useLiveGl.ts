import { useEffect, useRef, useState } from 'react';

/** Pause WebGL when offscreen or the tab is hidden. */
export function useLiveGl<T extends HTMLElement>(
  margin = '15%',
  startInView = false
) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(startInView);
  const [tabOn, setTabOn] = useState(
    () => typeof document === 'undefined' || !document.hidden
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: margin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);

  useEffect(() => {
    const onVis = () => setTabOn(!document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  return { ref, live: inView && tabOn, tabOn };
}
