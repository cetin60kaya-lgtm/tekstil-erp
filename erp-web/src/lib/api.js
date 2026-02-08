// Simple API client for ERP Backend
const DEFAULT_BASE = "http://127.0.0.1:3100";
export const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE) ||
  DEFAULT_BASE;

async function request(path, opts = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });

  // Try to parse JSON even on errors
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    const msg = (data && (data.message || data.error)) ? JSON.stringify(data) : (text || res.statusText);
    throw new Error(`${res.status} ${res.statusText} - ${msg}`);
  }
  return data;
}

export const BoyahaneAPI = {
  list: async (params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      q.set(k, String(v));
    });
    const qs = q.toString();
    return request(`/boyahane/renk${qs ? `?${qs}` : ""}`, { method: "GET" });
  },

  search: async (qText, all = true) => {
    const q = new URLSearchParams();
    q.set("q", qText || "");
    q.set("all", all ? "true" : "false");
    return request(`/boyahane/renk/search?${q.toString()}`, { method: "GET" });
  },

  create: async (payload) => {
    return request(`/boyahane/renk`, { method: "POST", body: JSON.stringify(payload) });
  },

  update: async (id, payload) => {
    return request(`/boyahane/renk/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
  },

  pasif: async (id) => {
    return request(`/boyahane/renk/${id}/pasif`, { method: "PATCH" });
  },
};
