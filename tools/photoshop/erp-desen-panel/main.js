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

  async function runProof(){
    log("START: click geldi");
    setStatus(false, "Çalışıyor...");

    let ps, app, core, action;
    try{
      ps = require("photoshop");
      app = ps.app; core = ps.core; action = ps.action;
      log("OK: require('photoshop')");
    }catch(e){
      log("FAIL: require('photoshop') -> " + (e?.message || e));
      setStatus(false, "Photoshop API yok (log'a bak)");
      return;
    }

    // 1) KANIT: Alert çıkar (bunu görmezsen plugin doğru yüklenmiyor demektir)
    try{
      await core.showAlert("KANIT: Butona basıldı ✅\nŞimdi Text Layer + Alpha kanal denenecek.");
      log("OK: showAlert çalıştı");
    }catch(e){
      log("FAIL: showAlert -> " + (e?.message || e));
      // showAlert bazı ortamlarda engellenebilir; devam edeceğiz
    }

    // 2) PSD var mı?
    let docName="";
    try{
      docName = app.activeDocument ? app.activeDocument.name : "";
    }catch(e){
      log("FAIL: activeDocument erişimi -> " + (e?.message || e));
    }
    if(!docName){
      log("STOP: Açık PSD yok. File > New > Create yap.");
      setStatus(false, "PSD yok (File > New)");
      try{ await core.showAlert("Açık PSD yok. File > New > Create ile bir doküman aç."); }catch{}
      return;
    }
    log("OK: activeDocument = " + docName);

    // 3) Modal içinde Text Layer + Alpha Channel
    try{
      await core.executeAsModal(async ()=>{
        // Text layer
        const doc = app.activeDocument;
        const layer = await doc.artLayers.add();
        layer.kind = "textLayer";
        layer.name = "ERP_TEXT_PROOF";
        layer.textItem.contents = ($("txt")?.value || "ERP PROOF");
        layer.textItem.size = 36;

        // Alpha channel (KESİN görünür: Window > Channels)
        const chName = "ALPHA_PROOF_" + Date.now();
        await action.batchPlay(
          [{
            _obj: "make",
            _target: [{ _ref: "channel" }],
            using: { _obj: "channel", name: chName }
          }],
          { synchronousExecution: true, modalBehavior: "execute" }
        );

      }, { commandName: "ERP Proof: Text + Alpha" });

      log("OK: Text Layer + Alpha tamamlandı");
      setStatus(true, "Bitti ✅ (Layers + Channels kontrol et)");
      try{
        await core.showAlert("Bitti ✅\nLayers: ERP_TEXT_PROOF\nChannels: ALPHA_PROOF_... görmelisin.");
      }catch{}

    }catch(e){
      log("FAIL: executeAsModal/batchPlay -> " + (e?.message || e));
      setStatus(false, "Hata ❌ (log'a bak)");
      try{ await core.showAlert("HATA ❌\n" + (e?.message || e)); }catch{}
    }
  }

  function wire(){
    log("BOOT: main.js çalıştı ✅");
    setStatus(false, "Hazır (PSD açık olmalı)");

    const btn = $("btnRun");
    btn.addEventListener("click", async ()=>{
      btn.disabled = true;
      try{ await runProof(); }
      finally{ btn.disabled = false; }
    });
  }

  document.addEventListener("DOMContentLoaded", wire);
})();
