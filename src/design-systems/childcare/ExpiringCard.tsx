import styles from "./expiring-card.module.css";

type ExpiringCardProps = {
  headline?: string;
  message?: string;
  date?: string;
};

function stackDate(value: string): string {
  const parts = value.trim().split(/\s+/);
  if (parts.length < 2) return value;
  return `${parts[0]}\n${parts.slice(1).join(" ")}`;
}

export function ExpiringCard({
  headline = "Expiring soon",
  message = "You may want to check your wallet soon.",
  date = "38th May",
}: ExpiringCardProps) {
  return (
    <article className={styles.card}>
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
