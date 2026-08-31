---
name: studio-bake
description: >-
  Bake NDLA / portfolio studio layout into real CSS, restore a snapshot, or
  wrap a selected section in ExportStudio with alignment guides. Use when the
  user says bake, save the view, apply studio, wrap this section, or asks how
  live layout is saved.
---

# Studio bake (lightweight)

Studio is a **dev playground**. It never is the live site.

## How changes get captured

1. User opens `/work/ndla?studio=1` on **any browser** hitting this machine’s Vite (`localhost:5173`).
2. They drag / scale. **Save** writes `src/dev/studio-layout.json` via `/__studio`.
3. You **read that file**. You do not guess. You cannot see another computer’s localStorage.
4. **Bake** means write CSS (or inline style on a class) so production matches `current` without `?studio=1`.

If the JSON is empty, tell them to hit Save in the studio dock first.

## Bake

- Read `src/dev/studio-layout.json` → `current`.
- For each id (`unfreeze-personal`, `unfreeze-steps`, `iter-1`, `iter-2`, …), apply `scale`, `x`, `y` as CSS on a stable class, e.g.

```css
.ndla-studio-unfreeze-personal {
  transform: translate(Xpx, Ypx) scale(S);
  transform-origin: top center;
}
```

- Do not leave live layout in `localStorage` or `?studio=1`.
- After bake, they can Reset in studio; the baked CSS stays until they ask to bake again.

## Snapshots / undo

The same JSON has `snapshots` (last 8). **Last** in the dock restores the previous Save-as-snap.

To go further back: `git log -p -- src/dev/studio-layout.json` or restore a snapshot they name.

## Wrap a section (only when asked)

Do **not** wrap every figure on the page.

When they select / name a section:

1. Wrap that **figure including caption** in `<ExportStudio id="kebab-name">`.
2. Alignment lines already show on drag inside `.ndla-fig-row-inner` in studio. Do not add extra chrome.

## Do not build

Figma auto-layout, snap-to-pixel engines, multi-user sync, or studio on production.