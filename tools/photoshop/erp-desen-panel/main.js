(function () {
  function $(id) { return document.getElementById(id); }
  function ts() { return new Date().toLocaleTimeString(); }

  function log(msg) {
    const el = $("log");
    if (!el) return;
    el.textContent = `${ts()}  ${msg}\n` + el.textContent;
  }

  let photoshop, app, core, action;

  function loadPS() {
    photoshop = require("photoshop");
    app = photoshop.app;
    core = photoshop.core;
    action = photoshop.action;
  }

  async function ensureDoc() {
    loadPS();
    if (!app || !app.activeDocument) throw new Error("Açık PSD yok. File > New ile aç.");
  }

  async function makeAlphaChannel(name) {
    const nm = (name || "").trim() || ("ALPHA_TEST_" + Date.now());
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

  async function run() {
    await ensureDoc();
    const nm = "ALPHA_TEST_" + Date.now();

    await core.executeAsModal(async () => {
      log("1) Alpha kanal oluşturuluyor...");
      const created = await makeAlphaChannel(nm);
      log(`OK ✅ Alpha kanal oluştu: "${created}"`);
      log("KANALİ GÖRMEK İÇİN: Window > Channels (Layers değil)");
    }, { commandName: "ERP Create Alpha Channel Test" });
  }

  function wire() {
    log("Panel hazır. PSD açıkken SPOT butonuna bas.");
    log("KANAL Layers’ta görünmez. Window > Channels aç.");

    const btn = $("btnSpot");
    if (btn) {
      btn.addEventListener("click", async () => {
        log("CLICK: START");
        try { await run(); log("CLICK: END ✅"); }
        catch (e) { log("HATA ❌ " + (e?.message || e)); }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", wire);
})();
