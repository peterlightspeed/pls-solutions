import { useState } from "react";
import { applyTheme, currentTheme } from "./theme";

export default function ThemeToggle({ className = "" }) {
  const [theme, setTheme] = useState(currentTheme);
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button type="button" className={`theme-toggle ${className}`} aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`} onClick={() => { applyTheme(next); setTheme(next); }}>
      <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
    </button>
  );
}
