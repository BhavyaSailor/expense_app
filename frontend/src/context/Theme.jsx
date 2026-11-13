import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const KEY = 'trackspense_theme';
const ThemeContext = createContext(null);
export const useTheme = () => useContext(ThemeContext);

const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    try {
      return localStorage.getItem(KEY) || 'system';
    } catch {
      return 'system';
    }
  });
  const [systemDark, setSystemDark] = useState(prefersDark);

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => setSystemDark(e.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const resolved = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;

  useEffect(() => {
    document.documentElement.dataset.theme = resolved;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', resolved === 'dark' ? '#0E131A' : '#E9EDF1');
  }, [resolved]);

  const setTheme = useCallback((next) => {
    setMode(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const toggle = useCallback(() => setTheme(resolved === 'dark' ? 'light' : 'dark'), [resolved, setTheme]);

  const value = useMemo(() => ({ mode, resolved, setTheme, toggle }), [mode, resolved, setTheme, toggle]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
