# Hidden for now

Nothing in this list is deleted. The files and URLs still exist. They are off the home page and off the menu so the site shows the hero, recent work, and the three project pages. Decide later whether to bring each one back or remove it.

## Home sections below recent work

These used to render under the hero. Home now renders `Hero` only.

| Section | Was | File |
| --- | --- | --- |
| Prototypes | `#prototypes` | `src/components/Prototypes.tsx` |
| Shaders | `#shaders` | `src/components/Shaders.tsx` |
| 3D | `#three` | `src/components/ThreeWork.tsx` |
| Contact | `#contact` | `src/components/Footer.tsx` |

The old section order (including a saved order in the browser under `pageMenu.home.v1`) lives in `src/pageMenu/homeSections.ts` and `src/pageMenu/useHomeSectionOrder.ts`.

## Layout menu

The floating “Layout / Home” bar is not rendered. The component is still `src/components/PageMenu.tsx`.

## Menu pages

The side menu now lists only Manufacturing Intelligence, Nile AI Assistant, and Small Business Banking. These used to be in the menu and still open if you type the address:

| Label | Address |
| --- | --- |
| NDLA | `/work/ndla` |
| NDLA B2 | `/work/ndla-b2` |
| Prototypes | `/#prototypes` |
| Shaders | `/#shaders` |
| 3D | `/#three` |
| Contact | `/#contact` |
| Flow | `/flow` and `/flow/:id` |
| Type | `/lab/type` |

## Other pages that were never in that menu

| Page | Address |
| --- | --- |
| Glass lab | `/lab/glass` |
| Glass lab v1 | `/lab/glass/v1` |
| Loop study | `/lab/loop` |
| Prototype write-ups | `/prototypes/:slug` (internal one is `/prototypes/ledgerline`) |
