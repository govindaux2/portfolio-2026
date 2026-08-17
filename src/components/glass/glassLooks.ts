import { GLASS_V2_DEFAULTS, type GlassParamsV2 } from './glassParams';

export type GlassLook = {
  id: string;
  name: string;
  params: GlassParamsV2;
};

const STORAGE_KEY = 'glass-lab-v2-looks';

type Store = {
  activeId: string | null;
  looks: GlassLook[];
};

function readStore(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { activeId: null, looks: [] };
    const parsed = JSON.parse(raw) as Store;
    if (!Array.isArray(parsed.looks)) return { activeId: null, looks: [] };
    return {
      activeId: parsed.activeId ?? null,
      looks: parsed.looks.map((look) => ({
        ...look,
        params: { ...GLASS_V2_DEFAULTS, ...look.params },
      })),
    };
  } catch {
    return { activeId: null, looks: [] };
  }
}

function writeStore(store: Store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function loadLooks(): Store {
  return readStore();
}

export function saveLook(name: string, params: GlassParamsV2): Store {
  const store = readStore();
  const trimmed = name.trim() || `Look ${store.looks.length + 1}`;
  const existing = store.looks.find(
    (look) => look.name.toLowerCase() === trimmed.toLowerCase()
  );
  const next: GlassLook = existing
    ? { ...existing, params: { ...params } }
    : {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: trimmed,
        params: { ...params },
      };
  const looks = existing
    ? store.looks.map((look) => (look.id === existing.id ? next : look))
    : [...store.looks, next];
  const storeNext = { activeId: next.id, looks };
  writeStore(storeNext);
  return storeNext;
}

export function applyLook(id: string): Store {
  const store = readStore();
  const storeNext = { ...store, activeId: id };
  writeStore(storeNext);
  return storeNext;
}

export function deleteLook(id: string): Store {
  const store = readStore();
  const looks = store.looks.filter((look) => look.id !== id);
  const activeId = store.activeId === id ? null : store.activeId;
  const storeNext = { activeId, looks };
  writeStore(storeNext);
  return storeNext;
}
