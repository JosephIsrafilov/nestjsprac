export type ThemeMode = 'light' | 'dark';

export const THEME_KEY = 'tm_theme';

const isDarkModePreferred = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
};

export const getStoredTheme = (): ThemeMode | null => {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }

  return null;
};

export const getInitialTheme = (): ThemeMode => {
  return getStoredTheme() ?? (isDarkModePreferred() ? 'dark' : 'light');
};

export const applyTheme = (theme: ThemeMode): void => {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.setAttribute('data-theme', theme);
};

export const initializeTheme = (): ThemeMode => {
  const theme = getInitialTheme();
  applyTheme(theme);
  return theme;
};

export const setTheme = (theme: ThemeMode): void => {
  localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
};
