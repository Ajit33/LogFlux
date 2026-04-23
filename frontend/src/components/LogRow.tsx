import type { LogEntry } from "../types";
import { LevelBadge }    from "./LevelBadge";

interface Props {
  log:      LogEntry;
  selected: boolean;
  onClick:  () => void;
  isNew?:   boolean;
}

export function LogRow({ log, selected, onClick, isNew }: Props) {
  const ts   = new Date(log.timestamp);
  const date = ts.toLocaleDateString("en-GB", { month: "short", day: "2-digit" });
  const time = ts.toLocaleTimeString("en-GB", { hour12: false });

  return (
    <div
      onClick={onClick}
      style={{
        display:             "grid",
        gridTemplateColumns: "90px 56px 130px 1fr",
        gap:                 "0 12px",
        padding:             "6px 16px",
        borderBottom:        "1px solid #1e1e1e",
        cursor:              "pointer",
        background:          selected ? "#1a2030" : isNew ? "#0d2010" : "transparent",
        borderLeft:          selected ? "2px solid #3b82f6" : isNew ? "2px solid #22c55e" : "2px solid transparent",
        transition:          "background 0.3s",
        alignItems:          "center",
      }}
      onMouseEnter={e => { if (!selected) (e.currentTarget as HTMLElement).style.background = "#111827"; }}
      onMouseLeave={e => { if (!selected) (e.currentTarget as HTMLElement).style.background = isNew ? "#0d2010" : "transparent"; }}
    >
      <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#555", whiteSpace: "nowrap" }}>
        <span style={{ color: "#444", display: "block" }}>{date}</span>
        <span>{time}</span>
      </span>
      <span><LevelBadge level={log.level} /></span>
      <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#666", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {log.resourceId}
      </span>
      <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#c9d1d9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {log.message}
      </span>
    </div>
  );
}