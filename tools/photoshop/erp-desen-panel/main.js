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

  async function renameActiveChannel(newName){
    // targetEnum = aktif (seçili) kanal
    await action.batchPlay(
      [{
        _obj: "set",
        _target: [{ _ref: "channel", _enum: "ordinal", _value: "targetEnum" }],
        to: { _obj: "channel", name: newName }
      }],
      { synchronousExecution: true, modalBehavior: "execute" }
    );
  }

  async function run(){
    await ensureDoc();

    const newName = ($("chName")?.value || "").trim();
    if(!newName) throw new Error("Kanal adı boş olamaz.");

    await core.executeAsModal(async ()=>{
      log("Action: erp / ERP_Spot_Create çalıştırılıyor...");
      await playAction("ERP_Spot_Create", "erp");
      log("OK ✅ Spot açıldı (aktif kanal spot olmalı).");

      log(`Rename aktif kanal -> "${newName}"`);
      await renameActiveChannel(newName);
      log("OK ✅ Kanal adı verildi.");

      try{
        await core.showAlert("OK ✅\nSpot açıldı ve isim verildi:\n" + newName + "\n\nWindow > Channels kontrol et.");
      }catch{}
    }, { commandName:"ERP: Spot Create + Rename (Active Channel)" });
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    log("BOOT OK ✅ (rename-active)");
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
