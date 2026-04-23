import type { LogEntry } from "../types";
import { LogRow }        from "./LogRow";
import { Pagination }    from "./Pagination";

interface Props {
  logs:       LogEntry[];
  total:      number;
  page:       number;
  pages:      number;
  loading:    boolean;
  error:      string | null;
  newIds:     Set<string>;
  selected:   LogEntry | null;
  onSelect:   (log: LogEntry | null) => void;
  onPage:     (p: number) => void;
}

export function LogTable({ logs, total, page, pages, loading, error, newIds, selected, onSelect, onPage }: Props) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Column headers */}
      <div style={{ display: "grid", gridTemplateColumns: "90px 56px 130px 1fr", gap: "0 12px", padding: "8px 16px", borderBottom: "1px solid #21262d", background: "#0d1117", flexShrink: 0 }}>
        {["TIMESTAMP", "LEVEL", "RESOURCE", "MESSAGE"].map(h => (
          <span key={h} style={{ fontSize: "10px", color: "#444", fontFamily: "monospace", letterSpacing: "0.1em" }}>{h}</span>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{ margin: "20px", padding: "12px 16px", background: "#2d1a00", border: "1px solid #ff7700", borderRadius: "4px", color: "#ff9944", fontFamily: "monospace", fontSize: "12px" }}>
          ⚠ {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && logs.length === 0 && (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#333", fontFamily: "monospace", fontSize: "13px", flexDirection: "column", gap: "8px" }}>
          <span style={{ fontSize: "24px" }}>∅</span>
          <span>no logs match your filters</span>
        </div>
      )}

      {/* Rows */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {logs.map((log, i) => (
          <LogRow
            key={log.id ?? i}
            log={log}
            selected={selected?.id === log.id}
            isNew={newIds.has(log.id ?? "")}
            onClick={() => onSelect(selected?.id === log.id ? null : log)}
          />
        ))}
      </div>

      {/* Pagination */}
      <Pagination page={page} pages={pages} total={total} onPage={onPage} />
    </div>
  );
}