import { useState } from "react";
import type { SearchParams, UserRole } from "../types";

interface Props {
  onSearch:  (p: Partial<SearchParams>) => void;
  onClear:   () => void;
  role:      UserRole;
}

function FilterInput({ label, value, onChange, placeholder }: {
  label: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <label style={{ fontSize: "10px", color: "#555", fontFamily: "monospace", letterSpacing: "0.1em" }}>{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ background: "#0d1117", border: "1px solid #21262d", borderRadius: "4px", padding: "5px 8px", color: "#c9d1d9", fontFamily: "monospace", fontSize: "12px", outline: "none", width: "100%" }}
        onFocus={e => { e.target.style.borderColor = "#3b82f6"; }}
        onBlur={e  => { e.target.style.borderColor = "#21262d"; }}
      />
    </div>
  );
}

export function Sidebar({ onSearch, onClear, role }: Props) {
  const [q,          setQ]          = useState("");
  const [level,      setLevel]      = useState("");
  const [resourceId, setResourceId] = useState("");
  const [traceId,    setTraceId]    = useState("");
  const [from,       setFrom]       = useState("");
  const [to,         setTo]         = useState("");
  const [regexMode,  setRegexMode]  = useState(false);

  const activeCount = [q, level, resourceId, traceId, from, to].filter(Boolean).length;

  const handleSearch = () => {
    onSearch({
      q:             q          || undefined,
      level:         level      || undefined,
      resourceId:    resourceId || undefined,
      traceId:       traceId    || undefined,
      timestampFrom: from       || undefined,
      timestampTo:   to         || undefined,
      regex:         regexMode  || undefined,
    });
  };

  const handleClear = () => {
    setQ(""); setLevel(""); setResourceId("");
    setTraceId(""); setFrom(""); setTo(""); setRegexMode(false);
    onClear();
  };

  return (
    <div style={{ width: "240px", flexShrink: 0, background: "#0d1117", borderRight: "1px solid #21262d", display: "flex", flexDirection: "column", overflow: "auto" }}>
      <div style={{ padding: "14px 14px 8px", borderBottom: "1px solid #1e1e1e" }}>
        <span style={{ fontSize: "10px", color: "#555", letterSpacing: "0.12em" }}>
          FILTERS {activeCount > 0 && (
            <span style={{ background: "#1d3250", color: "#3b82f6", padding: "0 5px", borderRadius: "8px", marginLeft: "4px" }}>
              {activeCount}
            </span>
          )}
        </span>
      </div>

      <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <FilterInput label="SEARCH" value={q} onChange={setQ} placeholder="message content..." />

        <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
          <input type="checkbox" checked={regexMode} onChange={e => setRegexMode(e.target.checked)} style={{ accentColor: "#3b82f6" }} />
          <span style={{ fontSize: "10px", color: "#555", fontFamily: "monospace", letterSpacing: "0.1em" }}>REGEX MODE</span>
        </label>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "10px", color: "#555", fontFamily: "monospace", letterSpacing: "0.1em" }}>LEVEL</label>
          <select
            value={level}
            onChange={e => setLevel(e.target.value)}
            style={{ background: "#0d1117", border: "1px solid #21262d", borderRadius: "4px", padding: "5px 8px", color: "#c9d1d9", fontFamily: "monospace", fontSize: "12px", outline: "none" }}
          >
            <option value="">all levels</option>
            {["fatal","error","warn","info","debug","trace"].map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        <FilterInput label="RESOURCE ID" value={resourceId} onChange={setResourceId} placeholder="server-1234" />
        <FilterInput label="TRACE ID"    value={traceId}    onChange={setTraceId}    placeholder="abc-xyz-123" />

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "10px", color: "#555", fontFamily: "monospace", letterSpacing: "0.1em" }}>DATE RANGE</label>

<input
  type="datetime-local"
  onChange={e => {
    if (e.target.value) {
      setFrom(new Date(e.target.value).toISOString());
    } else {
      setFrom("");
    }
  }}
  style={{
    background: "#0d1117", border: "1px solid #21262d",
    borderRadius: "4px", padding: "5px 8px",
    color: "#c9d1d9", fontFamily: "monospace", fontSize: "11px",
    outline: "none", colorScheme: "dark", width: "100%",
  }}
/>

<input
  type="datetime-local"
  onChange={e => {
    if (e.target.value) {
      setTo(new Date(e.target.value).toISOString());
    } else {
      setTo("");
    }
  }}
  style={{
    background: "#0d1117", border: "1px solid #21262d",
    borderRadius: "4px", padding: "5px 8px",
    color: "#c9d1d9", fontFamily: "monospace", fontSize: "11px",
    outline: "none", colorScheme: "dark", width: "100%",
  }}
/>
        </div>

        <button onClick={handleSearch} style={{ background: "#1d3250", border: "1px solid #3b82f6", borderRadius: "4px", color: "#3b82f6", padding: "7px", fontSize: "11px", fontFamily: "monospace", letterSpacing: "0.1em", cursor: "pointer", fontWeight: 700 }}>
          SEARCH
        </button>

        {activeCount > 0 && (
          <button onClick={handleClear} style={{ background: "none", border: "1px solid #21262d", borderRadius: "4px", color: "#555", padding: "7px", fontSize: "11px", fontFamily: "monospace", letterSpacing: "0.1em", cursor: "pointer" }}>
            CLEAR
          </button>
        )}

        {/* Role badge */}
        <div style={{ marginTop: "auto", paddingTop: "12px", borderTop: "1px solid #1e1e1e" }}>
          <span style={{
            fontSize: "10px", fontFamily: "monospace", letterSpacing: "0.1em",
            color: role === "admin" ? "#f59e0b" : "#3b82f6",
            background: role === "admin" ? "#2d1f00" : "#1d3250",
            padding: "3px 8px", borderRadius: "3px",
            border: `1px solid ${role === "admin" ? "#f59e0b33" : "#3b82f633"}`,
          }}>
            {role.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}