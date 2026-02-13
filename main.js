import photoshop from "photoshop";

const { app, core } = photoshop;

const $ = (id) => document.getElementById(id);

function log(msg) {
  const el = $("log");
  el.textContent = `${new Date().toLocaleTimeString()}  ${msg}\n` + el.textContent;
}

async function ensureDoc() {
  if (!app.documents || app.documents.length === 0) {
    throw new Error("Açık bir PSD/doküman yok. Önce Photoshop’ta bir dosya aç.");
  }
}

async function addTextLayer(text) {
  await ensureDoc();

  await core.executeAsModal(async () => {
    const doc = app.activeDocument;

    const layer = await doc.artLayers.add();
    layer.kind = "textLayer";
    layer.name = "ERP_TEXT";

    layer.textItem.contents = text || "Merhaba";
    layer.textItem.size = 40;
  }, { commandName: "ERP Test: Add Text Layer" });
}

async function renameActiveLayer(newName) {
  await ensureDoc();

  await core.executeAsModal(async () => {
    const doc = app.activeDocument;
    const layer = doc.activeLayers?.[0];
    if (!layer) throw new Error("Aktif layer yok.");

    layer.name = newName || "ERP_LAYER";
  }, { commandName: "ERP Test: Rename Layer" });
}

function wireUI() {
  $("btnAddText").addEventListener("click", async () => {
    try {
      const text = $("txt").value;
      await addTextLayer(text);
      log("Text layer eklendi.");
    } catch (e) {
      log("HATA: " + (e?.message || e));
    }
  });

  $("btnRename").addEventListener("click", async () => {
    try {
      await renameActiveLayer("ERP_RENAMED_" + Date.now());
      log("Aktif layer adı değişti.");
    } catch (e) {
      log("HATA: " + (e?.message || e));
    }
  });

  log("Panel hazır. Photoshop’ta bir PSD açıp test et.");
}

document.addEventListener("DOMContentLoaded", wireUI);
