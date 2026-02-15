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

  function hexToRgb(hex){
    const raw = (hex||"").trim().replace(/^#/,"");
    if(!/^[0-9a-fA-F]{6}$/.test(raw)) throw new Error("HEX geçersiz: " + hex);
    return {
      r: parseInt(raw.slice(0,2),16),
      g: parseInt(raw.slice(2,4),16),
      b: parseInt(raw.slice(4,6),16)
    };
  }

  async function addTextLayerBatch(text){
    await action.batchPlay(
      [{ _obj:"make", _target:[{_ref:"layer"}], using:{_obj:"textLayer"} }],
      { synchronousExecution:true, modalBehavior:"execute" }
    );

    await action.batchPlay(
      [{
        _obj:"set",
        _target:[{_ref:"layer", _enum:"ordinal", _value:"targetEnum"}],
        to:{ _obj:"layer", name:"ERP_TEXT_PROOF", textKey: text || "ERP PROOF" }
      }],
      { synchronousExecution:true, modalBehavior:"execute" }
    );
  }

  async function getDocInfo(){
    const r = await action.batchPlay(
      [{
        _obj: "get",
        _target: [{ _ref: "document", _enum: "ordinal", _value: "targetEnum" }]
      }],
      { synchronousExecution:true, modalBehavior:"execute" }
    );
    return r?.[0] || {};
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

  function channelExists(channels, name){
    return (channels||[]).some(c => (c?.name||"") === name);
  }

  async function tryMakeSpotVariant(variantName, payload){
    log(`SPOT TRY: ${variantName}`);
    try{
      await action.batchPlay([payload], { synchronousExecution:true, modalBehavior:"execute" });
      return { ok:true };
    }catch(e){
      return { ok:false, err: (e?.message || String(e)) };
    }
  }

  async function createSpotVerified(name, hex){
    const rgb = hexToRgb(hex);

    // Deneme #1: spotColorChannel (senin kullandığın)
    const v1 = {
      _obj:"make",
      _target:[{_ref:"channel"}],
      using:{
        _obj:"spotColorChannel",
        name,
        color:{ _obj:"RGBColor", red:rgb.r, green:rgb.g, blue:rgb.b },
        opacity:100,
        solidity:100
      }
    };

    // Deneme #2: using: channel + kind=spotColorChannel (bazı build’lerde bu ister)
    const v2 = {
      _obj:"make",
      _target:[{_ref:"channel"}],
      using:{
        _obj:"channel",
        name,
        color:{ _obj:"RGBColor", red:rgb.r, green:rgb.g, blue:rgb.b },
        opacity:100,
        kind:{ _enum:"channelType", _value:"spotColorChannel" }
      }
    };

    // Deneme #3: select “RGB” composite + make spotColorChannel (bazı doküman modlarında tetikler)
    const v3Select = {
      _obj:"select",
      _target:[{_ref:"channel", _enum:"channel", _value:"RGB"}]
    };
    const v3Make = v1;

    // Önce mevcut kanallar
    let channels = await getChannels();
    log("CHANNELS BEFORE: " + channels.map(c=>c.name).join(" | "));

    // 1
    let r1 = await tryMakeSpotVariant("v1 spotColorChannel", v1);
    channels = await getChannels();
    if (channelExists(channels, name)) return { ok:true, used:"v1" };
    log("v1 sonucu: " + (r1.ok ? "OK ama görünmüyor" : ("HATA: " + r1.err)));

    // 2
    let r2 = await tryMakeSpotVariant("v2 channel+kind", v2);
    channels = await getChannels();
    if (channelExists(channels, name)) return { ok:true, used:"v2" };
    log("v2 sonucu: " + (r2.ok ? "OK ama görünmüyor" : ("HATA: " + r2.err)));

    // 3
    let r3s = await tryMakeSpotVariant("v3 select RGB", v3Select);
    let r3m = await tryMakeSpotVariant("v3 make spotColorChannel", v3Make);
    channels = await getChannels();
    if (channelExists(channels, name)) return { ok:true, used:"v3" };
    log("v3 select: " + (r3s.ok ? "OK" : ("HATA: " + r3s.err)));
    log("v3 make: " + (r3m.ok ? "OK ama görünmüyor" : ("HATA: " + r3m.err)));

    // Hiçbiri eklemedi -> doküman bilgisiyle raporla
    const info = await getDocInfo();
    const mode = info?.mode?._value || info?.mode || "unknown";
    const depth = info?.depth || "unknown";
    const bits = info?.bitsPerChannel || "unknown";
    return {
      ok:false,
      reason:`Spot eklenmedi. Doc mode=${mode}, depth=${depth}, bits=${bits}. Channels sonrası: ${channels.map(c=>c.name).join(" | ")}`
    };
  }

  async function run(){
    log("CLICK ✅");
    await ensureDoc();

    // Window > Channels hatırlatması
    try{ await core.showAlert("Test: Text Layer + Spot Channel\nNot: Window > Channels açık olsun."); }catch{}

    await core.executeAsModal(async ()=>{
      log("1) Text layer...");
      await addTextLayerBatch("ERP 27.0 TEST");
      log("OK: ERP_TEXT_PROOF");

      log("2) Spot create verified...");
      const name = "18-1660_RED_TEST";
      const res = await createSpotVerified(name, "#FF0000");
      if(res.ok){
        log(`OK ✅ Spot oluştu: ${name} (used=${res.used})`);
      }else{
        log("FAIL ❌ " + res.reason);
        try{ await core.showAlert("SPOT FAIL ❌\n" + res.reason); }catch{}
      }
    }, { commandName:"ERP Test: Text + Spot Verified" });

    log("DONE.");
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    log("BOOT OK ✅ (spot verified)");
    const btn = document.getElementById("btnRun");
    if(!btn){ log("HATA: btnRun yok (index.html eski)"); return; }

    btn.addEventListener("click", async ()=>{
      btn.disabled = true;
      try{ await run(); }
      catch(e){
        log("HATA: " + (e?.message || e));
        try{ await core.showAlert("HATA:\n"+(e?.message||e)); }catch{}
      }
      finally{ btn.disabled = false; }
    });
  });
})();
async function createRealSpot(name, hex){
  const raw = hex.replace("#","");
  const r = parseInt(raw.slice(0,2),16);
  const g = parseInt(raw.slice(2,4),16);
  const b = parseInt(raw.slice(4,6),16);

  await action.batchPlay([
    {
      _obj: "make",
      new: { _class: "channel" },
      at: { _ref: "channel", _enum: "channel", _value: "mask" },
      using: {
        _obj: "channel",
        name: name,
        color: {
          _obj: "RGBColor",
          red: r,
          green: g,
          blue: b
        },
        opacity: 100,
        kind: {
          _enum: "channelType",
          _value: "spotColorChannel"
        }
      }
    }
  ], { synchronousExecution:true, modalBehavior:"execute" });
}
