// src/api/api.js

const RAW_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL)) ||
  "http://localhost:3101";

// sondaki slash'leri kırp
export const API_BASE = String(RAW_BASE).replace(/\/+$/, "");

/**
 * URL builder:
 * - path tam URL ise aynen kullanır
 * - değilse API_BASE + /path yapar
 */
function buildUrl(path) {
  if (!path) throw new Error("API path is required");
  const p = String(path);

  // Tam URL ise aynen kullan
  if (/^https?:\/\//i.test(p)) return p;

  // Path / ile başlamıyorsa ekle
  const norm = p.startsWith("/") ? p : `/${p}`;
  return `${API_BASE}${norm}`;
}

async function handle(res, method, urlForError) {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${method} ${urlForError} failed: ${res.status} ${text}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

export async function apiGet(path) {
  const url = buildUrl(path);
  const res = await fetch(url);
  return handle(res, "GET", url);
}

export async function apiPost(path, body) {
  const url = buildUrl(path);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  return handle(res, "POST", url);
}

export async function apiPatch(path, body) {
  const url = buildUrl(path);
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  return handle(res, "PATCH", url);
}
