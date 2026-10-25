export type LoopParams = {
  speed: number;
  density: number;
  thickness: number;
  fog: number;
  warp: number;
  roomW: number;
  roomH: number;
  pulse: number;
  lineColor: string;
  bgColor: string;
  circleSize: number;
  circleSoft: number;
  circleA: string;
  circleB: string;
  glowColor: string;
  ringGap: number;
  glow: number;
  figureScale: number;
  figureRotY: number;
  figureY: number;
  keyLight: number;
  fillLight: number;
  rimLight: number;
  ambient: number;
  parallax: number;
  mouse: number;
  breathe: number;
};

export const LOOP_DEFAULTS: LoopParams = {
  speed: 0.32,
  density: 1.35,
  thickness: 0.014,
  fog: 0.1,
  warp: 0.07,
  roomW: 2.35,
  roomH: 1.18,
  pulse: 0.22,
  lineColor: '#c8c4d4',
  bgColor: '#0c0c0e',
  circleSize: 44,
  circleSoft: 36,
  circleA: '#f3d2f4',
  circleB: '#c45ec8',
  glowColor: '#d070e0',
  ringGap: 12,
  glow: 1,
  figureScale: 1,
  figureRotY: 0.08,
  figureY: -0.06,
  keyLight: 0.55,
  fillLight: 0.06,
  rimLight: 2.8,
  ambient: 0.02,
  parallax: 1,
  mouse: 1,
  breathe: 0.7,
};

export const LOOP_PRESETS: { id: string; label: string; params: LoopParams }[] = [
  { id: 'studio', label: 'Studio', params: { ...LOOP_DEFAULTS } },
  {
    id: 'deep',
    label: 'Deep',
    params: {
      ...LOOP_DEFAULTS,
      speed: 0.48,
      density: 1.9,
      fog: 0.07,
      roomW: 2.8,
      roomH: 1.4,
      warp: 0.12,
      pulse: 0.36,
      circleSize: 40,
    },
  },
  {
    id: 'tight',
    label: 'Tight',
    params: {
      ...LOOP_DEFAULTS,
      speed: 0.22,
      density: 1.05,
      thickness: 0.02,
      fog: 0.13,
      roomW: 1.85,
      circleSize: 54,
      circleSoft: 24,
      figureScale: 1.06,
    },
  },
];

export const LOOP_STORAGE_KEY = 'lab.loop.params.v2';

export function hexToRgb(hex: string): [number, number, number] {
  const n = hex.replace('#', '');
  if (n.length !== 6) return [1, 1, 1];
  return [
    parseInt(n.slice(0, 2), 16) / 255,
    parseInt(n.slice(2, 4), 16) / 255,
    parseInt(n.slice(4, 6), 16) / 255,
  ];
}

export function loadLoopParams(): LoopParams {
  try {
    const raw = localStorage.getItem(LOOP_STORAGE_KEY);
    if (!raw) return LOOP_DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<LoopParams>;
    return { ...LOOP_DEFAULTS, ...parsed };
  } catch {
    return LOOP_DEFAULTS;
  }
}

export function saveLoopParams(params: LoopParams) {
  try {
    localStorage.setItem(LOOP_STORAGE_KEY, JSON.stringify(params));
  } catch {
    // ignore quota / private mode
  }
}

export function copyLoopParams(params: LoopParams): Promise<void> {
  const text = JSON.stringify(params, null, 2);
  return navigator.clipboard.writeText(text);
}
