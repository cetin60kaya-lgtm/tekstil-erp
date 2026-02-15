(function(){
  try{
    const el=document.getElementById('log');
    if(el){ el.textContent = (new Date().toLocaleTimeString()) + '  LOG BOOT: main.js çalıştı ✅\n' + el.textContent; }
  }catch(e){}
})();
(function () {
  function $(id) { return document.getElementById(id); }
  function now() { return new Date().toLocaleTimeString(); }

  function log(msg) {
    const el = $("log");
    if (!el) return;
    el.textContent = `${now()}  ${msg}\n` + el.textContent;
  }

  function setBadge(ok, text) {
    const b = $("docBadge");
    if (!b) return;
    b.classList.remove("ok","no");
    b.classList.add(ok ? "ok" : "no");
    b.textContent = text;
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

  function diag() {
    try {
      loadPS();
      const ad = app.activeDocument;
      if (ad) setBadge(true, `Doküman: VAR ✅ (${ad.name})`);
      else setBadge(false, "Doküman: YOK (PSD aç)");
      log("DIAG OK: activeDocument=" + (ad ? ad.name : "NULL"));
    } catch (e) {
      setBadge(false, "DIAG HATA (log'a bak)");
      log("DIAG HATA: " + (e?.message || e));
    }
  }

  async function ensureDoc() {
    loadPS();
    if (!app || !app.activeDocument) throw new Error("Açık PSD algılanmadı. File > New ile doküman aç.");
  }

  async function safeExecuteModal(fn, name) {
    try {
      return await core.executeAsModal(fn, { commandName: name });
    } catch (e) {
      // Modal/busy hatası burada net çıkar
      log(`executeAsModal HATA (${name}): ` + (e?.message || e));
      throw e;
    }
  }

  async function addTextLayer(text) {
    await ensureDoc();
    await safeExecuteModal(async () => {
      const doc = app.activeDocument;
      const layer = await doc.artLayers.add();
      layer.kind = "textLayer";
      layer.name = "ERP_TEXT";
      layer.textItem.contents = text || "Merhaba ERP";
      layer.textItem.size = 36;
    }, "ERP Add Text");
  }

  async function createAlphaChannel(name) {
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

  async function createSpotChannel(name, hex) {
    const nm = (name || "").trim() || ("ERP_SPOT_" + Date.now());
    const rgb = parseHex(hex);

    // 1) gerçek spotColorChannel dene
    try {
      await action.batchPlay(
        [{
          _obj: "make",
          _target: [{ _ref: "channel" }],
          using: {
            _obj: "spotColorChannel",
            name: nm,
            color: { _obj: "RGBColor", red: rgb.r, green: rgb.g, blue: rgb.b },
            opacity: 100,
            solidity: 100
          }
        }],
        { synchronousExecution: true, modalBehavior: "execute" }
      );
      return { ok: true, name: nm, mode: "spotColorChannel(solidity)" };
    } catch (e1) {
      log("SPOT deneme-1 hata: " + (e1?.message || e1));

      // 2) solidity olmadan dene
      try {
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
        return { ok: true, name: nm, mode: "spotColorChannel(no-solidity)" };
      } catch (e2) {
        log("SPOT deneme-2 hata: " + (e2?.message || e2));

        // 3) fallback: alpha channel
        const alphaName = await createAlphaChannel(nm);
        return { ok: false, name: alphaName, mode: "fallback-alpha" };
      }
    }
  }

  function setBusy(isBusy) {
    const b1 = $("btnSpot");
    const b2 = $("btnAddText");
    const b3 = $("btnDiag");
    if (b1) b1.disabled = !!isBusy;
    if (b2) b2.disabled = !!isBusy;
    if (b3) b3.disabled = !!isBusy;
  }

  function wire() {
    log("UI hazır. PSD açıkken DIAG -> sonra SPOT.");
    diag();

    $("btnDiag").addEventListener("click", () => { log("CLICK: DIAG"); diag(); });

    $("btnAddText").addEventListener("click", async () => {
      log("CLICK: Text START");
      setBusy(true);
      try {
        await addTextLayer($("txt").value);
        log("CLICK: Text END ✅ (Layers panelini kontrol et)");
      } catch (e) {
        log("CLICK: Text END ❌ " + (e?.message || e));
      } finally {
        setBusy(false);
        diag();
      }
    });

    $("btnSpot").addEventListener("click", async () => {
      log("CLICK: SPOT START");
      setBusy(true);
      try {
        await ensureDoc();
        const res = await safeExecuteModal(async () => {
          return await createSpotChannel($("spotName").value, $("spotHex").value);
        }, "ERP Create Spot Channel");

        if (res.ok) log(`CLICK: SPOT END ✅ (${res.mode}) -> "${res.name}" (Channels panelini kontrol et)`);
        else log(`CLICK: SPOT END ⚠️ Spot desteklenmedi, ALPHA açıldı (${res.mode}) -> "${res.name}"`);
      } catch (e) {
        log("CLICK: SPOT END ❌ " + (e?.message || e));
      } finally {
        setBusy(false);
        diag();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", wire);
})();

