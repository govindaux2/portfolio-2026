# AGENTS.md

## Cursor Cloud specific instructions

This is a **frontend-only** Vite + React + TypeScript single-page app (`portfolio-2026`). There is no backend, database, or external service — everything runs in the browser.

### Services / commands

Standard scripts are defined in `package.json`; run them with `npm`:

- Dev server: `npm run dev` (Vite, serves on `http://localhost:5173/`). Add `-- --host` to expose it on the VM network interface.
- Lint: `npm run lint` (oxlint, configured in `.oxlintrc.json`).
- Build: `npm run build` (`tsc -b` for type-checking, then `vite build` to `dist/`).
- Preview production build: `npm run preview`.

### Local development (for local agents / machines)

The repo is the shared source of truth on GitHub (`github.com/govindaux2/portfolio-2026`, default branch `main`). To run and edit it locally:

```bash
git pull                # or: git clone https://github.com/govindaux2/portfolio-2026.git
npm install             # REQUIRED after any pull that changes dependencies
npm run dev             # open http://localhost:5173/  (e.g. /flow)
```

- Gotcha: after pulling changes that add a dependency, you MUST run `npm install`. Skipping it makes lazy-loaded routes (e.g. `/flow`, which needs `@xyflow/react`) render a **blank page**, because the dynamic import fails silently under the `Suspense` fallback. A hard refresh (`Cmd/Ctrl+Shift+R`) clears any stale HMR state after switching branches.
- There is no public/deployed URL yet. `localhost` only works on the machine running `npm run dev`; it is not reachable from other devices. A hosted deploy (e.g. Vercel) is pending and requires a `VERCEL_TOKEN` secret before a cloud agent can deploy.

### Routes worth knowing (React Router)

- `/` — home page (`src/pages/Home.tsx`). Visible content is the hero only: name, write-up, and My recent work. Sections below that are hidden; see `HIDDEN.md`.
- `/work/manufacturing`, `/work/nile`, `/work/banking` — recent-work pages (`src/pages/WorkProjectPage.tsx`). Left 70% is the photo, right rail is the client and caption. One screen, no section scroll.
- `/prototypes/:slug` — internal case study page; the only internal prototype is `ledgerline` (`/prototypes/ledgerline`). Other prototypes in `src/data/work.ts` are external (`href`) links. Hidden from the menu; see `HIDDEN.md`.
- `/lab/glass` and `/lab/glass/v1` — "Glass Lab" experiment pages.
- `/lab/loop` — full-viewport “human in the loop” study (`src/pages/LoopHeroPage.tsx`). One R3F canvas. Tuner lock/copy JSON is local only (`lab.loop.params.v2`).
- `/flow` — "Flow" workflows list; `/flow/:id` — free-flowing node canvas editor (drag cards, connect them, attach images). Built on `@xyflow/react` (React Flow), lazy-loaded. Workflows are saved to browser `localStorage` (key `flow.workflows.v1`) via `src/flow/storage.ts` — there is no backend, so data is per-browser and does not sync across devices.

### Working preferences

- Do not create screen recordings unless they are genuinely necessary to prove a change (e.g. a tricky visual/interaction fix). Prefer skipping recordings otherwise.
- Govinda is a designer. Before turning a one-off lab into a shared system, ask in plain English. See `.cursor/skills/keep-easy/SKILL.md`.
- GPU / hero / jitter: `.cursor/skills/site-smooth/SKILL.md`.

### Deploy (keep this boring)

- Production is `npm run build` then host `dist/`. No extra installs, tokens, or GPU APIs on first paint.
- After adding a route, confirm it is lazy + inside the existing `Suspense` fallback in `src/App.tsx`.
- If a lazy page is blank: run `npm install`, then a hard refresh. That is not a new-library problem.

### Non-obvious notes

- `three.js` / React Three Fiber is lazy-loaded for the hero shader and any small 3D that follows (~234 KB gzip). Do not add the `shaders` package back onto Home — that second engine was ~709 KB gzip and loaded with the first page.
- Lottie stays on the NDLA case page only (`/work/ndla-b2`). The direct-`eval` warning from `lottie-web` is expected there and is not a build failure.
- At runtime the console shows non-critical `THREE.Clock` deprecation warnings and WebGL-related warnings from the 3D/shader sections. These do not affect rendering.
- The repo root contains many standalone `*.html` design-system files (e.g. `design-system-*.html`, `Agent-UI.html`); these are static references, not part of the Vite build.
