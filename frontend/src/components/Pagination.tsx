interface Props {
  page:    number;
  pages:   number;
  total:   number;
  onPage:  (p: number) => void;
}

export function Pagination({ page, pages, total, onPage }: Props) {
  if (pages <= 1) return null;

  // Build page numbers to show — always show first, last, current ±2
  const nums = new Set([1, pages, page, page - 1, page + 1, page - 2, page + 2]);
  const visible = [...nums].filter(n => n >= 1 && n <= pages).sort((a, b) => a - b);

  return (
    <div style={{
      padding:        "10px 16px",
      borderTop:      "1px solid #21262d",
      display:        "flex",
      alignItems:     "center",
      gap:            "6px",
      background:     "#0d1117",
      flexShrink:     0,
      flexWrap:       "wrap",
    }}>
      {/* Prev */}
      <button
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        style={btnStyle(page <= 1)}
      >← PREV</button>

      {/* Page numbers */}
      {visible.map((n, i) => {
        const prev = visible[i - 1];
        return (
          <span key={n} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            {prev && n - prev > 1 && (
              <span style={{ color: "#333", fontSize: "11px" }}>…</span>
            )}
            <button
              onClick={() => onPage(n)}
              style={{
                background:   n === page ? "#1d3250" : "none",
                border:       `1px solid ${n === page ? "#3b82f6" : "#21262d"}`,
                borderRadius: "3px",
                color:        n === page ? "#3b82f6" : "#666",
                padding:      "3px 8px",
                fontSize:     "11px",
                fontFamily:   "monospace",
                cursor:       "pointer",
                minWidth:     "28px",
              }}
            >{n}</button>
          </span>
        );
      })}

      {/* Next */}
      <button
        disabled={page >= pages}
        onClick={() => onPage(page + 1)}
        style={btnStyle(page >= pages)}
      >NEXT →</button>

      <span style={{ marginLeft: "auto", fontSize: "11px", color: "#444", fontFamily: "monospace" }}>
        <span style={{ color: "#3b82f6" }}>{total.toLocaleString()}</span> total
      </span>
    </div>
  );
}

function btnStyle(disabled: boolean) {
  return {
    background:   "none",
    border:       "1px solid #21262d",
    borderRadius: "3px",
    color:        disabled ? "#333" : "#666",
    padding:      "3px 10px",
    fontSize:     "11px",
    fontFamily:   "monospace",
    cursor:       disabled ? "default" : "pointer",
  } as React.CSSProperties;
}