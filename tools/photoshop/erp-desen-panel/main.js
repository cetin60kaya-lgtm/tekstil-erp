(function () {

  function $(id){ return document.getElementById(id); }
  function ts(){ return new Date().toLocaleTimeString(); }
  function log(msg){
    const el=$("log"); if(!el) return;
    el.textContent = `${ts()}  ${msg}\n` + el.textContent;
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
    if(!app.activeDocument) throw new Error("Açık PSD yok.");
  }

  function hexToRgb(hex){
    hex = hex.replace("#","");
    const r = parseInt(hex.substring(0,2),16);
    const g = parseInt(hex.substring(2,4),16);
    const b = parseInt(hex.substring(4,6),16);
    return {r,g,b};
  }

  async function createSpot(hex,name){

    const {r,g,b} = hexToRgb(hex);

    await action.batchPlay([{
      _obj:"make",
      _target:[{_ref:"channel"}],
      using:{
        _obj:"channel",
        name:name,
        color:{
          _obj:"RGBColor",
          red:r,
          green:g,
          blue:b
        },
        opacity:100,
        kind:{
          _enum:"channelType",
          _value:"spotColorChannel"
        }
      }
    }], {synchronousExecution:true, modalBehavior:"execute"});

  }

  async function run(){

    await ensureDoc();

    await core.executeAsModal(async ()=>{

      await createSpot("#FF0000","18-1660_RED_TEST");

      log("SPOT OK ✅ 18-1660_RED_TEST oluşturuldu");

    },{commandName:"Create Spot Channel"});

  }

  function wire(){
    $("btnRun").addEventListener("click", async ()=>{
      try{
        await run();
      }catch(e){
        log("HATA: "+e.message);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", wire);

})();
