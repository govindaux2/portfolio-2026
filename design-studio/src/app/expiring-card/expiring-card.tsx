import { useEffect, useRef } from "react";

import { getToolcraftTimelineLoopProgress } from "@/toolcraft/runtime";
import {
  useToolcraftDispatch,
  useToolcraftSelector,
  useToolcraftValue,
} from "@/toolcraft/runtime/react";

import styles from "./expiring-card.module.css";
import { EXPIRING_CARD_CANVAS } from "./scene-bounds";

function readText(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function stackDate(value: string): string {
  const parts = value.trim().split(/\s+/);
  if (parts.length < 2) return value;
  return `${parts[0]}\n${parts.slice(1).join(" ")}`;
}

export function ExpiringCard() {
  const dispatch = useToolcraftDispatch();
  const started = useRef(false);
  const headline = readText(useToolcraftValue("card.headline"), "Expiring soon");
  const message = readText(
    useToolcraftValue("card.message"),
    "You may want to check your wallet soon.",
  );
  const date = readText(useToolcraftValue("card.date"), "38th May");
  const progress = useToolcraftSelector((state) =>
    getToolcraftTimelineLoopProgress(state.timeline),
  );

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    dispatch({ isPlaying: true, type: "timeline.setPlaying" });
    dispatch({ size: EXPIRING_CARD_CANVAS, type: "canvas.setSize" });
    dispatch({ type: "canvas.zoomReset" });
    dispatch({ type: "canvas.center" });
  }, [dispatch]);

  return (
    <article
      className={styles.card}
      data-toolcraft-product-output=""
      style={{
        ["--sheen" as string]: `${-180 + progress * 460}%`,
        ["--turn" as string]: `${progress}turn`,
      }}
    >
      <h2 className={styles.headline}>{headline}</h2>
      <p className={styles.message}>{message}</p>
      <div className={styles.badge}>
        <div className={styles.hatch} />
        <div className={styles.sheen} />
        <p className={styles.date}>{stackDate(date)}</p>
      </div>
    </article>
  );
}
