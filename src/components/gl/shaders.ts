export const baseVert = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

// Slow-drifting fbm fog in the site palette. Runs behind the hero.
export const heroFrag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2 uMouse;
uniform float uAspect;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.1 + vec2(3.7, 1.3);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 p = vUv;
  p.x *= uAspect;

  float t = uTime * 0.05;
  vec2 drift = vec2(fbm(p * 1.4 + t), fbm(p * 1.4 - t + 5.0));
  float field = fbm(p * 2.0 + drift * 1.6 + uMouse * 0.25);

  vec3 bg = vec3(0.043, 0.043, 0.047);
  vec3 smoke = vec3(0.10, 0.105, 0.115);
  vec3 acid = vec3(0.776, 0.949, 0.306);

  vec3 col = mix(bg, smoke, smoothstep(0.25, 0.85, field));
  float vein = smoothstep(0.52, 0.55, field) * smoothstep(0.60, 0.57, field);
  col = mix(col, acid * 0.85, vein * 0.5);

  float vig = smoothstep(1.35, 0.35, length(vUv - 0.5) * 1.6);
  col *= vig;

  gl_FragColor = vec4(col, 1.0);
}
`;

// Gallery pieces. Each is intentionally distinct.
export const ribbonFrag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;

void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float t = uTime * 0.4;
  float v = 0.0;
  for (float i = 1.0; i < 5.0; i++) {
    v += sin(p.x * i * 2.4 + t + sin(p.y * i * 1.7 - t * 0.8)) / i;
  }
  float band = smoothstep(0.02, 0.35, abs(v - p.y * 1.4));
  vec3 a = vec3(0.05, 0.05, 0.06);
  vec3 b = vec3(0.776, 0.949, 0.306);
  vec3 col = mix(b, a, band);
  col = mix(col, vec3(0.94, 0.94, 0.92), (1.0 - band) * 0.15 * sin(t + p.x * 4.0));
  gl_FragColor = vec4(col, 1.0);
}
`;

export const orbFrag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;

void main() {
  vec2 p = vUv * 2.0 - 1.0;
  p.x *= 1.333;
  float t = uTime * 0.5;

  float d = length(p);
  float wob = sin(atan(p.y, p.x) * 6.0 + t * 2.0) * 0.04 * sin(t);
  float ring = abs(d - 0.55 - wob);

  float glow = 0.012 / max(ring, 0.004);
  float core = smoothstep(0.35, 0.0, d) * (0.5 + 0.5 * sin(t * 1.4));

  vec3 col = vec3(0.04, 0.04, 0.05);
  col += vec3(0.776, 0.949, 0.306) * glow * 0.55;
  col += vec3(0.92, 0.95, 0.85) * core * 0.25;
  gl_FragColor = vec4(col, 1.0);
}
`;

export const gridFrag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;

void main() {
  vec2 p = vUv;
  float t = uTime * 0.3;

  vec2 warp = vec2(
    sin(p.y * 6.0 + t) * 0.04,
    cos(p.x * 6.0 - t * 1.3) * 0.04
  );
  vec2 g = (p + warp) * 14.0;
  vec2 cell = abs(fract(g) - 0.5);
  float line = smoothstep(0.5, 0.46, max(cell.x, cell.y));

  float pulse = sin(g.x * 0.5 + g.y * 0.5 - t * 3.0) * 0.5 + 0.5;

  vec3 col = vec3(0.045, 0.045, 0.05);
  col = mix(col, vec3(0.14, 0.145, 0.15), line);
  col += vec3(0.776, 0.949, 0.306) * line * pulse * 0.35;
  gl_FragColor = vec4(col, 1.0);
}
`;
