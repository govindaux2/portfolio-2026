/** Minimal Framer runtime so pulled code components can run in Vite. */

export const ControlType = {
  Boolean: 'boolean',
  Number: 'number',
  String: 'string',
  Enum: 'enum',
  Color: 'color',
  ResponsiveImage: 'responsiveimage',
  File: 'file',
  Array: 'array',
  Slot: 'slot',
  EventHandler: 'eventhandler',
  Font: 'font',
  Transition: 'transition',
  BoxShadow: 'boxshadow',
  Link: 'link',
  Date: 'date',
  Object: 'object',
  Border: 'border',
  Cursor: 'cursor',
  Padding: 'padding',
  BorderRadius: 'borderradius',
  Gap: 'gap',
  TrackingId: 'trackingid',
} as const

export function addPropertyControls(
  _component: unknown,
  _controls: unknown,
): void {}

export const RenderTarget = {
  canvas: 'CANVAS',
  export: 'EXPORT',
  thumbnail: 'THUMBNAIL',
  preview: 'PREVIEW',
  current: () => RenderTarget.preview,
  hasRestrictions: () => false,
}

export function isStaticRenderer(): boolean {
  return false
}

export function useIsStaticRenderer(): boolean {
  return false
}

export function addFonts(_component: unknown, _fonts: unknown): void {}

export function withCSS<T>(component: T): T {
  return component
}
