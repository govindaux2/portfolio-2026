export const NONE = 'transparent';

const SWATCH_HEX = [
  '#141416',
  '#1e2430',
  '#24301c',
  '#2d2218',
  '#301818',
  '#c6f24e',
  '#f0f0ec',
  '#7aa2ff',
];

export const COLOR_SWATCHES = SWATCH_HEX;

export function hexToRgb(hex: string) {
  let h = hex.replace('#', '');
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const n = parseInt(h.slice(0, 6), 16);
  if (Number.isNaN(n)) return { r: 20, g: 20, b: 22 };
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function parseColor(input?: string): { hex: string; a: number } {
  if (!input) return { hex: '#141416', a: 1 };
  if (input === NONE) return { hex: '#141416', a: 0 };
  const rgba = input.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i
  );
  if (rgba) {
    const r = Number(rgba[1]);
    const g = Number(rgba[2]);
    const b = Number(rgba[3]);
    const a = rgba[4] === undefined ? 1 : Number(rgba[4]);
    const hex = `#${[r, g, b]
      .map((v) => Math.round(v).toString(16).padStart(2, '0'))
      .join('')}`;
    return { hex, a };
  }
  if (input.startsWith('#')) {
    return { hex: input.slice(0, 7), a: 1 };
  }
  return { hex: '#141416', a: 1 };
}

export function toColor(hex: string, a: number): string {
  if (a <= 0) return NONE;
  const { r, g, b } = hexToRgb(hex);
  if (a >= 0.995) return hex;
  return `rgba(${r}, ${g}, ${b}, ${Math.round(a * 100) / 100})`;
}

export function isNone(color?: string) {
  return !color || color === NONE;
}

export function relativeLuma(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Black or white ink for contrast against a fill. Undefined = inherit theme. */
export function contrastInk(bg?: string): string | undefined {
  if (isNone(bg)) return undefined;
  const { hex, a } = parseColor(bg);
  if (a < 0.35) return undefined;
  return relativeLuma(hex) > 0.55 ? '#161616' : '#f5f5f2';
}

export function canvasDotColor(fill?: string) {
  const { hex } = parseColor(fill);
  const luma = relativeLuma(hex);
  const darkDots = luma >= 0.42;
  const mid = 1 - Math.min(1, Math.abs(luma - 0.5) * 2);
  const a = 0.2 + mid * 0.16;
  return darkDots
    ? `rgba(12, 12, 14, ${a.toFixed(3)})`
    : `rgba(255, 255, 255, ${a.toFixed(3)})`;
}

export function rgbToHsv(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

export function hsvToHex(h: number, s: number, v: number) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const to = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}
