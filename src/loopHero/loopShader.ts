import { baseVert } from '../components/gl/shaders';

export { baseVert };

/** Perspective corridor. Hole, warp, and ring ripple are uniform-driven (no DOM reads). */
export const loopTunnelFrag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uScroll;
uniform float uSpeed;
uniform float uDensity;
uniform float uThickness;
uniform float uFog;
uniform float uWarp;
uniform float uRoomW;
uniform float uRoomH;
uniform float uPulse;
uniform float uNear;
uniform vec3 uBg;
uniform vec3 uLine;
uniform vec3 uGlow;
uniform vec2 uCircleCenter;
uniform float uCircleRadius;
uniform float uCircleSoft;

float lineBand(float coord, float spacing, float width) {
  float g = abs(fract(coord / spacing) - 0.5) * spacing;
  return 1.0 - smoothstep(0.0, width, g);
}

void addPlane(
  inout vec3 col,
  vec3 ro,
  vec3 rd,
  vec3 n,
  float planeD,
  vec3 depthAxis,
  vec3 acrossAxis,
  float travel,
  float warp
) {
  float denom = dot(rd, n);
  if (abs(denom) < 0.0008) return;
  float t = (planeD - dot(ro, n)) / denom;
  if (t < 0.55 || t > 64.0) return;

  vec3 hp = ro + rd * t;
  hp += acrossAxis * sin(dot(hp, depthAxis) * 0.32 + uTime * 0.55) * warp;

  float spacing = 1.0 / max(uDensity, 0.15);
  float lw = uThickness * t * 0.85;
  float depthCoord = dot(hp, depthAxis) + travel;
  float acrossCoord = dot(hp, acrossAxis);

  float horiz = lineBand(depthCoord, spacing, lw);
  float rail = lineBand(acrossCoord, spacing * 5.2, lw * 0.55) * 0.22;
  float pulse = smoothstep(0.06, 0.0, abs(fract(depthCoord * 0.07 + uTime * 0.12) - 0.5));

  float fog = exp(-t * uFog * 1.35);
  float mark = (horiz + rail + pulse * uPulse * horiz) * fog;
  col = mix(col, uLine, clamp(mark, 0.0, 1.0));
}

void main() {
  vec2 frag = vUv * uResolution;
  vec2 uv = (frag - 0.5 * uResolution) / uResolution.y;
  uv -= uMouse * 0.045;

  float near = clamp(uNear, 0.0, 1.0);
  float warp = uWarp * (1.0 + near * 1.6);

  vec3 ro = vec3(0.0, 0.02 + uScroll * 0.08, uScroll * 3.2);
  vec3 rd = normalize(vec3(uv, 1.18));

  vec3 col = uBg;

  float travel = uTime * uSpeed * 1.65;
  addPlane(col, ro, rd, vec3(0.0, 1.0, 0.0), -uRoomH, vec3(0.0, 0.0, 1.0), vec3(1.0, 0.0, 0.0), travel, warp);
  addPlane(col, ro, rd, vec3(0.0, 1.0, 0.0),  uRoomH, vec3(0.0, 0.0, 1.0), vec3(1.0, 0.0, 0.0), travel, warp);
  addPlane(col, ro, rd, vec3(1.0, 0.0, 0.0), -uRoomW, vec3(0.0, 0.0, 1.0), vec3(0.0, 1.0, 0.0), travel, warp);
  addPlane(col, ro, rd, vec3(1.0, 0.0, 0.0),  uRoomW, vec3(0.0, 0.0, 1.0), vec3(0.0, 1.0, 0.0), travel, warp);

  float d = length(frag - uCircleCenter);
  float ripple = sin(d * 0.055 - uTime * 2.6) * 7.0 * near;
  float hole = smoothstep(
    uCircleRadius - uCircleSoft + ripple,
    uCircleRadius + uCircleSoft * 0.35 + ripple,
    d
  );

  float ring = abs(d - uCircleRadius);
  float glow = exp(-ring * 0.028) * near;
  col += uGlow * glow * 0.55;

  vec2 q = vUv * 2.0 - 1.0;
  float vig = smoothstep(1.55, 0.42, length(q));
  col *= mix(0.78, 1.0, vig);

  gl_FragColor = vec4(col * hole, hole);
}
`;
