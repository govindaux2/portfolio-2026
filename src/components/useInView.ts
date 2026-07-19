import { useEffect, useRef, useState } from 'react';

/** Tracks whether an element is near the viewport (used to pause offscreen GL). */
export function useInView<T extends HTMLElement>(margin = '15%') {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

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

  return { ref, inView };
}
