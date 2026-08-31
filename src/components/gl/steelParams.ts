export const STEEL_SHAPES = [
  'link3D',
  'torus3D',
  'sphere3D',
  'cube3D',
  'capsule3D',
  'octahedron3D',
] as const;

export type SteelShapeType = (typeof STEEL_SHAPES)[number];

export type SteelParams = {
  scale: number;
  rotation: number;
  tint: string;
  warmColor: string;
  coolColor: string;
  bevelWidth: number;
  bevelShape: number;
  curvature: number;
  waviness: number;
  environment: number;
  envRotation: number;
  softness: number;
  spectral: number;
  dispersion: number;
  shadows: number;
  speed: number;
  autoRotate: number;
  seed: number;
  edgeSoftness: number;
  shapeType: SteelShapeType;
  radius: number;
  tube: number;
  length: number;
  height: number;
  sizeX: number;
  sizeY: number;
  sizeZ: number;
  rounding: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  grain: number;
  grainBias: number;
  grainAnimated: boolean;
  followPointer: boolean;
};

/** Tuned to the Stainless Steel 1 look: mirror polish, amber/ice fringing, dark studio. */
export const STEEL_DEFAULTS: SteelParams = {
  scale: 1.18,
  rotation: 0,
  tint: '#f4f6f8',
  warmColor: '#ffa94d',
  coolColor: '#82a7e6',
  bevelWidth: 0.046,
  bevelShape: 0.38,
  curvature: 0.62,
  waviness: 0.07,
  environment: 1.08,
  envRotation: 18,
  softness: 0.08,
  spectral: 0.82,
  dispersion: 0.38,
  shadows: 0.86,
  speed: 0.22,
  autoRotate: 0.18,
  seed: 12,
  edgeSoftness: 0.018,
  shapeType: 'link3D',
  radius: 0.2,
  tube: 0.074,
  length: 0.145,
  height: 0.2,
  sizeX: 0.27,
  sizeY: 0.27,
  sizeZ: 0.27,
  rounding: 0.02,
  rotX: 28,
  rotY: -20,
  rotZ: 10,
  grain: 0.52,
  grainBias: 1.6,
  grainAnimated: false,
  followPointer: true,
};

export function steelShape(
  p: SteelParams,
  rotY: number | Record<string, unknown> = p.rotY
): Record<string, unknown> {
  const rot = { rotX: p.rotX, rotY, rotZ: p.rotZ };
  switch (p.shapeType) {
    case 'torus3D':
      return { type: 'torus3D', radius: p.radius, tube: p.tube, ...rot };
    case 'sphere3D':
      return { type: 'sphere3D', radius: p.radius, ...rot };
    case 'cube3D':
      return {
        type: 'cube3D',
        sizeX: p.sizeX,
        sizeY: p.sizeY,
        sizeZ: p.sizeZ,
        rounding: p.rounding,
        ...rot,
      };
    case 'capsule3D':
      return { type: 'capsule3D', radius: p.radius, height: p.height, ...rot };
    case 'octahedron3D':
      return { type: 'octahedron3D', radius: p.radius, ...rot };
    default:
      return {
        type: 'link3D',
        radius: p.radius,
        length: p.length,
        tube: p.tube,
        ...rot,
      };
  }
}
