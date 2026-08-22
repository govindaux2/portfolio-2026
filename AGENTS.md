# AGENTS.md

## Cursor Cloud specific instructions

This is a **frontend-only** Vite + React + TypeScript single-page app (`portfolio-2026`). There is no backend, database, or external service — everything runs in the browser.

### Services / commands

Standard scripts are defined in `package.json`; run them with `npm`:

- Dev server: `npm run dev` (Vite, serves on `http://localhost:5173/`). Add `-- --host` to expose it on the VM network interface.
- Lint: `npm run lint` (oxlint, configured in `.oxlintrc.json`).
- Build: `npm run build` (`tsc -b` for type-checking, then `vite build` to `dist/`).
- Preview production build: `npm run preview`.

### Routes worth knowing (React Router)

- `/` — home page (`src/pages/Home.tsx`)
- `/prototypes/:slug` — internal case study page; the only internal prototype is `ledgerline` (`/prototypes/ledgerline`). Other prototypes in `src/data/work.ts` are external (`href`) links.
- `/lab/glass` and `/lab/glass/v1` — "Glass Lab" experiment pages.
- `/flow` — "Flow" workflows list; `/flow/:id` — free-flowing node canvas editor (drag cards, connect them, attach images). Built on `@xyflow/react` (React Flow), lazy-loaded. Workflows are saved to browser `localStorage` (key `flow.workflows.v1`) via `src/flow/storage.ts` — there is no backend, so data is per-browser and does not sync across devices.

### Working preferences

- Do not create screen recordings unless they are genuinely necessary to prove a change (e.g. a tricky visual/interaction fix). Prefer skipping recordings otherwise.

### Non-obvious notes

- `three.js` / React Three Fiber is lazy-loaded and produces a large chunk (~234 KB gzip). The `vite build` output warns about chunks larger than 500 KB and prints a direct-`eval` warning originating from the `lottie-web` dependency — both are expected and not build failures.
- At runtime the console shows non-critical `THREE.Clock` deprecation warnings and WebGL-related warnings from the 3D/shader sections. These do not affect rendering.
- The repo root contains many standalone `*.html` design-system files (e.g. `design-system-*.html`, `Agent-UI.html`); these are static references, not part of the Vite build.
