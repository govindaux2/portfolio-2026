import { useCallback, useState } from 'react';
import {
  HOME_ORDER_KEY,
  HOME_SECTION_IDS,
  moveHomeSection,
  normalizeHomeOrder,
  type HomeSectionId,
} from './homeSections';

function readOrder(): HomeSectionId[] {
  try {
    const raw = localStorage.getItem(HOME_ORDER_KEY);
    return normalizeHomeOrder(raw ? JSON.parse(raw) : HOME_SECTION_IDS);
  } catch {
    return [...HOME_SECTION_IDS];
  }
}

export function useHomeSectionOrder() {
  const [order, setOrder] = useState<HomeSectionId[]>(readOrder);

  const persist = useCallback((next: HomeSectionId[]) => {
    setOrder(next);
    try {
      localStorage.setItem(HOME_ORDER_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota / private mode */
    }
  }, []);

  const move = useCallback(
    (from: number, to: number) => {
      persist(moveHomeSection(order, from, to));
    },
    [order, persist]
  );

  return { order, move };
}
