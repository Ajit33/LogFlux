import { useState, useEffect, useRef } from "react";
import type { LogEntry } from "../types";


const API_BASE = import.meta.env.VITE_API_URL ?? "";

export function useRealtime(enabled: boolean) {
  const [newLogs, setNewLogs] = useState<LogEntry[]>([]);
  const [newIds,  setNewIds]  = useState<Set<string>>(new Set());
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!enabled) {
      esRef.current?.close();
      esRef.current = null;
      return;
    }

    const token = localStorage.getItem("token");
    const url   = `${API_BASE}/logs/stream${token ? `?token=${token}` : ""}`;
    const es    = new EventSource(url);
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const log: LogEntry = JSON.parse(e.data);
        setNewLogs(prev => [log, ...prev].slice(0, 100)); // keep last 100
        setNewIds(prev  => new Set([...prev, log.id ?? ""]));

        // Clear green highlight after 5s
        setTimeout(() => {
          setNewIds(prev => {
            const next = new Set(prev);
            next.delete(log.id ?? "");
            return next;
          });
        }, 5000);
      } catch {
        
      }
    };

    es.onerror = () => {
      es.close();
      esRef.current = null;
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [enabled]);

  const clearNew = () => {
    setNewLogs([]);
    setNewIds(new Set());
  };

  return { newLogs, newIds, clearNew };
}