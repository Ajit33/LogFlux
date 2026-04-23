import { useState } from "react";
import { TopBar }     from "./components/TopBar";
import { Sidebar }    from "./components/Sidebar";
import { LogTable }   from "./components/LogTable";
import { DetailPanel} from "./components/DetailPanel";
import { LoginPage }  from "./pages/LoginPage";
import { UsersPage }  from "./pages/UserPage";        // ← add this
import { useSearch }  from "./hooks/useSearch";
import { useRealtime} from "./hooks/useRealtime";
import type { LogEntry, User, SearchParams } from "./types";

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [showUsers, setShowUsers] = useState(false);   // ← add this

  const handleLogin = (u: User, token: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const { result, loading, error, liveMode, setLiveMode, updateParam, setPage, clearFilters } = useSearch();
  const { newLogs, newIds, clearNew } = useRealtime(liveMode);
  const [selected, setSelected] = useState<LogEntry | null>(null);

  const displayLogs = liveMode && newLogs.length > 0
    ? [...newLogs, ...(result?.logs ?? [])].slice(0, result?.limit ?? 50)
    : (result?.logs ?? []);

  const handleSearch = (params: Partial<SearchParams>) => {
    Object.entries(params).forEach(([k, v]) => updateParam(k as keyof SearchParams, v));
    clearNew();
  };

  if (!user) return <LoginPage onLogin={handleLogin} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#010409", color: "#c9d1d9", fontFamily: "monospace", overflow: "hidden" }}>
      <TopBar
        total={result?.total ?? 0}
        loading={loading}
        liveMode={liveMode}
        onToggleLive={() => setLiveMode(!liveMode)}
        user={user}
        onLogout={handleLogout}
        newCount={newLogs.length}
        onManageUsers={() => setShowUsers(true)}   // ← add this
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar
          onSearch={handleSearch}
          onClear={clearFilters}
          role={user.role}
        />

        <LogTable
          logs={displayLogs}
          total={result?.total ?? 0}
          page={result?.page ?? 1}
          pages={result?.pages ?? 1}
          loading={loading}
          error={error}
          newIds={newIds}
          selected={selected}
          onSelect={setSelected}
          onPage={setPage}
        />

        {selected && <DetailPanel log={selected} onClose={() => setSelected(null)} />}
      </div>

      {/* Users modal */}
      {showUsers && (                               
        <UsersPage
          currentUser={user}
          onClose={() => setShowUsers(false)}
        />
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        ::-webkit-scrollbar{width:6px;height:6px}
        ::-webkit-scrollbar-track{background:#0d1117}
        ::-webkit-scrollbar-thumb{background:#21262d;border-radius:3px}
        *{box-sizing:border-box}
        body{margin:0}
        select option{background:#0d1117}
      `}</style>
    </div>
  );
}