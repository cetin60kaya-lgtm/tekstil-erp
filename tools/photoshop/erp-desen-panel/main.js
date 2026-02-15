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
    // 1) make text layer
    await action.batchPlay(
      [{
        _obj: "make",
        _target: [{ _ref: "layer" }],
        using: { _obj: "textLayer" }
      }],
      { synchronousExecution: true, modalBehavior: "execute" }
    );

    // 2) set text content + name
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

  async function addAlphaChannelBatch(){
    const chName = "ALPHA_PROOF_" + Date.now();
    await action.batchPlay(
      [{
        _obj: "make",
        _target: [{ _ref: "channel" }],
        using: { _obj: "channel", name: chName }
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

    // Alert kanıt
    try { await core.showAlert("KANIT ✅\nBatchPlay ile Text Layer + Alpha yapılacak."); }
    catch(e){ log("showAlert FAIL: " + (e?.message || e)); }

    await core.executeAsModal(async ()=>{
      // Text layer (batchPlay)
      log("STEP: Text layer (batchPlay)...");
      await addTextLayerBatch($("txt")?.value);

      // Alpha channel (batchPlay)
      log("STEP: Alpha channel (batchPlay)...");
      const ch = await addAlphaChannelBatch();

      log("DONE ✅ Layers: ERP_TEXT_PROOF | Channels: " + ch);
    }, { commandName: "ERP Proof BatchPlay" });

    setStatus(true, "Bitti ✅ (Layers + Channels kontrol et)");
    try { await core.showAlert("Bitti ✅\nLayers: ERP_TEXT_PROOF\nChannels: ALPHA_PROOF_..."); } catch {}
  }

  function wire(){
    log("BOOT ✅ (BatchPlay mode)");
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
