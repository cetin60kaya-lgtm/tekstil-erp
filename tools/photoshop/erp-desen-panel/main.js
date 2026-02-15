import photoshop from "photoshop";
const { app, core, action } = photoshop;

const $ = (id) => document.getElementById(id);

function log(msg) {
  const el = $("log");
  if (!el) return;
  el.textContent = `${new Date().toLocaleTimeString()}  ${msg}\n` + el.textContent;
}

function hasOpenDoc() {
  try {
    return !!app.activeDocument;
  } catch {
    return false;
  }
}

function setDocBadge() {
  const b = $("docBadge");
  const ok = hasOpenDoc();
  if (!b) return;

  b.classList.remove("ok","no");
  b.classList.add(ok ? "ok" : "no");

  if (ok) {
    b.textContent = `Doküman: VAR ✅ (${app.activeDocument.name})`;
  } else {
    b.textContent = "Doküman: YOK (PSD aç)";
  }

  ["btnAddText","btnRename","btnCh"].forEach(id=>{
    const el=$(id);
    if(el) el.disabled=!ok;
  });
}

async function ensureDoc() {
  if (!hasOpenDoc()) {
    throw new Error("Açık PSD yok.");
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
  }, { commandName: "ERP Add Text" });
}

async function createChannelAlpha(name) {
  await ensureDoc();
  await core.executeAsModal(async () => {
    const nm = name || ("ERP_CH_" + Date.now());
    await action.batchPlay(
      [{
        _obj: "make",
        _target: [{ _ref: "channel" }],
        using: { _obj: "channel", name: nm }
      }],
      { modalBehavior: "execute" }
    );
  }, { commandName: "ERP Create Channel" });
}

function wireUI() {
  log("UI hazır.");

  $("btnAddText").addEventListener("click", async ()=>{
    log("CLICK: Text");
    try { await addTextLayer($("txt").value); log("OK: Text eklendi."); }
    catch(e){ log("HATA: "+e.message); }
  });

  $("btnCh").addEventListener("click", async ()=>{
    log("CLICK: Channel");
    try { await createChannelAlpha($("chName").value); log("OK: Kanal oluşturuldu."); }
    catch(e){ log("HATA: "+e.message); }
  });

  setDocBadge();
  setInterval(setDocBadge, 800);
}

document.addEventListener("DOMContentLoaded", wireUI);
