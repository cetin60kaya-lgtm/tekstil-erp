import photoshop from "photoshop";
const { app, core, action } = photoshop;

const $ = (id) => document.getElementById(id);

function log(msg) {
  const el = $("log");
  if (!el) return;
  el.textContent = `${new Date().toLocaleTimeString()}  ${msg}\n` + el.textContent;
}

function setDocBadge(hasDoc, info) {
  const b = $("docBadge");
  if (!b) return;
  b.classList.remove("ok","no");
  b.classList.add(hasDoc ? "ok" : "no");
  b.textContent = hasDoc ? `Doküman: VAR ✅  (${info})` : `Doküman: YOK (PSD aç)  (${info})`;
}

function setButtonsEnabled(enabled) {
  ["btnAddText","btnRename","btnCh","btnRefresh"].forEach(id => {
    const el = $(id);
    if (el) el.disabled = !enabled && id !== "btnRefresh";
  });
}

function docInfo() {
  try {
    const n = (app.documents && app.documents.length) ? app.documents.length : 0;
    let name = "";
    try { name = app.activeDocument ? app.activeDocument.name : ""; } catch {}
    return { n, name };
  } catch {
    return { n: 0, name: "" };
  }
}

async function ensureDoc() {
  const info = docInfo();
  if (info.n <= 0) throw new Error("Açık PSD yok. File > New > Create ile doküman aç.");
}

async function addTextLayer(text) {
  await ensureDoc();
  await core.executeAsModal(async () => {
    const doc = app.activeDocument;
    const layer = await doc.artLayers.add();
    layer.kind = "textLayer";
    layer.name = "ERP_TEXT";
    layer.textItem.contents = text || "Merhaba ERP";
    layer.textItem.size = 36;
  }, { commandName: "ERP Desen Panel: Add Text Layer" });
}

async function renameActiveLayer(newName) {
  await ensureDoc();
  await core.executeAsModal(async () => {
    const doc = app.activeDocument;
    const layer = doc.activeLayers?.[0];
    if (!layer) throw new Error("Aktif layer yok. Bir layer seç.");
    layer.name = newName || ("ERP_LAYER_" + Date.now());
  }, { commandName: "ERP Desen Panel: Rename Active Layer" });
}

async function createChannelAlpha(name) {
  await ensureDoc();
  await core.executeAsModal(async () => {
    const nm = (name || "").trim() || ("ERP_CH_" + Date.now());
    await action.batchPlay(
      [{
        _obj: "make",
        _target: [{ _ref: "channel" }],
        using: { _obj: "channel", name: nm }
      }],
      { synchronousExecution: false, modalBehavior: "execute" }
    );
  }, { commandName: "ERP Desen Panel: Create Channel (Alpha)" });
}

function refresh() {
  const info = docInfo();
  const has = info.n > 0;
  const label = `docs=${info.n}` + (info.name ? `, active="${info.name}"` : "");
  setDocBadge(has, label);
  setButtonsEnabled(has);
  log("REFRESH: " + label);
}

function wireUI() {
  log("UI hazır. Refresh ile doküman durumunu gör.");

  $("btnRefresh").addEventListener("click", () => {
    log("CLICK: Refresh");
    refresh();
  });

  $("btnAddText").addEventListener("click", async () => {
    log("CLICK: Test 1");
    try { await addTextLayer($("txt").value); log("OK: ERP_TEXT eklendi."); }
    catch(e){ log("HATA: " + (e?.message || e)); }
  });

  $("btnRename").addEventListener("click", async () => {
    log("CLICK: Test 2");
    try { await renameActiveLayer("ERP_RENAMED_" + Date.now()); log("OK: Aktif layer adı değişti."); }
    catch(e){ log("HATA: " + (e?.message || e)); }
  });

  $("btnCh").addEventListener("click", async () => {
    log("CLICK: Test 3");
    try { await createChannelAlpha($("chName").value); log("OK: Kanal oluşturuldu (Channels panelinde gör)."); }
    catch(e){ log("HATA: " + (e?.message || e)); }
  });

  refresh();
  setInterval(refresh, 1200);
}

document.addEventListener("DOMContentLoaded", () => {
  try { wireUI(); }
  catch(e){ const el = document.getElementById("log"); if(el) el.textContent = "BOOT HATA: " + (e?.message || e); }
});
