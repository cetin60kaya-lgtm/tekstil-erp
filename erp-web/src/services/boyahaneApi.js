const BASE_URL = "http://localhost:3100";

async function handle(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "İstek başarısız");
  }
  return res.json();
}

export async function getRenkler(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    qs.set(k, String(v));
  });

  const url = `${BASE_URL}/boyahane/renk${qs.toString() ? `?${qs}` : ""}`;
  const res = await fetch(url);
  return handle(res);
}

export async function searchRenkler(q, all = false) {
  const qs = new URLSearchParams();
  qs.set("q", q);
  if (all) qs.set("all", "true");

  const res = await fetch(`${BASE_URL}/boyahane/renk/search?${qs.toString()}`);
  return handle(res);
}

export async function pasifYap(id) {
  const res = await fetch(`${BASE_URL}/boyahane/renk/${id}/pasif`, {
    method: "PATCH",
  });
  return handle(res);
}

export async function updateRenk(id, patch) {
  const res = await fetch(`${BASE_URL}/boyahane/renk/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return handle(res);
}

export async function createRenk(payload) {
  const res = await fetch(`${BASE_URL}/boyahane/renk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle(res);
}
