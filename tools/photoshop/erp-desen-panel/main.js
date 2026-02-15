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

  async function playAction(actionName, setName){
    await action.batchPlay(
      [{
        _obj: "play",
        _target: [
          { _ref: "action", _name: actionName },
          { _ref: "actionSet", _name: setName }
        ]
      }],
      { synchronousExecution: true, modalBehavior: "execute" }
    );
  }

  async function fillSelectionWhite(){
    // Seçili alanı aktif hedefe (şu an spot channel) beyazla doldurur.
    await action.batchPlay(
      [{
        _obj: "fill",
        using: { _enum: "fillContents", _value: "white" },
        opacity: { _unit: "percentUnit", _value: 100 },
        mode: { _enum: "blendMode", _value: "normal" }
      }],
      { synchronousExecution: true, modalBehavior: "execute" }
    );
  }

  async function run(){
    await ensureDoc();

    await core.executeAsModal(async ()=>{
      log("Action: erp / ERP_Spot_Create");
      await playAction("ERP_Spot_Create", "erp");
      log("OK ✅ Spot açıldı (aktif kanal spot olmalı).");

      log("Fill: selection -> white");
      await fillSelectionWhite();
      log("OK ✅ Seçim spot kanala basıldı (kanal artık dolu).");

      try{
        await core.showAlert("OK ✅\nSpot açıldı ve seçim kanala basıldı.\n\nWindow > Channels kontrol et.");
      }catch{}
    }, { commandName:"ERP: Spot Create + Fill" });
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    log("BOOT OK ✅ (spot+fill)");
    const btn = $("btnRun");
    if(!btn){ log("HATA: btnRun yok"); return; }
    btn.addEventListener("click", async ()=>{
      btn.disabled = true;
      try{ await run(); }
      catch(e){
        log("HATA: " + (e?.message || e));
        try{ await core.showAlert("HATA:\n" + (e?.message || e)); }catch{}
      } finally { btn.disabled = false; }
    });
  });
})();
