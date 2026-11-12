# Local files

Standalone HTML pages live here, in a folder per subject. They are files you open on your computer. They are not pages of the portfolio site, and they are not served from `public/`.

After you pull this repo, open a page by double-clicking its HTML file, or by dropping that file on a browser window. You do not need `npm install` or `npm run dev`.

## How a new page is added

Any agent adding a standalone HTML page:

1. Creates `local/<topic>/`.
2. Puts the HTML and its notes in that folder.
3. Writes `local/<topic>/README.md` with the purpose, who it is for, the date, how to open it, and what each file is.
4. Adds one row to the table below.

The repo-root `index.html` is the Vite app. Leave it there. The older `design-system-*.html`, `Agent-UI.html`, and `shader-flow.html` files stay at the repo root because they link to each other by filename.

## Pages

| Folder | Purpose | Open |
| --- | --- | --- |
| [canvas-prints](canvas-prints/README.md) | Research for a Hyderabad canvas-print side business: competitors, public prices, and a cost model. Read 12 November 2026. | [canvas-prints/index.html](canvas-prints/index.html) |
