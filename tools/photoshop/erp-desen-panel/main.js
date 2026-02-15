(function () {
  function $(id){ return document.getElementById(id); }
  function ts(){ return new Date().toLocaleTimeString(); }
  function log(msg){
    const el=$("log"); if(!el) return;
    el.textContent = `${ts()}  ${msg}\n` + el.textContent;
  }
  function setStatus(ok, text){
    const b=$("status"); if(!b) return;
    b.classList.remove("ok","no");
    b.classList.add(ok ? "ok" : "no");
    b.textContent = text;
  }

  let ps, app, core, action;

  function loadPS(){
    ps = require("photoshop");
    app = ps.app;
    core = ps.core;
    action = ps.action;
  }

  async function ensureDoc(){
    loadPS();
    const ad = app.activeDocument;
    if(!ad) throw new Error("Açık PSD yok. File > New > Create.");
    return ad;
  }

  async function addTextLayerBatch(text){
    // make text layer
    await action.batchPlay(
      [{
        _obj: "make",
        _target: [{ _ref: "layer" }],
        using: { _obj: "textLayer" }
      }],
      { synchronousExecution: true, modalBehavior: "execute" }
    );

    // set content + name
    await action.batchPlay(
      [{
        _obj: "set",
        _target: [{ _ref: "layer", _enum: "ordinal", _value: "targetEnum" }],
        to: {
          _obj: "layer",
          name: "ERP_TEXT_PROOF",
          textKey: text || "ERP PROOF"
        }
      }],
      { synchronousExecution: true, modalBehavior: "execute" }
    );
  }

  // ✅ GUARANTEED Alpha: Select RGB channel -> Duplicate it as a new channel (Alpha)
  async function addAlphaByDuplicateRGB(){
    const chName = "ALPHA_PROOF_" + Date.now();

    // 1) select RGB (composite) channel
    await action.batchPlay(
      [{
        _obj: "select",
        _target: [{ _ref: "channel", _enum: "channel", _value: "RGB" }]
      }],
      { synchronousExecution: true, modalBehavior: "execute" }
    );

    // 2) duplicate selected channel -> new alpha channel named chName
    await action.batchPlay(
      [{
        _obj: "duplicate",
        _target: [{ _ref: "channel", _enum: "ordinal", _value: "targetEnum" }],
        name: chName
      }],
      { synchronousExecution: true, modalBehavior: "execute" }
    );

    return chName;
  }

  async function runProof(){
    log("START");
    setStatus(false, "Çalışıyor...");

    const doc = await ensureDoc();
    log("OK: activeDocument=" + doc.name);

    try { await core.showAlert("KANIT ✅\nText Layer + Alpha (duplicate RGB) denenecek."); }
    catch(e){ log("showAlert FAIL: " + (e?.message || e)); }

    await core.executeAsModal(async ()=>{
      // Text
      log("STEP: Text layer (batchPlay)...");
      await addTextLayerBatch($("txt")?.value);
      log("OK: ERP_TEXT_PROOF oluştu (Layers)");

      // Alpha
      log("STEP: Alpha (duplicate RGB)...");
      const ch = await addAlphaByDuplicateRGB();
      log("OK: Alpha oluştu -> " + ch + " (Window > Channels)");

    }, { commandName: "ERP Proof: Text + Alpha (RGB duplicate)" });

    setStatus(true, "Bitti ✅ (Layers + Channels kontrol et)");
    try { await core.showAlert("Bitti ✅\nLayers: ERP_TEXT_PROOF\nChannels: ALPHA_PROOF_..."); } catch {}
  }

  function wire(){
    log("BOOT ✅ (BatchPlay + RGB duplicate alpha)");
    setStatus(false, "Hazır (PSD açık olmalı)");

    $("btnRun").addEventListener("click", async ()=>{
      const btn = $("btnRun");
      btn.disabled = true;
      try{
        await runProof();
      }catch(e){
        log("HATA ❌ " + (e?.message || e));
        setStatus(false, "Hata ❌ (log'a bak)");
        try{ await core.showAlert("HATA ❌\n" + (e?.message || e)); }catch{}
      }finally{
        btn.disabled = false;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", wire);
})();
