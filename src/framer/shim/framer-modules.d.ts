declare module 'framer' {
  export const ControlType: Record<string, string>
  export function addPropertyControls(component: unknown, controls: unknown): void
  export const RenderTarget: {
    canvas: string
    export: string
    thumbnail: string
    preview: string
    current: () => string
    hasRestrictions: () => boolean
  }
  export function isStaticRenderer(): boolean
  export function useIsStaticRenderer(): boolean
  export function addFonts(component: unknown, fonts: unknown): void
  export function withCSS<T>(component: T): T
}
