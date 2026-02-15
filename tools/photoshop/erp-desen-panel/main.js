import photoshop from "photoshop";
const { app, core, action } = photoshop;

const $ = (id) => document.getElementById(id);

function log(msg) {
  const el = $("log");
  if (!el) return;
  el.textContent = `${new Date().toLocaleTimeString()}  ${msg}\n` + el.textContent;
}

function setDocBadge(hasDoc) {
  const b = $("docBadge");
  if (!b) return;
  b.classList.remove("ok","no");
  b.classList.add(hasDoc ? "ok" : "no");
  b.textContent = hasDoc ? "Doküman: VAR ✅" : "Doküman: YOK (PSD aç)";
}

function setButtonsEnabled(enabled) {
  const ids = ["btnAddText","btnRename","btnCh"];
  ids.forEach(id => {
    const el = $(id);
    if (el) el.disabled = !enabled;
  });
}

function hasOpenDoc() {
  try { return (app.documents && app.documents.length > 0); }
  catch { return false; }
}

async function ensureDoc() {
  if (!hasOpenDoc()) {
    throw new Error("Açık PSD yok. Önce File > New ile bir doküman aç.");
  }
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

function startDocWatcher() {
  const tick = () => {
    const ok = hasOpenDoc();
    setDocBadge(ok);
    setButtonsEnabled(ok);
  };
  tick();
  setInterval(tick, 600);
}

function wireUI() {
  // UI hazır logu — bunu görmüyorsan JS hiç çalışmıyordur
  log("UI hazır. PSD açınca butonlar aktif olacak.");

  $("btnAddText").addEventListener("click", async () => {
    log("CLICK: Test 1");
    try {
      await addTextLayer($("txt").value);
      log("OK: ERP_TEXT eklendi.");
    } catch (e) {
      log("HATA: " + (e?.message || e));
    }
  });

  $("btnRename").addEventListener("click", async () => {
    log("CLICK: Test 2");
    try {
      await renameActiveLayer("ERP_RENAMED_" + Date.now());
      log("OK: Aktif layer adı değişti.");
    } catch (e) {
      log("HATA: " + (e?.message || e));
    }
  });

  $("btnCh").addEventListener("click", async () => {
    log("CLICK: Test 3");
    try {
      await createChannelAlpha($("chName").value);
      log("OK: Kanal oluşturuldu (Channels panelinde gör).");
    } catch (e) {
      log("HATA: " + (e?.message || e));
    }
  });

  startDocWatcher();
}

document.addEventListener("DOMContentLoaded", () => {
  try {
    wireUI();
  } catch (e) {
    // En kötü ihtimal: burada bile log basalım
    const el = document.getElementById("log");
    if (el) el.textContent = "BOOT HATA: " + (e?.message || e);
  }
});
