export {}

declare global {
  const GPUTextureUsage: {
    readonly COPY_SRC: number
    readonly COPY_DST: number
    readonly TEXTURE_BINDING: number
    readonly STORAGE_BINDING: number
    readonly RENDER_ATTACHMENT: number
  }

  interface HTMLCanvasElement {
    getContext(contextId: 'webgpu'): GPUCanvasContext | null
  }
}
