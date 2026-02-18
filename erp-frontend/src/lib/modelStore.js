// C:\ERP\erp-frontend\src\lib\modelStore.js
// REV-1: localStorage model havuzu (Desen + Boyahane ortak)
// Amaç: Desen "Kaydet=Yayın" -> Boyahane aynı modeli görsün.
// Not: Backend bağlamaya hazır yapı.

const LS_KEYS = {
  MODELS: "erp.modelStore.models.v1",
};

function safeJsonParse(raw, fallback) {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function readAll() {
  return safeJsonParse(localStorage.getItem(LS_KEYS.MODELS), []);
}

function writeAll(models) {
  localStorage.setItem(LS_KEYS.MODELS, JSON.stringify(models || []));
}

function nowIso() {
  return new Date().toISOString();
}

// Renk kimliği anahtarı: aynı pantone + boyaTuru + efekt ayrı kayıt
export function makeColorKey({ pantone, boyaTuru, efekt }) {
  return `${String(pantone || "").trim()}|${String(boyaTuru || "").trim()}|${String(efekt || "").trim()}`;
}

// Karışım anahtarı: model + colorKey
function makeMixKey({ modelName, colorKey }) {
  return `${String(modelName || "").trim()}||${String(colorKey || "").trim()}`;
}

export function listModels() {
  return readAll();
}

export function getModelByName(modelName) {
  const name = String(modelName || "").trim().toLowerCase();
  if (!name) return null;
  const all = readAll();
  return all.find((m) => String(m.modelName || "").trim().toLowerCase() === name) || null;
}

export function upsertModel(payload) {
  const modelName = String(payload?.modelName || "").trim();
  if (!modelName) throw new Error("modelName required");

  const all = readAll();
  const idx = all.findIndex((m) => String(m.modelName || "").trim().toLowerCase() === modelName.toLowerCase());

  const existing = idx >= 0 ? all[idx] : null;

  const next = {
    modelName,
    printAreas: Array.isArray(payload?.printAreas) ? payload.printAreas : existing?.printAreas || [],
    images: payload?.images ? payload.images : existing?.images || {},
    sizes: payload?.sizes ? payload.sizes : existing?.sizes || {},
    colorIdentities: Array.isArray(payload?.colorIdentities) ? payload.colorIdentities : existing?.colorIdentities || [],
    // Boyahane: karışım tabloları (model içinde saklıyoruz)
    // mixes: { [mixKey]: { columns: ["GR1"...], rows: [{ id, productName, lotNo, unitPrice, currency, values:{GR1:..}}] } }
    mixes: existing?.mixes || {},
    updatedAt: nowIso(),
    createdAt: existing?.createdAt || nowIso(),
  };

  if (idx >= 0) all[idx] = next;
  else all.unshift(next);

  writeAll(all);
  return next;
}

export function addOrUpdateColorIdentity(modelName, identity) {
  const name = String(modelName || "").trim();
  if (!name) throw new Error("modelName required");

  const m = getModelByName(name);
  const base = m || upsertModel({ modelName: name });

  const key = String(identity?.key || "").trim();
  if (!key) throw new Error("identity.key required");

  const list = Array.isArray(base.colorIdentities) ? base.colorIdentities.slice() : [];
  const idx = list.findIndex((x) => x.key === key);

  const nextItem = {
    key,
    pantone: String(identity?.pantone || "").trim(),
    colorName: String(identity?.colorName || "").trim(),
    hex: String(identity?.hex || "").trim(),
    boyaTuru: String(identity?.boyaTuru || "").trim(),
    efekt: String(identity?.efekt || "").trim(),
    updatedAt: nowIso(),
    createdAt: idx >= 0 ? (list[idx]?.createdAt || nowIso()) : nowIso(),
  };

  if (idx >= 0) list[idx] = nextItem;
  else list.push(nextItem);

  return upsertModel({
    ...base,
    modelName: base.modelName,
    colorIdentities: list,
  });
}

export function getColorIdentities(modelName) {
  const m = getModelByName(modelName);
  return m?.colorIdentities || [];
}

// --- BOYAHANE: Karışım tabloları ---
export function getMixTable(modelName, colorKey) {
  const m = getModelByName(modelName);
  if (!m) return null;

  const mixKey = makeMixKey({ modelName: m.modelName, colorKey });
  return m.mixes?.[mixKey] || null;
}

export function upsertMixTable(modelName, colorKey, table) {
  const m = getModelByName(modelName);
  if (!m) throw new Error("Model yok");

  const mixKey = makeMixKey({ modelName: m.modelName, colorKey });
  const mixes = { ...(m.mixes || {}) };

  mixes[mixKey] = {
    columns: Array.isArray(table?.columns) ? table.columns : ["GR1", "GR2", "GR3", "GR4"],
    rows: Array.isArray(table?.rows) ? table.rows : [],
    updatedAt: nowIso(),
    createdAt: mixes[mixKey]?.createdAt || nowIso(),
  };

  return upsertModel({ ...m, mixes });
}
