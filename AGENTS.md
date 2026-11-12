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

- `/` — home page (`src/pages/Home.tsx`)
- `/prototypes/:slug` — internal case study page; the only internal prototype is `ledgerline` (`/prototypes/ledgerline`). Other prototypes in `src/data/work.ts` are external (`href`) links.
- `/lab/glass` and `/lab/glass/v1` — "Glass Lab" experiment pages.
- `/flow` — "Flow" workflows list; `/flow/:id` — free-flowing node canvas editor (drag cards, connect them, attach images). Built on `@xyflow/react` (React Flow), lazy-loaded. Workflows are saved to browser `localStorage` (key `flow.workflows.v1`) via `src/flow/storage.ts` — there is no backend, so data is per-browser and does not sync across devices.

### Working preferences

- Do not create screen recordings unless they are genuinely necessary to prove a change (e.g. a tricky visual/interaction fix). Prefer skipping recordings otherwise.
- Standalone HTML is a local file, for every agent. Put it in `local/<topic>/` with a `README.md` in that folder (purpose, who it is for, date, how to open the file with no server, and what each file is), and add a row to `local/README.md`. Do not put it in `public/`, do not add a Vite route, and do not leave it only on the cloud machine. Do not replace the repo-root `index.html`. The older root `design-system-*.html` files stay put because they link to each other by filename. The same rule is in `.cursor/rules/local-html.mdc`.

### Non-obvious notes

- `three.js` / React Three Fiber is lazy-loaded and produces a large chunk (~234 KB gzip). The `vite build` output warns about chunks larger than 500 KB and prints a direct-`eval` warning originating from the `lottie-web` dependency — both are expected and not build failures.
- At runtime the console shows non-critical `THREE.Clock` deprecation warnings and WebGL-related warnings from the 3D/shader sections. These do not affect rendering.
- The repo root contains many standalone `*.html` design-system files (e.g. `design-system-*.html`, `Agent-UI.html`); these are static references, not part of the Vite build.
