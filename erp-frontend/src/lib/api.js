const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3101";

async function http(method, path, body) {
  const res = await fetch(API_BASE + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || ("HTTP " + res.status));
  }
  return res.json();
}

export const BoyahaneAPI = {
  list: (params) => {
    const qs = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== "" && v !== undefined && v !== null) qs.set(k, String(v));
    });
    return http("GET", "/boyahane/renk?" + qs.toString());
  },
  create: (dto) => http("POST", "/boyahane/renk", dto),
  update: (id, dto) => http("PATCH", "/boyahane/renk/" + id, dto),
  clone: (id) => http("POST", "/boyahane/renk/" + id + "/clone"),

  // MODEL-RENK
  modelRenkList: (modelKodu) => http("GET", "/boyahane/model-renk?modelKodu=" + encodeURIComponent(modelKodu || "")),
  modelRenkAdd: (modelKodu, renkId) => http("POST", "/boyahane/model-renk", { modelKodu, renkId }),
  modelRenkDelete: (id) => http("DELETE", "/boyahane/model-renk/" + id),
};

