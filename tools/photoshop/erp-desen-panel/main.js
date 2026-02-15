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

    // set text + name
    await action.batchPlay(
      [{
        _obj: "set",
        _target: [{ _ref: "layer", _enum: "ordinal", _value: "targetEnum" }],
        to: { _obj: "layer", name: "ERP_TEXT_PROOF", textKey: text || "ERP PROOF" }
      }],
      { synchronousExecution: true, modalBehavior: "execute" }
    );
  }

  async function run(){
    log("CLICK geldi ✅");
    await ensureDoc();

    // Alert kanıtı
    try{
      await core.showAlert("KANIT ✅\nButon çalıştı.\nŞimdi Text Layer eklenecek.");
      log("Alert OK");
    }catch(e){
      log("Alert FAIL: " + (e?.message || e));
    }

    // Modal + Text layer
    await core.executeAsModal(async ()=>{
      await addTextLayerBatch("ERP 27.0 TEST");
    }, { commandName: "ERP Test Text Layer" });

    log("Text Layer OK ✅ (Layers panelinde ERP_TEXT_PROOF)");
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    log("BOOT OK ✅ main.js çalıştı");
    const btn = $("btnRun");
    if(!btn){
      log("HATA: btnRun bulunamadı (index.html eski olabilir)");
      return;
    }
    btn.addEventListener("click", async ()=>{
      btn.disabled = true;
      try{ await run(); }
      catch(e){ log("HATA: " + (e?.message || e)); try{ await core.showAlert("HATA:\n"+(e?.message||e)); }catch{} }
      finally{ btn.disabled = false; }
    });
  });
})();
