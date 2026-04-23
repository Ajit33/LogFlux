import type { LogEntry } from "../types";
import { LevelBadge }    from "./LevelBadge";

export function DetailPanel({ log, onClose }: { log: LogEntry; onClose: () => void }) {
  const fields = [
    ["level",             log.level],
    ["message",           log.message],
    ["resourceId",        log.resourceId],
    ["timestamp",         log.timestamp],
    ["traceId",           log.traceId],
    ["spanId",            log.spanId],
    ["commit",            log.commit],
    ["parentResourceId",  log.metadata?.parentResourceId],
  ].filter(([, v]) => v != null);

  return (
    <div style={{ width: "380px", flexShrink: 0, background: "#0d1117", borderLeft: "1px solid #21262d", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #21262d", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#666", letterSpacing: "0.1em" }}>LOG DETAIL</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "16px", padding: "2px 6px" }}>×</button>
      </div>

      <div style={{ padding: "16px 16px 8px" }}>
        <LevelBadge level={log.level} />
      </div>

      <div style={{ overflowY: "auto", flex: 1, padding: "0 16px 16px" }}>
        {fields.map(([key, value]) => (
          <div key={key as string} style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "10px", color: "#555", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: "3px" }}>
              {(key as string).toUpperCase()}
            </div>
            <div style={{ fontSize: "12px", color: "#c9d1d9", fontFamily: "monospace", wordBreak: "break-all", background: "#161b22", padding: "6px 10px", borderRadius: "4px", border: "1px solid #21262d" }}>
              {String(value)}
            </div>
          </div>
        ))}

        <div style={{ marginTop: "16px" }}>
          <div style={{ fontSize: "10px", color: "#555", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: "3px" }}>RAW JSON</div>
          <pre style={{ fontSize: "11px", color: "#8b949e", fontFamily: "monospace", background: "#161b22", padding: "10px", borderRadius: "4px", border: "1px solid #21262d", overflow: "auto", margin: 0, maxHeight: "200px" }}>
            {JSON.stringify(log, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}