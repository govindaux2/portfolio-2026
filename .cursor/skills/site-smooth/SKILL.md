---
name: site-smooth
description: >-
  Keep portfolio-2026 fast, stable, and easy to find. Use when changing
  the hero, shaders, 3D, home performance, deploy, SEO, or when the page
  jitters / feels heavy. Update this skill when a new perf rule is learned.
---

# Site smooth

Living checklist for this site. **Edit this file** when we learn a new constraint. Then refactor to match.

## Why the hero jittered (2026-09)

Stacked `shaders/react` on the hero (LinearGradient + MeshGradient + Aurora + animated FilmGrain + Vignette). That is a second WebGPU engine on first paint, plus grain that sparkles every frame. It fought R3F later on the page.

**Fix we shipped:** one `ShaderPlane` (R3F quad, `dpr` ≤ 1.25, loop off when hidden/offscreen) and a 3-octave `heroFrag`. No grain. No Aurora on home LCP.

## Do

- Hero = `Hero.tsx` + `ShaderPlane` + `heroFrag` only
- Small 3D on Home uses the same React Three Fiber canvas as the hero. Do not add the `shaders` package (WebGPU). It was a second engine, about 709 KB gzip, and it loaded with Home.
- Lab full-viewport studies (`/lab/loop`) use **one** R3F canvas, `dpr` ≤ 1.25, pause offscreen and when the tab is hidden. Never a second WebGL canvas for the figure.
- Hard-edged figures: `antialias: true` (MSAA). Do not raise DPR to sharpen.
- Do not fade the main headline off-screen. Do not drive a fullscreen shader with per-frame `getBoundingClientRect` or ScrollTrigger on `html { scroll-behavior: smooth }`.
- Prefer slower `uTime`, fewer fbm octaves, softer veins
- Title/description in `index.html` match the visible hero
- `public/robots.txt` stays `Allow: /`

## Do not

- Add the `shaders` package, or import it from Home
- Add Lottie or a new shader library to Home. The shader studies below the hero start only when that section is near the screen.
- Animate full-screen grain
- Leave `console` errors or blank Suspense on `/`

## When it feels slow again

1. Count WebGL/WebGPU canvases on the route
2. Confirm each uses `useLiveGl` (offscreen + hidden tab)
3. Remove the newest layer before tuning numbers
4. Add the lesson to this skill (short bullet)

## Lessons

- 2026-10: the `shaders` package on the home 3D stage was about 709 KB gzip and downloaded with the first page. Home 3D now uses the hero’s WebGL stack, and that canvas waits until the section is near the screen.
- 2026-10: home entrances are a slow opacity rise (about 2s, 6px) on `--ease-quiet`. The snappy `--ease-out` makes a fade feel like a flash. No blur and no sheen on text — those jitter. Never fade `.hero-work` itself; the dark shader sits behind it, so the panel goes black. Fade the inner content and leave the section paint in place.
