import type {
  ToolcraftComponentAcceptance,
  ToolcraftControlSectionInventoryEntry,
  ToolcraftProductReadiness,
  ToolcraftTransferMode,
} from "./acceptance/types";
import { appSchema } from "./app-schema";

const starterPersistenceSlices =
  appSchema.persistence.storage === "localStorage"
    ? appSchema.persistence.include
    : [];

export const appTransferMode: ToolcraftTransferMode = {
  animationIntent: {
    loopDuration: {
      evidence:
        "Figma node 158:44 has no motion tracks. The added loop is one forward turn of the date hatch plus one sheen crossing the badge, and the first frame matches the last.",
      seconds: 8,
      source: "product-derived",
    },
    mode: "timeline-playback",
  },
  mode: "new-toolcraft-app",
  referenceInputs: [],
};

export const appProductReadiness: ToolcraftProductReadiness = {
  exportIntent: {
    image: { mode: "toolcraft-default" },
    svg: { mode: "not-requested" },
    video: { mode: "not-requested" },
  },
  interactionOwnership: [],
  mode: "product",
  productName: "Expiring card",
  productSummary: "A pink wallet reminder card with a moving glass date.",
  requestedBehavior:
    "Show the Figma expiring-soon card and animate the glass date on the timeline.",
  viewInteraction: {
    mode: "non-spatial",
    reason: "The card is a flat composition with no 3D scene.",
  },
};

const cardBrowser = {
  budget: "standard",
  file: "e2e/expiring-card.spec.ts",
  testName: "browser: expiring card copy and date motion follow the timeline",
} as const;

function cardControl(
  id: string,
  target: string,
  observable: string,
): ToolcraftComponentAcceptance {
  return {
    automated: true,
    automatedTestName: "expiring card copy renders from schema values",
    browser: cardBrowser,
    componentType: "text",
    evidence: "product-output",
    expectedObservable: observable,
    fixture: "expiring card",
    id,
    kind: "control",
    target,
    userAction: "Edit the card field and look at the card on the canvas.",
  };
}

export const appAcceptance: readonly ToolcraftComponentAcceptance[] = [
  cardControl(
    "card.headline",
    "card.headline",
    "The headline on the pink card matches the Headline field.",
  ),
  cardControl(
    "card.message",
    "card.message",
    "The message on the pink card matches the Message field.",
  ),
  cardControl(
    "card.date",
    "card.date",
    "The date inside the glass badge matches the Date field.",
  ),
  {
    automated: true,
    automatedTestName: "expiring card motion follows timeline progress",
    browser: cardBrowser,
    componentType: "timeline",
    evidence: "timeline-output",
    expectedObservable:
      "The glass date hatch turns one full circle and the sheen crosses the badge once per timeline loop. Pause freezes the motion, and the first frame matches the last.",
    fixture: "expiring card playback",
    id: "timeline.playback",
    kind: "runtime",
    target: "timeline.playback",
    timelineCoverage: "playback",
    timelineLoopProof: {
      direction: "forward-only",
      durationChange: "reproved-after-edit",
      reversePlayback: "forbidden",
      seam: "first-last-match",
    },
    timelinePlaybackCoverage: [
      "pause-resume",
      "scrub",
      "duration",
      "loop",
      "rendered-frame",
    ],
    userAction:
      "Press play, pause, and scrub the timeline. The date badge motion follows that time.",
  },
  {
    automated: true,
    automatedTestName:
      "declares production reload coverage for the starter schema",
    browser: {
      budget: "extended-io",
      file: "e2e/app-persistence.spec.ts",
      testName: "browser: app restores exact canvas, values, and panel workspace slices after reload",
    },
    componentType: "persistence",
    evidence: "persistence-state",
    expectedObservable:
      "Canvas size and zoom, their runtime values, and the moved and collapsed Controls workspace remain visibly restored after a real browser reload.",
    fixture: "starter runtime persisted workspace",
    id: "persistence.reload",
    kind: "runtime",
    persistenceCoverage: "reload",
    persistenceSlices: starterPersistenceSlices,
    target: "canvas.size.width",
    userAction: "Edit Canvas width and zoom, move and collapse Controls, wait for persistence, and reload the page.",
  },
];

// Product entries use the same explicit stable section IDs as appSchema.
export const appControlSectionInventory: readonly ToolcraftControlSectionInventoryEntry[] = [
  {
    entity: "Expiring card",
    entityId: "expiring-card",
    finiteSelectors: [],
    groupingReason: "The three lines of copy on the card are edited together.",
    id: "expiring-card",
    targets: ["card.headline", "card.message", "card.date"],
    title: "Card",
  },
];
