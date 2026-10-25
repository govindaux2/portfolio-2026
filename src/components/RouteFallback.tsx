const cells = Array.from({ length: 16 }, (_, index) => {
  const column = index % 4;
  const row = Math.floor(index / 4);
  return column + row;
});

export function RouteFallback() {
  return (
    <div className="route-fallback" role="status" aria-live="polite" aria-label="Loading">
      <span className="load-mark" aria-hidden="true">
        {cells.map((wave, index) => (
          <span key={index} style={{ animationDelay: `${wave * 0.07}s` }} />
        ))}
      </span>
    </div>
  );
}
