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

// Frozen snapshot. /lab/glass/v1
export const glassWaitlistFragV1 = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform vec2 uPillCenter;
uniform vec2 uPillPx;
uniform float uPressed;

float sdCapsule(vec2 p, vec2 a, vec2 b, float r) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

float pillSDF(vec2 p, vec2 halfPx) {
  float r = halfPx.y;
  float inner = max(halfPx.x - r, 0.0);
  return sdCapsule(p, vec2(-inner, 0.0), vec2(inner, 0.0), r);
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

vec3 lightTint() {
  return vec3(0.32, 0.80, 0.84);
}

vec3 sceneCol(vec2 uv, vec2 lightUv) {
  vec3 bg = vec3(0.027, 0.082, 0.102);
  vec2 cell = fract(uv * uResolution / 22.0) - 0.5;
  float ddot = 1.0 - smoothstep(0.06, 0.13, length(cell));
  float fade = smoothstep(0.78, 0.18, length((uv - 0.5) * vec2(1.2, 1.0)));
  bg += vec3(0.72, 0.88, 0.90) * ddot * 0.05 * fade;

  vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
  float d = length((uv - lightUv) * aspect);
  float core = exp(-d * d * 16.0);
  float halo = exp(-d * d * 5.0);
  bg += lightTint() * (core * 0.9 + halo * 0.28);
  return bg;
}

void main() {
  vec2 uv = vUv;
  vec2 lightUv = uMouse;
  vec2 frag = uv * uResolution;
  vec2 p = frag - uPillCenter;
  vec2 halfPx = uPillPx * 0.5;

  float sdf = pillSDF(p, halfPx);
  vec2 e = vec2(1.4, 0.0);
  vec2 n = normalize(vec2(
    pillSDF(p + e.xy, halfPx) - pillSDF(p - e.xy, halfPx),
    pillSDF(p + e.yx, halfPx) - pillSDF(p - e.yx, halfPx)
  ));

  float fill = 1.0 - smoothstep(-1.25, 1.25, sdf);

  vec2 fromC = (frag - uPillCenter) / max(uResolution, vec2(1.0));
  vec2 magUv = uv - fromC * 0.09;
  float edge = 1.0 - smoothstep(0.0, 11.0, -sdf);
  vec2 ruv = magUv - n * (0.01 + edge * 0.018) * fill;

  vec3 outside = sceneCol(uv, lightUv);
  vec3 frosted = (
    sceneCol(ruv, lightUv) +
    sceneCol(ruv + vec2(0.0032, 0.0), lightUv) +
    sceneCol(ruv + vec2(-0.0032, 0.0), lightUv) +
    sceneCol(ruv + vec2(0.0, 0.0024), lightUv) +
    sceneCol(ruv + vec2(0.0, -0.0024), lightUv)
  ) / 5.0;

  vec3 glass = mix(frosted, vec3(0.035, 0.11, 0.135), 0.26);

  vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
  float dLight = length((ruv - lightUv) * aspect);
  float glow = exp(-dLight * dLight * 18.0);
  glass += lightTint() * glow * 0.42;
  glass += vec3(0.92, 0.98, 1.0) * pow(glow, 3.2) * 0.28;

  vec2 ldir = normalize((lightUv * uResolution - frag) + vec2(0.001));
  float ndl = clamp(dot(n, ldir), 0.0, 1.0);
  float rim = smoothstep(5.5, 0.0, abs(sdf)) * (0.2 + 0.8 * ndl);
  glass += vec3(0.86, 0.96, 0.98) * rim * 0.42;

  float top = smoothstep(0.35, 1.0, n.y) * smoothstep(3.5, 0.0, abs(sdf + 0.4));
  glass += vec3(1.0) * top * 0.16;

  glass += (hash(frag) - 0.5) * 0.035;
  glass *= mix(1.0, 0.9, uPressed);

  vec3 col = mix(outside, glass, fill);
  float spill = exp(-max(sdf, 0.0) * 0.11) * glow * (1.0 - fill);
  col += lightTint() * spill * 0.18;

  gl_FragColor = vec4(col, 1.0);
}
`;

// V2: liquid react, readable center, hover dims light instead of adding a hot core.
export const glassWaitlistFragV2 = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform vec2 uPillCenter;
uniform vec2 uPillPx;
uniform float uPressed;
uniform float uHover;
uniform float uLightIntensity;
uniform float uLightSize;
uniform vec3 uLightColor;
uniform float uRefraction;
uniform float uMagnify;
uniform float uFrost;
uniform float uTint;
uniform float uRim;
uniform float uGrain;
uniform float uSpill;
uniform float uInnerGlow;
uniform vec2 uVel;
uniform float uReact;
uniform float uHoverDim;
uniform float uStack;
uniform float uEdgeReact;
uniform float uEdgeWidth;
uniform float uEdgeReach;
uniform float uEdgeTop;
uniform float uInnerAmt;
uniform float uInnerVis;
uniform float uInnerInset;
uniform float uInnerBlur;
uniform float uInnerReact;
uniform float uInnerLight;
uniform float uInnerFrost;
uniform float uInnerNear;
uniform float uInnerFollow;
uniform float uInnerSpread;
uniform vec3 uInnerColor;

float sdCapsule(vec2 p, vec2 a, vec2 b, float r) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

float pillSDF(vec2 p, vec2 halfPx) {
  float r = halfPx.y;
  float inner = max(halfPx.x - r, 0.0);
  return sdCapsule(p, vec2(-inner, 0.0), vec2(inner, 0.0), r);
}

float ign(vec2 p) {
  return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
}

vec3 sceneCol(vec2 uv, vec2 lightUv, float intensity) {
  vec3 bg = vec3(0.027, 0.082, 0.102);
  vec2 cell = fract(uv * uResolution / 22.0) - 0.5;
  float ddot = 1.0 - smoothstep(0.05, 0.11, length(cell));
  float fade = smoothstep(0.78, 0.18, length((uv - 0.5) * vec2(1.2, 1.0)));
  bg += vec3(0.72, 0.88, 0.90) * ddot * 0.04 * fade;

  vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
  float d = length((uv - lightUv) * aspect);
  float size = mix(26.0, 7.0, clamp(uLightSize, 0.0, 1.0));
  float core = exp(-d * d * size);
  float halo = exp(-d * d * size * 0.26);
  bg += uLightColor * intensity * (core * 0.62 + halo * 0.18);
  return bg;
}

vec3 frostSample(vec2 ruv, vec2 lightUv, float intensity, float amount) {
  float r = amount * 0.0034;
  vec3 acc = sceneCol(ruv, lightUv, intensity);
  acc += sceneCol(ruv + vec2( 0.87,  0.49) * r, lightUv, intensity);
  acc += sceneCol(ruv + vec2(-0.87,  0.49) * r, lightUv, intensity);
  acc += sceneCol(ruv + vec2( 0.00, -1.00) * r, lightUv, intensity);
  acc += sceneCol(ruv + vec2( 0.71, -0.71) * r, lightUv, intensity);
  acc += sceneCol(ruv + vec2(-0.71, -0.71) * r, lightUv, intensity);
  acc += sceneCol(ruv + vec2( 0.71,  0.71) * r, lightUv, intensity);
  acc += sceneCol(ruv + vec2(-0.71,  0.71) * r, lightUv, intensity);
  return acc / 8.0;
}

void main() {
  vec2 uv = vUv;
  vec2 lightUv = uMouse;
  vec2 frag = uv * uResolution;
  vec2 p = frag - uPillCenter;
  vec2 halfPx = uPillPx * 0.5;

  float intensity = uLightIntensity * mix(1.0, uHoverDim, uHover);
  float react = uReact * (1.0 + uHover * 0.22);

  vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
  float dLight = length((uv - lightUv) * aspect);
  float size = mix(26.0, 7.0, clamp(uLightSize, 0.0, 1.0));
  float glow = exp(-dLight * dLight * size);

  float sdf = pillSDF(p, halfPx) - glow * react * 5.2;
  float e = max(0.7, fwidth(sdf));
  vec2 n = normalize(vec2(
    pillSDF(p + vec2(e, 0.0), halfPx) - pillSDF(p - vec2(e, 0.0), halfPx),
    pillSDF(p + vec2(0.0, e), halfPx) - pillSDF(p - vec2(0.0, e), halfPx)
  ));
  float fill = 1.0 - smoothstep(-e, e, sdf);
  float edge = 1.0 - smoothstep(0.0, 10.0, -sdf);

  vec2 fromC = (frag - uPillCenter) / max(uResolution, vec2(1.0));
  vec2 magUv = uv - fromC * uMagnify;
  vec2 pull = (lightUv - uv) * glow * react * 0.026;
  vec2 flow = clamp(uVel, vec2(-1.6), vec2(1.6)) * react * 0.022;
  vec2 bend = n * uRefraction * pow(edge, 1.7) * fill;
  vec2 ruv = magUv - bend - pull * fill - flow * fill;

  vec3 outside = sceneCol(uv, lightUv, intensity);
  vec3 frosted = mix(
    sceneCol(ruv, lightUv, intensity),
    frostSample(ruv, lightUv, intensity, uFrost),
    uFrost
  );
  vec3 glass = mix(frosted, vec3(0.12, 0.22, 0.24), uTint * 0.35);

  float dRefract = length((ruv - lightUv) * aspect);
  float inner = exp(-dRefract * dRefract * size);
  glass += uLightColor * inner * uInnerGlow;
  glass += vec3(0.94, 0.98, 1.0) * pow(inner, 4.0) * uStack;

  vec2 ldir = normalize((lightUv * uResolution - frag) + vec2(0.001));
  float ndl = clamp(dot(n, ldir), 0.0, 1.0);
  float ahead = clamp(dot(n, normalize(uVel + ldir * 0.001)), 0.0, 1.0);
  float band = smoothstep(max(uEdgeWidth, 1.0), 0.0, abs(sdf));
  float reach = exp(-dLight * dLight * mix(36.0, 3.5, clamp(uEdgeReach, 0.0, 1.0)));
  float facing = pow(ndl, mix(2.8, 0.65, clamp(uEdgeReach, 0.0, 1.0)));
  float sweep = band * (0.35 + 0.4 * facing + 0.35 * reach + 0.25 * ahead * react);
  glass += vec3(0.88, 0.96, 0.98) * sweep * uRim;
  glass += uLightColor * sweep * uEdgeReact;
  glass += vec3(1.0) * band * facing * uEdgeReact * 0.22;

  float top = smoothstep(0.22, 1.0, n.y) * band;
  glass += vec3(1.0) * top * uEdgeTop;

  if (uInnerVis > 0.5) {
    float insetPx = max(uInnerInset, 0.0);
    float blurPx = max(uInnerBlur, 0.8);
    vec2 halfIn = vec2(
      max(halfPx.x - insetPx, 6.0),
      max(halfPx.y - insetPx, 4.0)
    );
    vec2 lightP = lightUv * uResolution - uPillCenter;
    vec2 chaseDir = lightP / max(length(lightP), 1.0);
    vec2 pIn = p - chaseDir * insetPx * uInnerFollow * glow;
    float eIn = max(0.7, fwidth(pillSDF(pIn, halfIn)));
    vec2 nIn = normalize(vec2(
      pillSDF(pIn + vec2(eIn, 0.0), halfIn) - pillSDF(pIn - vec2(eIn, 0.0), halfIn),
      pillSDF(pIn + vec2(0.0, eIn), halfIn) - pillSDF(pIn - vec2(0.0, eIn), halfIn)
    ));
    vec2 toL = lightP - pIn;
    vec2 ldirIn = normalize(toL + vec2(0.001));
    float ndlIn = clamp(dot(nIn, ldirIn), 0.0, 1.0);
    float facingIn = pow(ndlIn, mix(6.2, 1.4, clamp(uInnerSpread, 0.0, 1.0)));
    float fall = exp(-dot(toL, toL) * mix(0.00125, 0.00011, clamp(uInnerNear, 0.0, 1.0)));
    float bulge = glow * react * uInnerReact * 5.0 * facingIn * fall;
    float sdfIn = pillSDF(pIn, halfIn) - bulge;
    float innerRim = smoothstep(blurPx, blurPx * 0.12, abs(sdfIn)) * fill;
    float vis = innerRim * facingIn * fall * uInnerAmt;
    glass += uInnerColor * vis * uInnerLight;
  }

  glass += (ign(frag) - 0.5) * uGrain;
  glass *= mix(1.0, 0.93, uPressed);

  vec3 col = mix(outside, glass, fill);
  float spill = exp(-max(sdf, 0.0) * 0.15) * inner * (1.0 - fill);
  col += uLightColor * spill * uSpill;
  col += (ign(frag + 1.7) - 0.5) * 0.006;

  gl_FragColor = vec4(col, 1.0);
}
`;
