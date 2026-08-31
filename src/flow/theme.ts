export type FlowTheme = 'dark' | 'light';

const KEY = 'flow.theme';

export const THEME_CANVAS: Record<FlowTheme, string> = {
  dark: '#0b0b0c',
  light: '#f3f3ef',
};

export function readTheme(): FlowTheme {
  try {
    return localStorage.getItem(KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function writeTheme(theme: FlowTheme) {
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* ignore */
  }
}
