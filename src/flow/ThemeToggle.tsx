import { writeTheme, type FlowTheme } from './theme';

export function ThemeToggle({
  theme,
  onChange,
  className = 'flow-theme-icon',
}: {
  theme: FlowTheme;
  onChange: (theme: FlowTheme) => void;
  className?: string;
}) {
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      className={className}
      data-tip={next === 'light' ? 'Light mode' : 'Dark mode'}
      title={next === 'light' ? 'Light mode' : 'Dark mode'}
      aria-label={next === 'light' ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => {
        onChange(next);
        writeTheme(next);
      }}
    >
      {theme === 'dark' ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <circle cx="8" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M8 1.6v1.5M8 12.9v1.5M1.6 8h1.5M12.9 8h1.5M3.2 3.2l1.1 1.1M11.7 11.7l1.1 1.1M3.2 12.8l1.1-1.1M11.7 4.3l1.1-1.1"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M13.2 9.4A5.4 5.4 0 1 1 6.6 2.8 4.3 4.3 0 0 0 13.2 9.4Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
