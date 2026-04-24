import { useTheme } from "../hooks/useTheme";

export function ThemeToggle(): JSX.Element {
  const { mode, toggleTheme } = useTheme();

  return (
    <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label="Toggle theme">
      <span>{mode === "dark" ? "🌙 Dark" : "☀️ Light"}</span>
    </button>
  );
}
