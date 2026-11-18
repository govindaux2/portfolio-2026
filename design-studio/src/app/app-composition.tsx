import { composeToolcraftApp } from "@/toolcraft/runtime/react";

import { appSchema } from "./app-schema";
import { ExpiringCard } from "./expiring-card/expiring-card";
import { expiringCardBounds } from "./expiring-card/scene-bounds";

export const appComposition = composeToolcraftApp(appSchema, {
  scene: {
    canvasContent: <ExpiringCard />,
    renderDefaultCanvasMedia: false,
    sceneBoundsProvider: () => expiringCardBounds(),
  },
});
