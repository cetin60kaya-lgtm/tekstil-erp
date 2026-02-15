(function () {
  function $(id) { return document.getElementById(id); }
  function now() { return new Date().toLocaleTimeString(); }
  function log(msg) {
    const el = $("log");
    if (!el) return;
    el.textContent = `${now()}  ${msg}\n` + el.textContent;
  }

  let photoshop, app, core, action;

  function loadPS() {
    photoshop = require("photoshop");
    app = photoshop.app;
    core = photoshop.core;
    action = photoshop.action;
  }

  function parseHex(hex) {
    const raw = (hex || "").trim().replace(/^#/, "");
    if (!/^[0-9a-fA-F]{6}$/.test(raw)) throw new Error("HEX geçersiz. Örn: #C8102E");
    return {
      r: parseInt(raw.slice(0, 2), 16),
      g: parseInt(raw.slice(2, 4), 16),
      b: parseInt(raw.slice(4, 6), 16),
    };
  }

  async function ensureDoc() {
    loadPS();
    if (!app || !app.activeDocument) throw new Error("Açık PSD yok.");
  }

  async function makeAlphaChannel(name) {
    const nm = (name || "").trim() || ("ERP_ALPHA_" + Date.now());
    await action.batchPlay(
      [{
        _obj: "make",
        _target: [{ _ref: "channel" }],
        using: { _obj: "channel", name: nm }
      }],
      { synchronousExecution: true, modalBehavior: "execute" }
    );
    return nm;
  }

  async function tryMakeSpot(name, hex) {
    const nm = (name || "").trim();
    const rgb = parseHex(hex);
    await action.batchPlay(
      [{
        _obj: "make",
        _target: [{ _ref: "channel" }],
        using: {
          _obj: "spotColorChannel",
          name: nm,
          color: { _obj: "RGBColor", red: rgb.r, green: rgb.g, blue: rgb.b },
          opacity: 100
        }
      }],
      { synchronousExecution: true, modalBehavior: "execute" }
    );
    return nm;
  }

  async function runSpotFlow() {
    await ensureDoc();

    const nm = ($("spotName")?.value || "").trim() || ("01 - TEST");
    const hex = ($("spotHex")?.value || "#C8102E").trim();

    await core.executeAsModal(async () => {
      log("FLOW: 1) Alpha kanal oluşturuluyor (kesin görünür)...");
      const alphaName = await makeAlphaChannel("ALPHA_" + nm);
      log('OK: Alpha kanal açıldı -> "' + alphaName + '" (Channels sekmesine bak)');

      log("FLOW: 2) Spot kanal deneniyor...");
      try {
        const spotName = await tryMakeSpot(nm, hex);
        log('OK: Spot kanal açıldı -> "' + spotName + '" (Channels sekmesine bak)');
      } catch (e) {
        log("SPOT HATA: " + (e?.message || e));
        log("Not: Spot olmazsa sorun değil; alpha kanal zaten oluştu.");
      }
    }, { commandName: "ERP Spot Flow" });
  }

  function wire() {
    log("Hazır. Channels sekmesini aç (Window > Channels).");
    log("Not: Spot kanalı Layers’ta görünmez.");

    const b = $("btnSpot");
    if (b) {
      b.addEventListener("click", async () => {
        log("CLICK: SPOT FLOW START");
        try {
          await runSpotFlow();
          log("CLICK: SPOT FLOW END");
        } catch (e) {
          log("FLOW HATA: " + (e?.message || e));
        }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", wire);
})();
