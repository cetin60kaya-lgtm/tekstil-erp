// src/lib/storeAdapter.js
// Tek noktadan model store erişimi: Projede modelStore varsa onu kullanır,
// yoksa localStorage fallback ile çalışır.

let modelStoreRef = null;
if (typeof window !== "undefined") {
  // Dinamik import: varsa kullan, yoksa sessizce fallback'e düş
  import("../lib/modelStore")
    .then((m) => {
      modelStoreRef = m?.default || m;
    })
    .catch(() => {
      modelStoreRef = null;
    });
}

export const LS_KEYS = {
  MODELS: "erp.modelStore.models.v1",
};

export function nowIso() {
  return new Date().toISOString();
}

function safeJsonParse(raw, fallback) {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function readAllModelsFallback() {
  return safeJsonParse(localStorage.getItem(LS_KEYS.MODELS), []);
}

function writeAllModelsFallback(models) {
  localStorage.setItem(LS_KEYS.MODELS, JSON.stringify(models || []));
}

function upsertModelFallback(model) {
  const all = readAllModelsFallback();
  const idx = all.findIndex((m) => (m?.name || "").toLowerCase() === (model?.name || "").toLowerCase());
  if (idx >= 0) all[idx] = { ...all[idx], ...model, updatedAt: nowIso() };
  else all.unshift({ ...model, createdAt: nowIso(), updatedAt: nowIso() });
  writeAllModelsFallback(all);
  return model;
}

function getModelByNameFallback(name) {
  const all = readAllModelsFallback();
  return all.find((m) => (m?.name || "").toLowerCase() === (name || "").toLowerCase()) || null;
}

function listModelsFallback() {
  const all = readAllModelsFallback();
  return (all || []).slice().sort((a, b) => (a?.name || "").localeCompare(b?.name || "", "tr"));
}

export const Store = {
  listModels() {
    try {
      if (modelStoreRef?.listModels) return modelStoreRef.listModels();
    } catch {}
    return listModelsFallback();
  },
  getModelByName(name) {
    try {
      if (modelStoreRef?.getModelByName) return modelStoreRef.getModelByName(name);
    } catch {}
    return getModelByNameFallback(name);
  },
  upsertModel(model) {
    try {
      if (modelStoreRef?.upsertModel) return modelStoreRef.upsertModel(model);
    } catch {}
    return upsertModelFallback(model);
  },
};
