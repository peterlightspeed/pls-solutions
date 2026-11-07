// Light/dark theme. First visit follows the system preference; after the person picks one, that choice wins.
// The same logic runs early in index.html to avoid a flash of the wrong theme.
const KEY = "pls.theme";
const COLORS = { dark: "#070b1a", light: "#f6f8fc" };
const query = () => window.matchMedia("(prefers-color-scheme: light)");

export function storedTheme() {
  try {
    const t = localStorage.getItem(KEY);
    return t === "light" || t === "dark" ? t : null;
  } catch {
    return null;
  }
}

export const systemTheme = () => (query().matches ? "light" : "dark");
export const currentTheme = () => (document.documentElement.dataset.theme === "light" ? "light" : "dark");

function paint(theme) {
  document.documentElement.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", COLORS[theme]);
}

// Person's explicit choice: remembered.
export function applyTheme(theme) {
  paint(theme);
  try { localStorage.setItem(KEY, theme); } catch { /* storage unavailable */ }
}

// Call once at startup: follows later system changes until the person makes a choice.
export function watchSystemTheme() {
  const q = query();
  const onChange = () => { if (!storedTheme()) paint(systemTheme()); };
  q.addEventListener("change", onChange);
  return () => q.removeEventListener("change", onChange);
}
