(function(){
  const $ = (id)=>document.getElementById(id);
  const ts = ()=>new Date().toLocaleTimeString();
  const log = (m)=>{ const el=$("log"); if(el) el.textContent = `${ts()}  ${m}\n` + el.textContent; };

  let ps, app, core, action;

  function loadPS(){
    ps = require("photoshop");
    app = ps.app;
    core = ps.core;
    action = ps.action;
  }

  async function ensureDoc(){
    loadPS();
    if(!app.activeDocument) throw new Error("Açık PSD yok. File > New > Create.");
  }

  function hexToRgb(hex){
    const raw = (hex||"").trim().replace(/^#/,"");
    if(!/^[0-9a-fA-F]{6}$/.test(raw)) throw new Error("HEX geçersiz: " + hex);
    return {
      r: parseInt(raw.slice(0,2),16),
      g: parseInt(raw.slice(2,4),16),
      b: parseInt(raw.slice(4,6),16)
    };
  }

  async function addTextLayerBatch(text){
    await action.batchPlay(
      [{
        _obj: "make",
        _target: [{ _ref: "layer" }],
        using: { _obj: "textLayer" }
      }],
      { synchronousExecution: true, modalBehavior: "execute" }
    );

    await action.batchPlay(
      [{
        _obj: "set",
        _target: [{ _ref: "layer", _enum: "ordinal", _value: "targetEnum" }],
        to: { _obj: "layer", name: "ERP_TEXT_PROOF", textKey: text || "ERP PROOF" }
      }],
      { synchronousExecution: true, modalBehavior: "execute" }
    );
  }

  async function createSpotChannel(name, hex){
    const rgb = hexToRgb(hex);

    // 27.0 için spotColorChannel descriptor
    await action.batchPlay(
      [{
        _obj: "make",
        _target: [{ _ref: "channel" }],
        using: {
          _obj: "spotColorChannel",
          name: name,
          color: { _obj: "RGBColor", red: rgb.r, green: rgb.g, blue: rgb.b },
          opacity: 100,
          solidity: 100
        }
      }],
      { synchronousExecution: true, modalBehavior: "execute" }
    );
  }

  async function run(){
    log("CLICK geldi ✅");
    await ensureDoc();

    try{
      await core.showAlert("KANIT ✅\nText Layer + Spot Channel denenecek.\nChannels panelini aç: Window > Channels");
      log("Alert OK");
    }catch(e){
      log("Alert FAIL: " + (e?.message || e));
    }

    await core.executeAsModal(async ()=>{
      log("1) Text layer...");
      await addTextLayerBatch("ERP 27.0 TEST");
      log("OK: ERP_TEXT_PROOF");

      log("2) Spot channel...");
      await createSpotChannel("18-1660_RED_TEST", "#FF0000");
      log("OK: Spot -> 18-1660_RED_TEST");
    }, { commandName: "ERP Test: Text + Spot" });

    log("BİTTİ ✅  Window > Channels'ta spot'u kontrol et.");
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    log("BOOT OK ✅ main.js (spot) çalıştı");
    const btn = $("btnRun");
    btn.addEventListener("click", async ()=>{
      btn.disabled = true;
      try{ await run(); }
      catch(e){
        log("HATA: " + (e?.message || e));
        try{ await core.showAlert("HATA:\n"+(e?.message||e)); }catch{}
      }finally{ btn.disabled = false; }
    });
  });
})();
