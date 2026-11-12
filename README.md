# Portfolio 2026

Personal portfolio showcasing clickable app prototypes, real-time GLSL shaders, and 3D work.

## Stack

- Vite + React + TypeScript
- React Three Fiber + three.js (lazy-loaded, only downloads when a GL section is near the viewport)
- GSAP + ScrollTrigger (hero line reveal, horizontal shader gallery)
- Motion / Framer Motion (scroll reveals)
- Geist Variable (self-hosted via Fontsource)

## Local HTML

Standalone pages live in [`local/`](local/README.md). They are files, not site routes. Open one by double-clicking its HTML after you pull. No server.

The Hyderabad canvas-print research is [`local/canvas-prints/index.html`](local/canvas-prints/index.html).

## Commands

```bash
npm run dev      # local dev server
npm run build    # production build to dist/
npm run preview  # serve the production build locally
```

## Adding work

- **Prototypes:** edit `src/data/work.ts`. Set `internal: true` for an in-site case page at `/prototypes/:slug` (Project 1 / Ledgerline). Otherwise use `href` for an external live prototype.
- **Shaders:** add a fragment shader to `src/components/gl/shaders.ts` and register it in the `pieces` list in `src/components/Shaders.tsx`. They render live via `ShaderPlane`.
- **3D:** `src/components/gl/ThreeStage.tsx` holds the R3F scene. Swap the placeholder sculpture for a GLTF (use draco/meshopt compression to keep it light).

## Weight budget

The initial JS payload is ~148 KB gzip (React + GSAP + Motion). three.js (~234 KB gzip) is in a separate lazy chunk and never blocks first paint. All shader canvases pause rendering when scrolled offscreen.

Things that will make it heavy if added carelessly: uncompressed GLTF models, drei helpers pulling in extra three modules, video covers instead of images.
