---
name: figma-1to1
description: >-
  Copy Figma Prototype frames to selectable HTML at 1:1 pixel size, catalog
  bits that cannot be 1:1, wrap each export in studio controls. Use when
  bringing Figma screens into the portfolio, NDLA case study, prototypes,
  design-to-code, or when the user wants exact Figma, reusable components, or
  studio resize.
---

# Figma 1:1 export

Copy **Prototype frames with text + auto-layout**. Never invent UI. Never use a 16:9 slide screenshot as the source of a working screen.

## Source

| In Figma | What you get | Do |
|---|---|---|
| Frame with text layers, auto-layout | HTML | `get_design_context` on **that** frame |
| Layer named Screenshot / image fill | Pixels only | Do not fake the form. List it on the bits board |
| Instance of a real component | HTML from that instance | Reuse one component |

Point at the Prototype page (e.g. Personal info `1:4606`, Unfreeze `1:6094`), not the case-study slide.

## Fit

- Phone frames stay **393×852** (or the node’s exact W×H). Do not scale unless studio does.
- Icons: Figma `size-[24px]` → `width={24} height={24}` **and** CSS that cannot Fill them. Never `img { width: 100% }` on a parent of the screen.
- Lock Figma copy, colors (`#4451ff` links, `red` Go back), radii, gaps.
- Status-bar Code Connect is not in this repo → simple `9:41` bar, log it on the bits board.

## When 1:1 is impossible

1. Tell the user **which bit** and **why**.
2. Recreate as a reusable component.
3. Add a card to `public/dev/figma-bits.html` with **Figma shot + coded shot** (or empty right side), date, node id. Newest first.
4. Do not silently approximate.

## Studio (dev only)

See skill `studio-bake`. Wrap the **figure including caption**. Open `/work/ndla?studio=1`. **Save** writes `src/dev/studio-layout.json` so the agent can bake CSS. localStorage is not the live layout.

## After each export

- **1:1 / Rebuild / Screenshot** + bits board `/dev/figma-bits.html`
