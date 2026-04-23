import type { LogLevel } from "../types";

const LEVEL_STYLES: Record<LogLevel, { bg: string; text: string; dot: string }> = {
  fatal: { bg: "#3d0000", text: "#ff6b6b", dot: "#ff3333" },
  error: { bg: "#2d1a00", text: "#ff9944", dot: "#ff7700" },
  warn:  { bg: "#2d2a00", text: "#ffe066", dot: "#ffd700" },
  info:  { bg: "#00202d", text: "#66d9ff", dot: "#00bfff" },
  debug: { bg: "#1a1a2e", text: "#a78bfa", dot: "#8b5cf6" },
  trace: { bg: "#1a1a1a", text: "#888888", dot: "#555555" },
};

export function LevelBadge({ level }: { level: LogLevel }) {
  const s = LEVEL_STYLES[level] ?? LEVEL_STYLES.trace;
  return (
    <span style={{
      background:    s.bg,
      color:         s.text,
      padding:       "1px 7px",
      borderRadius:  "3px",
      fontSize:      "11px",
      fontWeight:    700,
      fontFamily:    "monospace",
      letterSpacing: "0.05em",
      whiteSpace:    "nowrap",
      border:        `1px solid ${s.dot}33`,
    }}>
      {level.toUpperCase()}
    </span>
  );
}