import type { ComponentType } from 'react';
import { Footer } from '../components/Footer';
import { Hero } from '../components/Hero';
import { Prototypes } from '../components/Prototypes';
import { Shaders } from '../components/Shaders';
import { ThreeWork } from '../components/ThreeWork';

export const HOME_SECTION_IDS = [
  'hero',
  'prototypes',
  'shaders',
  'three',
  'contact',
] as const;

export type HomeSectionId = (typeof HOME_SECTION_IDS)[number];

export type HomeSectionMeta = {
  id: HomeSectionId;
  label: string;
  hint: string;
  Component: ComponentType;
};

export const HOME_SECTIONS: HomeSectionMeta[] = [
  { id: 'hero', label: 'Hero', hint: 'Name / show me now', Component: Hero },
  { id: 'prototypes', label: 'Prototypes', hint: 'Work grid', Component: Prototypes },
  { id: 'shaders', label: 'Shaders', hint: 'Horizontal studies', Component: Shaders },
  { id: 'three', label: '3D', hint: 'Three.js pieces', Component: ThreeWork },
  { id: 'contact', label: 'Contact', hint: 'Footer + email', Component: Footer },
];

export const HOME_SECTION_MAP = Object.fromEntries(
  HOME_SECTIONS.map((s) => [s.id, s])
) as Record<HomeSectionId, HomeSectionMeta>;

export const HOME_ORDER_KEY = 'pageMenu.home.v1';

export function normalizeHomeOrder(raw: unknown): HomeSectionId[] {
  const seen = new Set<HomeSectionId>();
  const next: HomeSectionId[] = [];

  if (Array.isArray(raw)) {
    for (const id of raw) {
      if (
        typeof id === 'string' &&
        (HOME_SECTION_IDS as readonly string[]).includes(id) &&
        !seen.has(id as HomeSectionId)
      ) {
        seen.add(id as HomeSectionId);
        next.push(id as HomeSectionId);
      }
    }
  }

  for (const id of HOME_SECTION_IDS) {
    if (!seen.has(id)) next.push(id);
  }

  return next;
}

export function moveHomeSection(
  order: HomeSectionId[],
  from: number,
  to: number
): HomeSectionId[] {
  if (from === to || from < 0 || to < 0 || from >= order.length || to >= order.length) {
    return order;
  }
  const next = order.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
