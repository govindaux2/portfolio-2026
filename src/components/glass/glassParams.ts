export type GlassParamsV2 = {
  lightIntensity: number;
  lightSize: number;
  lightHue: number;
  stiffness: number;
  damping: number;
  react: number;
  hoverDim: number;
  pillW: number;
  pillH: number;
  refraction: number;
  magnify: number;
  frost: number;
  tint: number;
  rim: number;
  edgeReact: number;
  edgeWidth: number;
  edgeReach: number;
  edgeTop: number;
  grain: number;
  spill: number;
  innerGlow: number;
  stack: number;
  innerAmt: number;
  innerVis: number;
  innerInset: number;
  innerBlur: number;
  innerReact: number;
  innerLight: number;
  innerFrost: number;
  innerNear: number;
  innerFollow: number;
  innerSpread: number;
  innerHue: number;
};

export const GLASS_V2_DEFAULTS: GlassParamsV2 = {
  lightIntensity: 0.26,
  lightSize: 0.5,
  lightHue: 186,
  stiffness: 42,
  damping: 12,
  react: 0.55,
  hoverDim: 0.68,
  pillW: 240,
  pillH: 52,
  refraction: 0.016,
  magnify: 0.055,
  frost: 0.38,
  tint: 0.14,
  rim: 0.28,
  edgeReact: 0.62,
  edgeWidth: 7,
  edgeReach: 0.7,
  edgeTop: 0.2,
  grain: 0.006,
  spill: 0.05,
  innerGlow: 0.06,
  stack: 0,
  innerAmt: 0.85,
  innerVis: 1,
  innerInset: 8,
  innerBlur: 9,
  innerReact: 0.6,
  innerLight: 0.85,
  innerFrost: 0.35,
  innerNear: 0.55,
  innerFollow: 0.35,
  innerSpread: 0.28,
  innerHue: 198,
};

export function hueToRgb(hue: number): [number, number, number] {
  const h = (((hue % 360) + 360) % 360) / 60;
  const x = 1 - Math.abs((h % 2) - 1);
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 1) [r, g, b] = [1, x, 0];
  else if (h < 2) [r, g, b] = [x, 1, 0];
  else if (h < 3) [r, g, b] = [0, 1, x];
  else if (h < 4) [r, g, b] = [0, x, 1];
  else if (h < 5) [r, g, b] = [x, 0, 1];
  else [r, g, b] = [1, 0, x];
  const mix = 0.42;
  return [
    r * (1 - mix) + mix * 0.35,
    g * (1 - mix) + mix * 0.82,
    b * (1 - mix) + mix * 0.86,
  ];
}

export function hueToRgbVivid(hue: number): [number, number, number] {
  const h = (((hue % 360) + 360) % 360) / 60;
  const x = 1 - Math.abs((h % 2) - 1);
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 1) [r, g, b] = [1, x, 0];
  else if (h < 2) [r, g, b] = [x, 1, 0];
  else if (h < 3) [r, g, b] = [0, 1, x];
  else if (h < 4) [r, g, b] = [0, x, 1];
  else if (h < 5) [r, g, b] = [x, 0, 1];
  else [r, g, b] = [1, 0, x];
  return [0.18 + r * 0.82, 0.18 + g * 0.82, 0.18 + b * 0.82];
}
