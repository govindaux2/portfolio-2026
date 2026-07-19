# Checkpoint — Portfolio case studies (AI Agent UX)

**Saved:** 2026-07-19  
**Resume phrase:** “Continue from the portfolio case study checkpoint” / “Continue with M1 on Miro”

## Repo

- **GitHub:** https://github.com/govindaux2/portfolio-2026
- **Local:** `/Users/govinda/portfolio-2026` (`main` tracking `origin/main`)
- **This run branch:** `cursor/mfg-m1-thesis-6537`

## Goal

Hire as a Product Designer with core experience building UX for AI agents. Portfolio proves agent UX across three projects with clear **value delivered** + **value measured**.

## FigJam board (source of truth for **planning**)

- **URL:** https://www.figma.com/board/w9GCsW6R4c4dQ3q1mUwvAQ
- **File key:** `w9GCsW6R4c4dQ3q1mUwvAQ`
- **Team:** Govinda ux's team (`team::1454430281339094522`)
- **File name:** Portfolio Case Study Map — AI Agent UX

### Board structure (scroll / section list)

1. **Overview (top)** — North star, universal 10-section spine, per-project summary columns, limelight patterns, hiring checklist
2. **PAGE 0 — Master AI Build Route** — Full portfolio route + “START HERE TODAY”
3. **PAGE 1 — Kynderconnect AI Build Flow** — K0→K8 prompts (build 3rd)
4. **PAGE 2 — Manufacturing AI Build Flow** — M0→M8 prompts (build **first**)
5. **PAGE 3 — Nile 2.0 AI Build Flow** — N0→N8 prompts (build 2nd)
6. **PAGE 4 — Shared AI Agent UX System** — S1→S4 craft page (after 2+ case studies)

## Miro board (execution surface for phase artifacts)

- **Status:** Preferred working surface for M0→M8 outputs (per user: “Continue with m1 on Miro”)
- **Board URL:** https://miro.com/app/board/uXjVH6N3ezY=/?share_link_id=31391533379
- **Board ID:** `uXjVH6N3ezY=`
- **Blocker (2026-07-19 cloud run):** Miro MCP server is `needsAuth`. Interactive auth is **only available in Cursor desktop IDE** — not in this mobile/cloud agent environment. Board is private (`isDirectLinkToPrivateBoard`); share link alone does not grant API access. After auth, resume and push `portfolio/mfg/M1-thesis.md` onto the Manufacturing frame.

## Projects

| Project | Narrative | Hero limelight | Build order |
|---------|-----------|----------------|-------------|
| Manufacturing Intelligence | Agentic workflow + BI + copilot; approval gates | Insight→Action + Approval/Audit | **1st** |
| Nile 2.0 | Networks + clients + daily activities | Network Triage ↔ Client Impact | **2nd** |
| Kynderconnect | Daily routines + parent loop | Draft→Review→Send parent digest | **3rd** |

## Operating rules (already agreed)

- One AI thread per project; pin the yellow “thread” card text at the top
- AI drafts → user verifies truth → then screens (no fake metrics as fact; mark unknowns `[NEED INPUT]`)
- Phase outputs go in folders: `/portfolio/mfg`, `/nile`, `/kynder`, `/system` (one markdown per phase) **and** mirrored to Miro when MCP is available
- Value template: *For [persona], the agent [does job], so they [outcome]. Measured by [metric/proxy]…*

## Where we left off

- Planning board + detailed AI build routes are **done** on FigJam
- **Repo:** draft **M1 thesis** written at `portfolio/mfg/M1-thesis.md` (from planning locks only; metrics still `[NEED INPUT]`)
- **Repo:** `portfolio/mfg/M0-source-dump.md` is a placeholder — real M0 dump not yet captured
- **Miro board URL captured:** https://miro.com/app/board/uXjVH6N3ezY=/?share_link_id=31391533379
- **Miro write still blocked:** MCP `needsAuth` (desktop Cursor only); private board not readable via share link alone
- **Next action:**
  1. Authenticate **Miro** MCP in Cursor **desktop**
  2. Agent: `context_explore` board → place M1 doc from `portfolio/mfg/M1-thesis.md`
  3. Complete / verify **M0** on Miro → reconcile into `M0-source-dump.md`
  4. Lock **M1** on Miro (thesis + value + measurement)
  5. Only then continue **M2→M8**

## Suggested resume steps for the agent

1. Confirm Miro MCP is authenticated; `context_explore` the board
2. Place M1 document (and stickies if useful) in the Manufacturing frame
3. Help user lock thesis checklist in `M1-thesis.md`
4. Do not redesign the whole board unless asked; execute the phase prompts
5. Do not invent production metrics

## Related local asset

- Lottie / screens dump may exist at `lottie/All-screens.json` (not yet mapped into case studies)
