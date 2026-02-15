(function () {
  function $(id) { return document.getElementById(id); }

  function log(msg) {
    const el = $("log");
    if (!el) return;
    el.textContent = (new Date().toLocaleTimeString() + "  " + msg + "\n") + el.textContent;
  }

  function setBadge(ok, text) {
    const b = $("docBadge");
    if (!b) return;
    b.classList.remove("ok","no");
    b.classList.add(ok ? "ok" : "no");
    b.textContent = text;
  }

  let photoshop = null;
  let app = null;
  let core = null;
  let action = null;

  function loadPS() {
    try {
      photoshop = require("photoshop");
      app = photoshop.app;
      core = photoshop.core;
      action = photoshop.action;
      return true;
    } catch (e) {
      setBadge(false, "Photoshop API yüklenemedi (require('photoshop') hata)");
      log("REQUIRE HATA: " + (e && e.message ? e.message : e));
      return false;
    }
  }

  function parseHex(hex) {
    const raw = (hex || "").trim().replace(/^#/, "");
    if (!/^[0-9a-fA-F]{6}$/.test(raw)) throw new Error("HEX geçersiz. Örn: #C8102E");
    const r = parseInt(raw.slice(0, 2), 16);
    const g = parseInt(raw.slice(2, 4), 16);
    const b = parseInt(raw.slice(4, 6), 16);
    return { r, g, b };
  }

  function diag() {
    log("---- DIAG START ----");
    const ok = loadPS();
    if (!ok) { log("---- DIAG END ----"); return; }

    let adName = "";
    try { adName = app.activeDocument ? app.activeDocument.name : ""; } catch {}
    const hasDoc = !!adName;

    setBadge(hasDoc, hasDoc ? `Doküman: VAR ✅ (${adName})` : "Doküman: YOK (PSD aç)");
    log("DIAG: activeDocument = " + (hasDoc ? adName : "NULL"));
    log("---- DIAG END ----");
  }

  async function ensureDoc() {
    loadPS();
    if (!app || !app.activeDocument) throw new Error("Açık PSD algılanmadı. File > New ile doküman aç.");
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

  // GERÇEK SPOT CHANNEL (spotColorChannel)
  async function createSpotChannel(name, hex) {
    await ensureDoc();

    const nm = (name || "").trim() || ("SPOT_" + Date.now());
    const rgb = parseHex(hex);

    await core.executeAsModal(async () => {
      try {
        await action.batchPlay(
          [
            {
              _obj: "make",
              _target: [{ _ref: "channel" }],
              using: {
                _obj: "spotColorChannel",
                name: nm,
                color: { _obj: "RGBColor", red: rgb.r, green: rgb.g, blue: rgb.b },
                opacity: 100,
                solidity: 100
              }
            }
          ],
          { modalBehavior: "execute" }
        );
      } catch (e) {
        // Bazı build'lerde "solidity" alanı kabul edilmeyebiliyor; ikinci deneme
        log("SPOT 1. deneme hata: " + (e && e.message ? e.message : e));
        await action.batchPlay(
          [
            {
              _obj: "make",
              _target: [{ _ref: "channel" }],
              using: {
                _obj: "spotColorChannel",
                name: nm,
                color: { _obj: "RGBColor", red: rgb.r, green: rgb.g, blue: rgb.b },
                opacity: 100
              }
            }
          ],
          { modalBehavior: "execute" }
        );
      }
    }, { commandName: "ERP Create Spot Channel" });
  }

  function wire() {
    log("UI hazır. Önce DIAG bas, sonra SPOT oluştur.");
    diag();

    $("btnDiag").addEventListener("click", () => {
      log("CLICK: DIAG");
      diag();
    });

    $("btnAddText").addEventListener("click", async () => {
      log("CLICK: Text");
      try {
        await addTextLayer($("txt").value);
        log("OK: ERP_TEXT eklendi. (Layers panelini kontrol et)");
      } catch (e) {
        log("HATA: " + (e && e.message ? e.message : e));
      }
    });

    $("btnSpot").addEventListener("click", async () => {
      log("CLICK: SPOT");
      try {
        await createSpotChannel($("spotName").value, $("spotHex").value);
        log("OK: Spot Channel oluşturuldu. (Channels panelini kontrol et)");
      } catch (e) {
        log("HATA: " + (e && e.message ? e.message : e));
      }
    });
  }

  document.addEventListener("DOMContentLoaded", wire);
})();
