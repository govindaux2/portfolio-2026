import { FULL_CROP } from './model';
import type {
  BoardPage,
  EdgeCap,
  NodeKind,
  StoredEdge,
  StoredNode,
  Workflow,
} from './types';

export const HOW_CURSOR_BUILDS_ID = 'ex-how-cursor-builds';
export const HOW_CURSOR_BUILDS_REV = 3;

const SHOT = '/flow-assets/how-cursor-builds';

const CARD_W = 280;
const CARD_H = 400;
const INSET_X = 20;
const INSET_TOP = 32;
const INSET_BOT = 24;
const STACK = 20;
const COL_W = INSET_X * 2 + CARD_W;
const COL_GAP = 36;
const ORIGIN_X = 48;
const ORIGIN_Y = 96;

function colX(i: number) {
  return ORIGIN_X + i * (COL_W + COL_GAP);
}

function cardY(row: 0 | 1) {
  return ORIGIN_Y + INSET_TOP + row * (CARD_H + STACK);
}

function frameH(rows: 1 | 2) {
  return INSET_TOP + rows * CARD_H + (rows - 1) * STACK + INSET_BOT;
}

function card(
  id: string,
  x: number,
  y: number,
  heading: string,
  text: string,
  image?: string,
  size: { w: number; h: number } = { w: CARD_W, h: CARD_H }
): StoredNode {
  return node(id, 'card', x, y, size.w, size.h, {
    heading,
    text,
    images: image ? [image] : undefined,
  });
}

function textBlock(
  id: string,
  x: number,
  y: number,
  text: string,
  size: { w: number; h: number },
  fontSize = 16
): StoredNode {
  return node(id, 'text', x, y, size.w, size.h, { text, fontSize, fontWeight: 500 });
}

function image(
  id: string,
  x: number,
  y: number,
  src: string,
  w: number,
  h: number
): StoredNode {
  return node(id, 'image', x, y, w, h, { src, crop: { ...FULL_CROP } });
}

function section(
  id: string,
  x: number,
  y: number,
  title: string,
  color: string,
  w: number,
  h: number
): StoredNode {
  return node(id, 'section', x, y, w, h, { title, color }, -10);
}

function node(
  id: string,
  type: NodeKind,
  x: number,
  y: number,
  w: number,
  h: number,
  data: StoredNode['data'],
  zIndex?: number
): StoredNode {
  return {
    id,
    type,
    position: { x, y },
    width: w,
    height: h,
    zIndex: zIndex ?? (type === 'section' ? -10 : 1),
    data,
  };
}

function edge(
  id: string,
  source: string,
  target: string,
  label = ''
): StoredEdge {
  return {
    id,
    source,
    target,
    label,
    kind: 'curved',
    startCap: 'none' as EdgeCap,
    endCap: 'arrow' as EdgeCap,
  };
}

function framed(
  col: number,
  id: string,
  title: string,
  color: string,
  rows: 1 | 2 = 2
) {
  return section(id, colX(col), ORIGIN_Y, title, color, COL_W, frameH(rows));
}

function inFrame(
  id: string,
  col: number,
  row: 0 | 1,
  heading: string,
  text: string,
  shot: string
) {
  return card(
    id,
    colX(col) + INSET_X,
    cardY(row),
    heading,
    text,
    shot
  );
}

const loopBoard: BoardPage = {
  id: 'board-loop',
  name: '1 · The loop',
  nodes: [
    textBlock(
      't-title',
      ORIGIN_X,
      28,
      'Idea → this board → Cursor → pages on this site',
      { w: 640, h: 44 },
      22
    ),
    framed(0, 's-you', 'You', '#24301c'),
    inFrame(
      'c-ideas',
      0,
      0,
      '1. Bring the idea',
      'A product or case you can feel. You do not draw every screen first.',
      `${SHOT}/step-idea.png`
    ),
    inFrame(
      'c-chat',
      0,
      1,
      '2. Talk in Cursor',
      'Describe the story in chat. Cursor maps it, then builds pages.',
      `${SHOT}/step-cursor-chat.png`
    ),
    framed(1, 's-flow', 'This Flow app', '#1e2430'),
    inFrame(
      'c-map',
      1,
      0,
      '3. The board is the spec',
      'Frames, cards, pictures, arrows. That is the flow — not a slide.',
      `${SHOT}/shot-flow-loop.png`
    ),
    inFrame(
      'c-pieces',
      1,
      1,
      '4. Find it under Workflows',
      'This example is “How Cursor builds here.” Three boards in one file.',
      `${SHOT}/shot-flow-list.png`
    ),
    framed(2, 's-cursor', 'Cursor', '#2d2218'),
    inFrame(
      'c-files',
      2,
      0,
      '5. Cursor writes files',
      'It cannot drag the dots. It writes JSON + images. Flow shows the map.',
      `${SHOT}/step-cursor-files.png`
    ),
    inFrame(
      'c-images',
      2,
      1,
      '6. Pictures in public/',
      'Save shots in public/flow-assets/<slug>/ and point the card at that path.',
      `${SHOT}/step-public-assets.png`
    ),
    framed(3, 's-site', 'This website', '#301818'),
    inFrame(
      'c-proto',
      3,
      0,
      '7. Then it implements',
      'Real pages: /prototypes/…, case studies. The map stays the source of truth.',
      `${SHOT}/shot-ndla-case.png`
    ),
    inFrame(
      'c-back',
      3,
      1,
      '8. You check it here',
      'Walk the frames, then open the page. If the map is wrong, fix the map.',
      `${SHOT}/shot-flow-loop.png`
    ),
    textBlock(
      't-rule',
      ORIGIN_X,
      ORIGIN_Y + frameH(2) + 28,
      'The board is what we agree on. Code comes after. A screen that is not on the map is a guess.',
      { w: colX(3) + COL_W - ORIGIN_X, h: 48 },
      16
    ),
  ],
  edges: [
    edge('e1', 'c-ideas', 'c-map', ''),
    edge('e2', 'c-map', 'c-files', ''),
    edge('e3', 'c-files', 'c-proto', ''),
  ],
};

const promptBoard: BoardPage = {
  id: 'board-prompt',
  name: '2 · Paste this in Cursor',
  nodes: [
    textBlock(
      't-prompt-label',
      ORIGIN_X,
      28,
      'Paste the prompt. Then say the short line. Stop until the map looks right.',
      { w: 560, h: 44 },
      18
    ),
    section(
      's-prompt',
      ORIGIN_X,
      ORIGIN_Y,
      'Prompt',
      '#24301c',
      520,
      frameH(2)
    ),
    image(
      'img-paste',
      ORIGIN_X + INSET_X,
      cardY(0),
      `${SHOT}/step-prompt-paste.png`,
      480,
      220
    ),
    textBlock(
      't-prompt',
      ORIGIN_X + INSET_X,
      cardY(0) + 236,
      [
        'We are in portfolio-2026. Flow boards live at /flow.',
        '',
        'Turn my idea into (1) a Flow workflow, then (2) pages on this site — only after I say the map is right.',
        '',
        'Use only: Frame, Card, Text, Image, Link, Connector.',
        'Do not invent screens off the map. Do not code prototypes until I say so.',
        'If I only have an idea: 3–8 frames, cards inside, arrows left to right, no overlap.',
      ].join('\n'),
      { w: 480, h: 340 },
      15
    ),
    section(
      's-say',
      ORIGIN_X + 520 + COL_GAP,
      ORIGIN_Y,
      'What you type',
      '#1e2430',
      COL_W,
      frameH(2)
    ),
    card(
      'c-say-1',
      ORIGIN_X + 520 + COL_GAP + INSET_X,
      cardY(0),
      'First message',
      '“Map a 4-step apply flow. Landing, amount, offer, success. Then stop.”',
      `${SHOT}/step-short-ask.png`
    ),
    card(
      'c-say-2',
      ORIGIN_X + 520 + COL_GAP + INSET_X,
      cardY(1),
      'When the board is right',
      '“Board is good. Build /prototypes/apply from it. Do not add steps.”',
      `${SHOT}/step-build-ok.png`
    ),
  ],
  edges: [edge('e-prompt-say', 't-prompt', 'c-say-1', 'then say')],
};

const APPLY_W = 260;
const APPLY_GAP = 28;
const APPLY_INSET = 24;
const applyX = (i: number) =>
  ORIGIN_X + APPLY_INSET + i * (APPLY_W + APPLY_GAP);
const applyFrameW =
  APPLY_INSET * 2 + 4 * APPLY_W + 3 * APPLY_GAP;

const exampleBoard: BoardPage = {
  id: 'board-example',
  name: '3 · Example map',
  nodes: [
    textBlock(
      't-ex',
      ORIGIN_X,
      28,
      'What the map looks like when Cursor is done — before any prototype code.',
      { w: 640, h: 44 },
      18
    ),
    section(
      's-apply',
      ORIGIN_X,
      ORIGIN_Y,
      'Apply',
      '#1e2430',
      applyFrameW,
      INSET_TOP + CARD_H + INSET_BOT
    ),
    card(
      'ex-land',
      applyX(0),
      ORIGIN_Y + INSET_TOP,
      'Landing',
      'Why this exists. One line of proof. Get started.',
      '/case/ndla/ui-landing.png',
      { w: APPLY_W, h: CARD_H }
    ),
    card(
      'ex-amount',
      applyX(1),
      ORIGIN_Y + INSET_TOP,
      'Amount',
      'Pick a number. Leave the rest of the form for later.',
      '/case/ndla/ui-amount.png',
      { w: APPLY_W, h: CARD_H }
    ),
    card(
      'ex-offer',
      applyX(2),
      ORIGIN_Y + INSET_TOP,
      'Offer',
      'Limit, APR, or decline. One decision first.',
      '/case/ndla/ui-offer.png',
      { w: APPLY_W, h: CARD_H }
    ),
    card(
      'ex-done',
      applyX(3),
      ORIGIN_Y + INSET_TOP,
      'Success',
      'You are in. Next: activate, or wait for the card.',
      '/case/ndla/screens/success.png',
      { w: APPLY_W, h: CARD_H }
    ),
    textBlock(
      't-ex-note',
      ORIGIN_X,
      ORIGIN_Y + INSET_TOP + CARD_H + INSET_BOT + 24,
      'Four cards, three arrows, a screenshot on each. Extra screens stay off the board.',
      { w: 640, h: 44 },
      15
    ),
  ],
  edges: [
    edge('ex-e1', 'ex-land', 'ex-amount'),
    edge('ex-e2', 'ex-amount', 'ex-offer'),
    edge('ex-e3', 'ex-offer', 'ex-done'),
  ],
};

export function howCursorBuildsWorkflow(): Workflow {
  const now = Date.parse('2026-08-22T15:00:00Z');
  return {
    id: HOW_CURSOR_BUILDS_ID,
    name: 'How Cursor builds here',
    createdAt: now,
    updatedAt: now,
    pages: [loopBoard, promptBoard, exampleBoard],
  };
}
