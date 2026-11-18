import type { ToolcraftSceneRect } from "@/toolcraft/runtime";

export const EXPIRING_CARD_WIDTH = 380;
export const EXPIRING_CARD_HEIGHT = 191;
export const EXPIRING_CARD_CANVAS = {
  height: 280,
  unit: "px",
  width: 480,
} as const;

export function expiringCardBounds(): readonly ToolcraftSceneRect[] {
  return [
    {
      height: EXPIRING_CARD_HEIGHT,
      width: EXPIRING_CARD_WIDTH,
      x: -EXPIRING_CARD_WIDTH / 2,
      y: -EXPIRING_CARD_HEIGHT / 2,
    },
  ];
}
