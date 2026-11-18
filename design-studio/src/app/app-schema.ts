import {
  defineToolcraft,
  mediaSourceModule,
  timelineModule,
} from "@/toolcraft/runtime";

import appDefaults from "./app-defaults.json" with { type: "json" };
import { appIdentity } from "./app-identity";
import { EXPIRING_CARD_CANVAS } from "./expiring-card/scene-bounds";

export const appSchema = defineToolcraft({
  defaults: appDefaults,
  base: {
    canvas: {
      enabled: true,
      size: EXPIRING_CARD_CANVAS,
      upload: true,
    },
    identity: appIdentity,
    panels: {
      controls: {
        sections: [
          {
            id: "expiring-card",
            title: "Card",
            controls: {
              headline: {
                applicability: { mode: "always" },
                defaultValue: "Expiring soon",
                label: "Headline",
                target: "card.headline",
                textValueKind: "single-line",
                type: "text",
              },
              message: {
                applicability: { mode: "always" },
                defaultValue: "You may want to check your wallet soon.",
                label: "Message",
                target: "card.message",
                textValueKind: "multiline",
                type: "text",
              },
              date: {
                applicability: { mode: "always" },
                defaultValue: "38th May",
                label: "Date",
                target: "card.date",
                textValueKind: "single-line",
                type: "text",
              },
            },
          },
        ],
        title: "Controls",
      },
    },
    toolbar: {
      history: true,
      radar: true,
      zoom: true,
    },
  },
  modules: [
    mediaSourceModule(),
    timelineModule({ defaultDurationSeconds: 8, mode: "playback" }),
  ],
});
