# Toolcraft App Agent Worklog

## Status

Mode: product

Active change: expiring-card

## Decision Trail

### Change ID: expiring-card

- Request: Bring Figma node 158:44 into the Design studio as a working component with animation.
- Task type: Figma implementation with playback animation.
- User-visible result: The pink expiring card sits on the canvas. Headline, message, and date are editable. The glass date hatch turns and a sheen crosses it while the timeline plays.
- Source/reference checked: Figma file 7KkhqFbHEyLqUX8UpwbVLf node 158:44. get_motion_context returned no animated nodes and the frame has no prototype reactions.
- Docs/contracts read: workflow.md, reference-study.md, runtime-boundary.md, assembly-workflow.md, timeline playback rules in the component contract.
- View interaction: non-spatial. The card is flat.
- Interaction ownership: copy is edited in the panel. The canvas shows the card and does not offer a second editor for the same words.
- Decision: Recreate the card from the Figma frame and add an 8 second forward loop. The hatch rotates one turn and the sheen crosses the badge once. First and last frames match. Playback uses the Toolcraft timeline.
- Alternatives rejected: Leaving the card still, because the request asked for animation. Inventing a Figma prototype that is not in the file.
- State/output mapping: card.headline, card.message, and card.date render on the card. Timeline progress drives the hatch rotation and the sheen.
- Checks: studio preview and focused schema coverage.
- Risks: The glass pattern is rebuilt from the frame, not a downloaded Figma pattern fill. Full delivery proof is still outstanding.

A first delivery records request, references, applied contracts, decisions, alternatives, state/output mapping, checks and risks. A later `Entry type: focused` records `Change ID`, `Request`, `Changed owner`, `User-visible result`, `Verification` and `Risks`. `Verification` describes the actual checks and their results; command mentions never authorize execution.

For a localized, user-authorized performance iteration, record only this separate domain authority in the selected entry:

```md
- Performance intent: performance-iteration
- Performance request evidence: "<verbatim exact Request quote>"
- Performance paths: ["performance-path:%5B...%5D"]
```

Missing performance intent means ordinary work. Performance evidence must be an exact nontrivial raw Request substring; paths must be unique canonical IDs. Unresolved localization creates no path authority. Run `npm run verify:delivery` for initial functional delivery or one authorized targeted iteration; full performance certification requires a separate explicit request.

## Decisions

### Renderer

- Decision: No product renderer yet.
- Reason: The starter is intentionally neutral.
- Evidence: Replace with concrete product schema, implementation and focused evidence before first delivery.

### View Interaction

- Decision: No spatial product view yet.
- Reason: The starter is intentionally neutral.
- Evidence: Replace with concrete product schema, implementation and focused evidence before first delivery.

### Interaction Ownership

- Decision: No product interaction ownership yet.
- Reason: The starter is intentionally neutral.
- Evidence: Replace with concrete product schema, implementation and focused evidence before first delivery.

### Timeline

- Decision: No product animation yet.
- Reason: The starter is intentionally neutral.
- Evidence: Replace with concrete product schema, implementation and focused evidence before first delivery.

### Layers

- Decision: No product layer workflow yet.
- Reason: The starter is intentionally neutral.
- Evidence: Replace with concrete product schema, implementation and focused evidence before first delivery.

### Controls

- Decision: No product control sections yet.
- Reason: The starter is intentionally neutral.
- Evidence: Replace with concrete product schema, implementation and focused evidence before first delivery.

### Export

- Decision: No product output yet.
- Reason: The starter is intentionally neutral.
- Evidence: Replace with concrete product schema, implementation and focused evidence before first delivery.

### Performance

- Decision: No product workload yet.
- Reason: The starter is intentionally neutral.
- Evidence: Replace with concrete product schema, implementation and focused evidence before first delivery.

Canonical control values and selected-entity isolation must follow runtime representations and the declared selection owner. Render-scale-enabled products record functional `renderScaleCoverage`; prose never substitutes for asserted backing-quality proof.

## Evidence

- Source reviewed: neutral starter schema and local Toolcraft docs.
- Contract applied: product decisions belong to the generated app; platform development history is not copied into this template.

## Verification

Protected receipts own initial/performance proof. Later edits record focused checks and text journal run IDs. Failed attempts and their retries remain separate; no screenshots, videos or binary traces are required by the journal.

## Risks

- Risk: Replace neutral decisions before first product delivery. Historical source revisions or message references that are unknown must remain explicitly unknown.
