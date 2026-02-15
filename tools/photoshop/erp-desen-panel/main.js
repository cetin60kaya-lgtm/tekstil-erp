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

  async function getChannels(){
    const r = await action.batchPlay(
      [{
        _obj:"get",
        _target:[
          { _property:"channels" },
          { _ref:"document", _enum:"ordinal", _value:"targetEnum" }
        ]
      }],
      { synchronousExecution:true, modalBehavior:"execute" }
    );
    return r?.[0]?.channels || [];
  }

  async function renameChannelById(channelId, newName){
    await action.batchPlay(
      [{
        _obj:"set",
        _target:[{ _ref:"channel", _id: channelId }],
        to:{ _obj:"channel", name: newName }
      }],
      { synchronousExecution:true, modalBehavior:"execute" }
    );
  }

  function pickLastChannel(after){
    if(!after || after.length === 0) return null;
    return after[after.length - 1] || null;
  }

  async function run(){
    await ensureDoc();

    const newName = ($("chName")?.value || "").trim();
    if(!newName) throw new Error("Kanal adı boş olamaz.");

    await core.executeAsModal(async ()=>{
      log("Action: erp / ERP_Spot_Create çalıştırılıyor...");
      await playAction("ERP_Spot_Create", "erp");

      log("Channels okunuyor...");
      const after = await getChannels();

      const last = pickLastChannel(after);
      if(!last || !last._id){
        log("HATA: Son kanal bulunamadı.");
        try{ await core.showAlert("HATA ❌\nSon kanal tespit edilemedi."); }catch{}
        return;
      }

      log(`Son kanal: "${last.name}" (id=${last._id})`);
      log(`Rename -> "${newName}"`);
      await renameChannelById(last._id, newName);

      log("OK ✅ Spot kanal adı güncellendi.");
      try{ await core.showAlert("OK ✅\nSpot açıldı ve isim verildi:\n" + newName); }catch{}
    }, { commandName:"ERP: Spot Create + Rename (Last)" });
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    log("BOOT OK ✅ (rename-last)");
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
