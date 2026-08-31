export type Prototype = {
  slug: string;
  title: string;
  tags: string;
  cover: string;
  /** External live prototype URL. Prefer this when set. */
  href?: string;
  /** When true, card links to `/prototypes/:slug` instead of an external URL. */
  internal?: boolean;
  feature?: boolean;
  summary?: string;
  role?: string;
  year?: string;
  platform?: string;
  highlights?: string[];
};

export const prototypes: Prototype[] = [
  {
    slug: 'ledgerline',
    title: 'Ledgerline: personal finance app',
    tags: 'iOS · SwiftUI · haptics',
    cover: 'https://picsum.photos/seed/ledgerline-finance-app/1680/720',
    internal: true,
    feature: true,
    summary:
      'A calm personal finance flow for checking balances, moving money, and reviewing spend without the usual banking noise. Built as a high-fidelity iOS prototype with haptics and motion that feel native.',
    role: 'Product design · Interaction · Prototype',
    year: '2026',
    platform: 'iOS',
    highlights: [
      'Home → account → transfer flow in under six taps',
      'Haptic feedback on confirmations and threshold crossings',
      'Dark UI tuned for glanceable balances and quiet hierarchy',
    ],
  },
  {
    slug: 'waypoint',
    title: 'Waypoint: trail navigation',
    tags: 'iOS · MapKit',
    cover: 'https://picsum.photos/seed/waypoint-trail-app/1200/675',
    href: '#',
  },
  {
    slug: 'grainhouse',
    title: 'Grainhouse: film scanning tool',
    tags: 'iPad · Metal',
    cover: 'https://picsum.photos/seed/grainhouse-film-app/1200/675',
    href: '#',
  },
];

export function getPrototype(slug: string): Prototype | undefined {
  return prototypes.find((p) => p.slug === slug);
}

export type ShaderItem = {
  name: string;
  usedIn: string;
  frag: string;
};

export type ThreeSpec = {
  label: string;
  value: string;
};

export const threeSpecs: ThreeSpec[] = [
  { label: 'Product configurator', value: 'R3F, 60fps on mobile' },
  { label: 'Hero scenes for app launches', value: 'GLTF, draco compressed' },
  { label: 'Interactive landing visuals', value: 'Chrome, WebGPU' },
];
