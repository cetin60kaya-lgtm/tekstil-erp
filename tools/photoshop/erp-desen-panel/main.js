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

  function diag() {
    log("---- DIAG START ----");

    const ok = loadPS();
    if (!ok) {
      log("DIAG: require('photoshop') FAIL");
      log("---- DIAG END ----");
      return;
    }

    log("DIAG: require('photoshop') OK");
    log("DIAG: photoshop keys = " + Object.keys(photoshop).join(", "));
    log("DIAG: app exists? " + (!!app));
    log("DIAG: core exists? " + (!!core));
    log("DIAG: action exists? " + (!!action));

    // documents length
    try {
      const n = (app && app.documents) ? app.documents.length : "N/A";
      log("DIAG: app.documents.length = " + n);
    } catch (e) {
      log("DIAG: app.documents.length HATA = " + (e && e.message ? e.message : e));
    }

    // activeDocument
    try {
      const ad = app.activeDocument;
      if (ad) {
        log('DIAG: activeDocument = YES, name="' + ad.name + '"');
        setBadge(true, 'Doküman: VAR ✅ (' + ad.name + ')');
      } else {
        log("DIAG: activeDocument = NULL/UNDEFINED");
        setBadge(false, "Doküman: YOK (ama PSD açık diyorsun) — DIAG bak");
      }
    } catch (e) {
      log("DIAG: activeDocument HATA = " + (e && e.message ? e.message : e));
      setBadge(false, "activeDocument erişimi HATA verdi (log'a bak)");
    }

    log("---- DIAG END ----");
  }

  async function ensureDoc() {
    diag();
    if (!app || !app.activeDocument) throw new Error("Açık PSD algılanmadı (DIAG log'a bak).");
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
      const nm = (name || "").trim() || ("ERP_CH_" + Date.now());
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

  function wire() {
    log("UI hazır. Önce DIAG butonuna bas.");

    $("btnDiag").addEventListener("click", () => {
      log("CLICK: DIAG");
      diag();
    });

    $("btnAddText").addEventListener("click", async () => {
      log("CLICK: Test 1");
      try {
        await addTextLayer($("txt").value);
        log("OK: ERP_TEXT eklendi.");
      } catch (e) {
        log("HATA: " + (e && e.message ? e.message : e));
      }
    });

    $("btnCh").addEventListener("click", async () => {
      log("CLICK: Test 2");
      try {
        await createChannelAlpha($("chName").value);
        log("OK: Kanal oluşturuldu.");
      } catch (e) {
        log("HATA: " + (e && e.message ? e.message : e));
      }
    });

    // açılışta da bir diag
    diag();
  }

  document.addEventListener("DOMContentLoaded", wire);
})();
