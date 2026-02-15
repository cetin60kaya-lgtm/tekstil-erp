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
    // Photoshop Action tetikle (BatchPlay)
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

  async function run(){
    log("CLICK ✅");
    await ensureDoc();

    try{
      await core.showAlert("SPOT TEST ✅\nAction çalıştırılacak:\nset=erp / action=ERP_Spot_Create\nSonra Window > Channels'a bak.");
    }catch{}

    await core.executeAsModal(async ()=>{
      log("STEP: Action play -> erp / ERP_Spot_Create");
      await playAction("ERP_Spot_Create", "erp");
      log("OK ✅ Action tetiklendi. Channels panelinde yeni Spot Channel olmalı.");
    }, { commandName: "ERP: Play Spot Action" });

    log("DONE ✅");
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    log("BOOT OK ✅ (action-play)");
    const btn = $("btnRun");
    if(!btn){ log("HATA: btnRun yok"); return; }

    btn.addEventListener("click", async ()=>{
      btn.disabled = true;
      try{ await run(); }
      catch(e){
        log("HATA: " + (e?.message || e));
        try{ await core.showAlert("HATA:\n"+(e?.message||e)); }catch{}
      } finally {
        btn.disabled = false;
      }
    });
  });
})();
