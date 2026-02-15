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
        to: {
          _obj: "layer",
          name: "ERP_TEXT_PROOF",
          textKey: text || "ERP PROOF"
        }
      }],
      { synchronousExecution: true, modalBehavior: "execute" }
    );
  }

  async function getChannelList(){
    const res = await action.batchPlay(
      [{
        _obj: "get",
        _target: [
          { _property: "channels" },
          { _ref: "document", _enum: "ordinal", _value: "targetEnum" }
        ]
      }],
      { synchronousExecution: true, modalBehavior: "execute" }
    );
    // res[0].channels beklenir
    const channels = res?.[0]?.channels || [];
    return channels;
  }

  async function addAlphaByDupFirstChannel(){
    const channels = await getChannelList();
    log("DIAG: channels.length = " + channels.length);

    if (!channels.length) throw new Error("Photoshop channels listesi boş döndü (bu beklenmez).");

    // İlk kanalı seç (genelde composite/RGB ya da Red olur)
    const first = channels[0];
    const firstId = first?._id;
    const firstName = first?.name || "(noname)";
    log(`DIAG: first channel => id=${firstId}, name="${firstName}"`);

    if (!firstId) throw new Error("İlk kanalın _id bilgisi yok. (channels[0]._id boş)");

    const newName = "ALPHA_PROOF_" + Date.now();

    await action.batchPlay(
      [{
        _obj: "duplicate",
        _target: [{ _ref: "channel", _id: firstId }],
        name: newName
      }],
      { synchronousExecution: true, modalBehavior: "execute" }
    );

    return newName;
  }

  async function runProof(){
    log("START");
    setStatus(false, "Çalışıyor...");

    const doc = await ensureDoc();
    log("OK: activeDocument=" + doc.name);

    try { await core.showAlert("KANIT ✅\nText Layer + Alpha (channel id duplicate)"); } catch {}

    await core.executeAsModal(async ()=>{
      log("STEP: Text layer...");
      await addTextLayerBatch($("txt")?.value);
      log("OK: ERP_TEXT_PROOF oluştu (Layers)");

      log("STEP: Alpha (dup first channel by _id)...");
      const ch = await addAlphaByDupFirstChannel();
      log("OK: Alpha oluştu -> " + ch);
      log("NOT: Window > Channels aç ve 'Channels' sekmesine geç (Layers değil).");
    }, { commandName: "ERP Proof: Text + Alpha (channel id)" });

    setStatus(true, "Bitti ✅ (Layers + Channels kontrol et)");
    try { await core.showAlert("Bitti ✅\nLayers: ERP_TEXT_PROOF\nChannels: ALPHA_PROOF_..."); } catch {}
  }

  function wire(){
    log("BOOT ✅ (channel-id alpha mode)");
    setStatus(false, "Hazır (PSD açık olmalı)");

    $("btnRun").addEventListener("click", async ()=>{
      const btn=$("btnRun");
      btn.disabled=true;
      try{
        await runProof();
      }catch(e){
        log("HATA ❌ " + (e?.message || e));
        setStatus(false, "Hata ❌ (log'a bak)");
        try{ await core.showAlert("HATA ❌\n" + (e?.message || e)); }catch{}
      }finally{
        btn.disabled=false;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", wire);
})();
