# M0 — Manufacturing Intelligence source dump

**Status:** Seeded with ILLUSTRATIVE dummy data (no confidential production metrics).  
**Rule:** Do not present illustrative numbers as audited production facts. Mark real gaps as `[NEED INPUT]`.

---

## Problem

Mid-size discrete manufacturer runs 3 packaging lines on shared MES + Power BI + scattered SOP wikis. After SKU changeovers, Line 3B scrap often spikes. Supervisors lose 20–40 minutes swiveling across tools to decide whether to pause. Wrong pause ≈ $4–6k/hour lost throughput; late pause wastes material and triggers quality holds.

Why agentic UX (not chatbot): the job is a multi-step decision loop across BI + workflow systems with high cost of wrong action — not Q&A.

## Personas & stakes

| Persona | Role | Stake |
|---------|------|--------|
| Priya | Line supervisor | Accountable for pause/restart; hates false alarms |
| Marco | Machine operator | Executes clear/check steps; needs short instructions |
| Aisha | Quality | Owns first-article; must not be bypassed |
| Devon | Analyst | Tunes alert rules; needs override telemetry |

## Work system (data → insight → decision → action → verify)

1. Sensors + MES events + scrap KPIs land in BI
2. Anomaly detected (e.g. scrap 2.1% → 4.8% in 47 min on Line 3B)
3. Agent correlates changeover + feeder signals → explains likely cause
4. Insight→Action card proposes playbook (pause → clear → first-article)
5. Supervisor approval + audit fields for production-impacting steps
6. Workflow Runner executes steps with pause/resume
7. Quality verify closes the loop

## My ownership (claimable)

- Agent UX for Insight→Action cards
- Multi-step Workflow Runner (progress, pause, step owners)
- Approval / Audit gate for mutate actions
- Role-aware copilot surfaces (supervisor confirm / operator execute / analyst tune)
- Trust model, empty/error/loading, recovery (override, escalate)
- Partnered with eng on tool-calling boundaries (suggest vs notify vs mutate)

Not owned: model training, plant PLC integration, raw MES schema.

## Agent / copilot capabilities

- Auto: surface anomaly, draft explanation with evidence chips, recommend playbook, notify quality after approved pause
- Approve + audit: pause/restart line, change process parameters
- Blocked: auto-restart after clear without human verify
- Always: override / ignore with reason logged

## Safety constraints

- Confidence displayed; low confidence disables Act (Investigate only)
- Stale required sensors (>5 min) downgrade Action card
- Audit stamp: who, why (reason code), risk acknowledgment, timestamp
- Quality first-article cannot be skipped by agent

## Dummy vignette (hero)

- Alert: OEE drop + scrap spike Line 3B, last 47 min
- Agent explanation: likely feeder jam after SKU changeover, confidence 72%, 3 evidence chips
- Playbook: Pause Line 3B → Clear feeder → Re-run first-article (~18 min, 4 steps)
- Gate: Supervisor confirm + reason code + scrap risk ack
- Close: scrap trending down after first-article pass

## Illustrative measurement plan (NOT production facts)

| KPI | Before (illustrative) | After (illustrative) | Notes |
|-----|----------------------|----------------------|-------|
| Time-to-insight | ~28 min | ~6 min | Shadow study direction, n≈12 incidents |
| Time-to-action | ~45 min | ~19 min | Insight → approved workflow start |
| Accept / edit / override | — | 61% / 24% / 15% | Trust + usefulness signal |
| Tool switches / task | 7–9 | 2–3 | Swivel-chair proxy |
| Rework on assisted tasks | 11% | 4% | First-article fail after guided recovery |

## Unknowns `[NEED INPUT]`

- Real plant name / NDA constraints for public portfolio naming
- Actual shipped vs prototype scope
- Any real baseline metrics you can legally cite
- Screens / Lottie assets to map to the 6 hero frames
- Exact approval roles in the real org chart

## Assets I have

- FigJam plan: Portfolio Case Study Map (PAGE 2 M0→M8)
- Miro M0 board: https://miro.com/app/board/uXjVH6N3ezY=/
- Recruiter flow canvas: `mfg-agentic-workflow-recruiter-flow.canvas.tsx`
- `[NEED INPUT]` Figma screens / Lottie mapping

## Done check

- [x] Personas & stakes
- [x] Work system mapped
- [x] Ownership boundaries
- [x] Safety constraints
- [x] Unknowns visible
- [ ] Replace illustrative metrics with any real/legal numbers when available
