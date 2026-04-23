import type { SearchParams, SearchResponse } from "../types";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function login(username: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Login failed");
  }
  return res.json();
}

export async function search(params: SearchParams): Promise<SearchResponse> {
  const qs = new URLSearchParams();
  if (params.q)                qs.set("q",                params.q);
  if (params.level)            qs.set("level",            params.level);
  if (params.resourceId)       qs.set("resourceId",       params.resourceId);
  if (params.traceId)          qs.set("traceId",          params.traceId);
  if (params.spanId)           qs.set("spanId",           params.spanId);
  if (params.commit)           qs.set("commit",           params.commit);
  if (params.parentResourceId) qs.set("parentResourceId", params.parentResourceId);
  if (params.timestampFrom)    qs.set("timestampFrom",    params.timestampFrom);
  if (params.timestampTo)      qs.set("timestampTo",      params.timestampTo);
  if (params.regex)            qs.set("regex",            "true");
  if (params.page)             qs.set("page",             String(params.page));
  if (params.limit)            qs.set("limit",            String(params.limit));

  const res = await fetch(`${API_BASE}/search?${qs}`, { headers: authHeaders() });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Search failed: ${res.status}`);
  }
  const raw = await res.json();
  return {
    ...raw,
    pages: Math.ceil(raw.total / (raw.limit ?? 50)),
  };
}

export async function getHealth() {
  const res = await fetch(`${API_BASE}/health`, { headers: authHeaders() });
  return res.json();
}