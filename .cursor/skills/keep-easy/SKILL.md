---
name: keep-easy
description: >-
  Keep this designer-owned portfolio reusable, fast, easy to deploy, and
  hard to break — without blocking visual experiments. Use when adding
  pages, labs, heroes, shaders, 3D, tuners, motion, routing, or deploy,
  or when Govinda asks to save a pattern, reduce errors, or keep things
  easy to maintain.
---

# Keep easy

Govinda is a **UI designer**, not a developer. Build the look first. Then ask before turning it into a shared system.

Plain English in chat. No jargon without a five-word gloss.

## Always

- One public path: `npm install && npm run build` must work. No new packages for a flourish.
- Lazy routes use the existing `Suspense` fallback. A GL crash must not white-screen the page.
- Pause WebGL when offscreen **and** when the tab is hidden (`useLiveGl`). Cap `dpr` at 1.25.
- Silhouettes / hard edges: turn on **MSAA** (`antialias: true`). Do not raise DPR.
- Never `getBoundingClientRect` inside a 60fps loop. Never fade the main line off-screen to “reveal” it.
- Prefer CSS + existing GLSL. Follow `site-smooth` for GPU budget.
- If it jitters: remove the newest layer. Do not add a second canvas.

## Experiment first, extract second

Do **not** block a new visual. Ship the lab. Then say this in chat, once:

> This will show up again. I can save it as a shared piece so the next page stays fast and copy-paste-free. Want me to?

Ask when **any** of these is true:

| Signal | Save as |
| --- | --- |
| Same tuner / lock / copy JSON on a second page | shared controls + params helper |
| Second full-viewport GL scene | one canvas recipe (`useLiveGl` + capped dpr + MSAA if a figure) |
| Same pause/hide/dpr logic copied | hook, not a duplicate |
| A look they locked and liked | named preset (JSON), not a rewrite |
| A second deploy gotcha | bullet in `AGENTS.md` **and** this skill |

Never extract on the first try unless they asked.

## Do not limit the work

Shared pieces are **defaults**, not walls. A lab may break a default (color, copy, motion) as long as it does not break deploy, home LCP, or the one-canvas rule.

## Deploy and errors

- No secrets, MCP, or extra GPU APIs on first paint.
- After a visual change: `npm run lint` on touched files. Fix console errors you introduced.
- Blank lazy route → they skipped `npm install` or need a hard refresh. Write that in `AGENTS.md`, do not “fix” it with a new library.
- Update `AGENTS.md` when you add a route or a gotcha.

## Growing this skill

When we learn a constraint the hard way, add a **short** bullet here and in `.cursor/skills/site-smooth/SKILL.md` if it is GPU. Then match the code to it.

### Lessons

- `/lab/loop` (2026-09): ScrollTrigger + `scroll-behavior: smooth` + fading the headline made scroll feel stepped. Copy stays on first paint. Depth is mouse + a cheap shader, not a long pin.
- `/lab/loop`: Measuring the well every frame made the hole hitch. Drive the hole from `circleSize` + pointer refs.
- Silhouette on a bright well looked crunchy with `antialias: false`. MSAA on, DPR still 1.25.
- The `shaders` package (a second graphics engine) cost ~709 KB gzip on Home. Small 3D uses the hero’s existing WebGL stack.
- Project pages share one section control: drag a row to reorder, eye icon to hide. No up/down text buttons.
