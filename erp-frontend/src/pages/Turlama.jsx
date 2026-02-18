// C:\ERP\erp-frontend\src\pages\Turlama.jsx
import React, { useEffect, useMemo, useState } from "react";

const LS_KEYS = { PRICE_HISTORY: "erp.turlama.priceHistory.v1" };

function safeJsonParse(raw, fallback) {
  try { if (!raw) return fallback; return JSON.parse(raw); } catch { return fallback; }
}
function nowISO(){ return new Date().toISOString(); }
function fmtTRY(n){ const x = Number(n||0); return x.toLocaleString("tr-TR",{minimumFractionDigits:2,maximumFractionDigits:2}); }
function clamp(n,a,b){ return Math.max(a,Math.min(b,n)); }
function monthsAgoDate(months){ const d=new Date(); d.setMonth(d.getMonth()-months); return d; }
function daysBetweenNow(iso){ const A=Date.now(); const B=new Date(iso).getTime(); return Math.round((A-B)/(1000*60*60*24)); }
function pickColorSegment(c){
  const n=Number(c||0);
  if(n<=1) return 1; if(n<=3) return 3; if(n<=5) return 5; if(n<=7) return 7; if(n<=9) return 9; return 11;
}
function areaFactor(en,boy){
  const w=Number(en||0), h=Number(boy||0);
  const area=w*h;
  return { area, factor: area/100 };
}

const DEMO = {
  customers: [
    { id:"145", name:"145", departments:[{ id:"dokuma", name:"Dokuma", adjType:"percent", adjValue:0 }] },
    { id:"c1", name:"Müşteri A", departments:[{id:"d1",name:"Spor",adjType:"percent",adjValue:-3},{id:"d2",name:"Premium",adjType:"percent",adjValue:5}] },
    { id:"c2", name:"Müşteri B", departments:[{id:"d3",name:"Outlet",adjType:"percent",adjValue:-7},{id:"d4",name:"Kurumsal",adjType:"percent",adjValue:2}] },
  ],
  machines: [
    // refDay/refNight: “adet/vardiya” referansı (sonra admin’den gelecek)
    { id:"m1", name:"M1 (Manuel)", minDailyCiro:22000, refDay:2800, refNight:2600 },
    { id:"m2", name:"M2 (Manuel)", minDailyCiro:22000, refDay:3000, refNight:2800 },
    { id:"m3", name:"Otomatik 10 Renk", minDailyCiro:35000, refDay:4500, refNight:4200 },
  ],
  locationTL:{ on:8.0, arka:8.0, kol:6.0, ense:3.0 },
  effects:[
    { id:"ef_sim", name:"Sim", tl:1.0 },
    { id:"ef_yaldiz", name:"Yaldız", tl:1.5 },
    { id:"ef_varak", name:"Varak", tl:2.5 },
    { id:"ef_kabaran", name:"Kabaran", tl:1.8 },
  ],
  boyaBirimTL:0.15,
};

function Card({ title, right, children }){
  return (
    <section style={styles.card}>
      <header style={styles.cardHeader}>
        <div style={styles.cardTitle}>{title}</div>
        {right ? <div style={{display:"flex",gap:8,alignItems:"center"}}>{right}</div> : null}
      </header>
      <div style={styles.cardBody}>{children}</div>
    </section>
  );
}
function Field({ label, hint, children }){
  return (
    <label style={styles.field}>
      <div style={styles.fieldLabelRow}>
        <div style={styles.fieldLabel}>{label}</div>
        {hint ? <div style={styles.fieldHint}>{hint}</div> : null}
      </div>
      {children}
    </label>
  );
}
function Row({ children }){ return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>{children}</div>; }
function Input(props){ return <input {...props} style={{...styles.input,...(props.style||{})}}/>; }
function Select(props){ return <select {...props} style={{...styles.input,...(props.style||{})}}/>; }
function Pill({ text, tone="muted" }){
  const bg = tone==="good" ? "rgba(46,204,113,.14)" : tone==="warn" ? "rgba(241,196,15,.14)" : tone==="bad" ? "rgba(255,92,122,.14)" : "rgba(106,166,255,.12)";
  const br = tone==="good" ? "rgba(46,204,113,.35)" : tone==="warn" ? "rgba(241,196,15,.35)" : tone==="bad" ? "rgba(255,92,122,.35)" : "rgba(106,166,255,.35)";
  return <span style={{padding:"6px 10px",borderRadius:999,fontSize:12,border:`1px solid ${br}`,background:bg}}>{text}</span>;
}

function seedIfEmpty(){
  const ph = safeJsonParse(localStorage.getItem(LS_KEYS.PRICE_HISTORY), null);
  if(!ph || !Array.isArray(ph) || ph.length===0){
    const seed=[
      {
        id:"p4",
        at:new Date(Date.now()-20*24*3600*1000).toISOString(),
        customerId:"145",
        deptId:"dokuma",
        model:"MELLINO",
        machineId:"m1",
        en:20, boy:23.4,
        colorCount:7, colorSeg:7,
        boyaTuru:"Su Bazlı",
        locations:{ on:true, arka:false, kol:false, ense:false },
        effects:["ef_sim"],
        qtyOffer:6500,
        qtyPrint:6500,
        // İmalat gerçekleşeni: vardiyalar ayrı kayıt (örnek)
        dayShiftHours:10, nightShiftHours:10,
        dayOut:2800, nightOut:0, // o gün gece çalışılmadı
        dayShiftsUsed:3, nightShiftsUsed:0,
        systemUnit:9.7,
        finalUnit:9.4,
        note:"Lisanslı ürün",
      },
    ];
    localStorage.setItem(LS_KEYS.PRICE_HISTORY, JSON.stringify(seed));
  }
}

export default function Turlama(){
  useEffect(()=>{
    seedIfEmpty();
    const id="turlama-print-css";
    if(!document.getElementById(id)){
      const st=document.createElement("style");
      st.id=id;
      st.innerHTML=`
        @media print {
          body { background:#fff !important; }
          .no-print { display:none !important; }
          .print-area { display:block !important; }
          .print-card { break-inside: avoid; page-break-inside: avoid; }
        }
      `;
      document.head.appendChild(st);
    }
  },[]);

  const priceHistoryAll = useMemo(()=>safeJsonParse(localStorage.getItem(LS_KEYS.PRICE_HISTORY),[]),[]);

  // ===== INPUTS =====
  const [model,setModel]=useState("");
  const [customerId,setCustomerId]=useState("145");
  const [deptId,setDeptId]=useState("dokuma");
  const [machineId,setMachineId]=useState("m1");

  const [colorCount,setColorCount]=useState(7);
  const [effects,setEffects]=useState(["ef_sim"]);
  const [boyaTuru,setBoyaTuru]=useState("Su Bazlı");
  const [en,setEn]=useState(20);
  const [boy,setBoy]=useState(23.4);
  const [qtyOffer,setQtyOffer]=useState(6500);

  const [locOn,setLocOn]=useState(true);
  const [locArka,setLocArka]=useState(false);
  const [locKol,setLocKol]=useState(false);
  const [locEnse,setLocEnse]=useState(false);

  // ✅ Vardiya gerçek mantık
  const [useDay,setUseDay]=useState(true);
  const [useNight,setUseNight]=useState(false);
  const [dayShiftHours,setDayShiftHours]=useState(10);
  const [nightShiftHours,setNightShiftHours]=useState(10);
  const [dayOutManual,setDayOutManual]=useState("");     // adet/vardiya
  const [nightOutManual,setNightOutManual]=useState(""); // adet/vardiya

  const [finalUnit,setFinalUnit]=useState("");
  const [priceReason,setPriceReason]=useState("");

  const [status,setStatus]=useState("DEVAM");
  const [mkReason,setMkReason]=useState("");

  // foto demo
  const [photoUrl,setPhotoUrl]=useState("");
  const [searchQuery,setSearchQuery]=useState("");
  const [selectedSearchModel,setSelectedSearchModel]=useState("");

  // history filters
  const [historyMonths,setHistoryMonths]=useState(12);
  const [historyScope,setHistoryScope]=useState("DEPT");
  const [historySort,setHistorySort]=useState("SIMILAR");

  // ===== DERIVED =====
  const customer = useMemo(()=>DEMO.customers.find(c=>c.id===customerId)||DEMO.customers[0],[customerId]);
  const departments = useMemo(()=>customer?.departments||[],[customer]);

  useEffect(()=>{
    if(!departments.find(d=>d.id===deptId)) setDeptId(departments[0]?.id||"");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[customerId]);

  const dept = useMemo(()=>departments.find(d=>d.id===deptId)||departments[0],[departments,deptId]);
  const machine = useMemo(()=>DEMO.machines.find(m=>m.id===machineId)||DEMO.machines[0],[machineId]);

  const colorSeg = useMemo(()=>pickColorSegment(colorCount),[colorCount]);
  const area = useMemo(()=>areaFactor(en,boy),[en,boy]);

  const machinePassCount = useMemo(()=> [locOn,locArka,locKol,locEnse].filter(Boolean).length || 1,[locOn,locArka,locKol,locEnse]);

  const locTL = useMemo(()=>{
    const tl=DEMO.locationTL;
    let sum=0; const items=[];
    if(locOn){ sum+=tl.on; items.push({key:"on",label:"Ön",tl:tl.on,note:"Makine giriş"}); }
    if(locArka){ sum+=tl.arka; items.push({key:"arka",label:"Arka",tl:tl.arka,note:"Makine giriş"}); }
    if(locKol){ sum+=tl.kol; items.push({key:"kol",label:"Kol",tl:tl.kol,note:"Makine giriş"}); }
    if(locEnse){ sum+=tl.ense; items.push({key:"ense",label:"Ense",tl:tl.ense,note:"Mini baskı (hızlı)"}); }
    return { sum, items };
  },[locOn,locArka,locKol,locEnse]);

  const paintTL = useMemo(()=>clamp((area.factor||0)*DEMO.boyaBirimTL,0,999999),[area.factor]);
  const effectsTL = useMemo(()=>{
    let sum=0; const items=[];
    for(const id of effects){
      const ef=DEMO.effects.find(e=>e.id===id);
      if(ef){ sum+=ef.tl; items.push(ef); }
    }
    return { sum, items };
  },[effects]);

  const deptAdj = useMemo(()=> dept ? {type:dept.adjType,value:dept.adjValue} : {type:"none",value:0},[dept]);
  const systemUnitRaw = useMemo(()=>locTL.sum + paintTL + effectsTL.sum,[locTL.sum,paintTL,effectsTL.sum]);
  const systemUnit = useMemo(()=>{
    if(deptAdj.type==="percent") return systemUnitRaw*(1+(deptAdj.value||0)/100);
    return systemUnitRaw;
  },[systemUnitRaw,deptAdj]);

  useEffect(()=>{
    if(finalUnit==="") setFinalUnit(String(Number(systemUnit||0).toFixed(2)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[systemUnit]);

  const finalUnitNum = useMemo(()=>{ const n=Number(finalUnit||0); return isFinite(n)?n:0; },[finalUnit]);
  const diffPct = useMemo(()=> systemUnit ? ((finalUnitNum-systemUnit)/systemUnit)*100 : 0,[finalUnitNum,systemUnit]);
  const needReason = useMemo(()=> Math.abs(diffPct)>0.01,[diffPct]);

  // ===== HISTORY FILTERED =====
  const cutoff = useMemo(()=>monthsAgoDate(historyMonths).toISOString(),[historyMonths]);

  const filteredHistory = useMemo(()=>{
    const rows=priceHistoryAll.filter(r=>(r.at||"")>=cutoff);
    let base=rows;
    if(historyScope==="DEPT") base=rows.filter(r=>r.deptId===deptId);

    const wantModel=(model||"").toUpperCase().trim();
    const wantSeg=colorSeg;
    const wantBoya=boyaTuru;

    const scored=base.map(r=>{
      const rModel=(r.model||"").toUpperCase().trim();
      const segMatch=r.colorSeg===wantSeg?1:0;
      const boyaMatch=(r.boyaTuru||"")===wantBoya?1:0;
      const modelMatch=wantModel?(rModel===wantModel?1:0):0;

      const wantLoc=machinePassCount;
      const rowLoc = r.locations ? (Object.values(r.locations).filter(Boolean).length || 1) : 1;
      const locScore = 1 - Math.min(1, Math.abs(wantLoc-rowLoc)/3);

      const areaNow=area.area||0;
      const areaRow=Number(r.en||0)*Number(r.boy||0);
      const areaScore = areaNow>0 ? 1 - Math.min(1, Math.abs(areaNow-areaRow)/areaNow) : 0;

      const wantEf=new Set(effects||[]);
      const rowEf=new Set(r.effects||[]);
      let common=0; for(const x of wantEf) if(rowEf.has(x)) common++;
      const efScore = wantEf.size ? common/wantEf.size : 0.5;

      const score = clamp(0.35*modelMatch + 0.2*segMatch + 0.15*boyaMatch + 0.15*locScore + 0.1*areaScore + 0.05*efScore, 0, 1);
      return { ...r, _sim: score };
    });

    if(historySort==="NEW") scored.sort((a,b)=>(b.at||"").localeCompare(a.at||""));
    else if(historySort==="LOW") scored.sort((a,b)=>Number(a.finalUnit||0)-Number(b.finalUnit||0));
    else if(historySort==="HIGH") scored.sort((a,b)=>Number(b.finalUnit||0)-Number(a.finalUnit||0));
    else scored.sort((a,b)=>(b._sim||0)-(a._sim||0));

    return scored.slice(0,20);
  },[priceHistoryAll,cutoff,historyScope,deptId,model,colorSeg,boyaTuru,effects,historySort,machinePassCount,area.area]);

  // ✅ kapasite: adet/vardiya (gündüz/gece)
  const dayOutEffective = useMemo(()=>{
    const manual = Number(dayOutManual||0);
    if(manual>0) return manual;
    // history’den aynı makine/benzer satırlarda dayOut varsa ortalama al (opsiyon)
    const vals = filteredHistory.map(r=>Number(r.dayOut||0)).filter(x=>x>0);
    if(vals.length) return vals.reduce((a,b)=>a+b,0)/vals.length;
    return Number(machine?.refDay||0);
  },[dayOutManual,filteredHistory,machine?.refDay]);

  const nightOutEffective = useMemo(()=>{
    const manual = Number(nightOutManual||0);
    if(manual>0) return manual;
    const vals = filteredHistory.map(r=>Number(r.nightOut||0)).filter(x=>x>0);
    if(vals.length) return vals.reduce((a,b)=>a+b,0)/vals.length;
    return Number(machine?.refNight||0);
  },[nightOutManual,filteredHistory,machine?.refNight]);

  const dailyCapacity = useMemo(()=>{
    let cap=0;
    if(useDay) cap += (dayOutEffective||0);
    if(useNight) cap += (nightOutEffective||0);
    return cap;
  },[useDay,useNight,dayOutEffective,nightOutEffective]);

  const estDays = useMemo(()=> dailyCapacity>0 ? (Number(qtyOffer||0)/dailyCapacity) : 0,[qtyOffer,dailyCapacity]);

  const estShiftCount = useMemo(()=>{
    const shiftsPerDay = (useDay?1:0) + (useNight?1:0);
    if(!shiftsPerDay || !dailyCapacity) return 0;
    // toplam vardiya = gün * vardiya/gün
    return Math.ceil(estDays * shiftsPerDay);
  },[estDays,useDay,useNight,dailyCapacity]);

  // Min güvenli fiyat = minDailyCiro / günlük kapasite
  const minSafeUnit = useMemo(()=> dailyCapacity>0 ? Number(machine?.minDailyCiro||0)/dailyCapacity : 0,[machine?.minDailyCiro,dailyCapacity]);

  // Günlük ciro (öngörü) = sistem birim * günlük kapasite
  const dailyCiro = useMemo(()=> systemUnit*(dailyCapacity||0),[systemUnit,dailyCapacity]);
  const dailyThreshold = useMemo(()=> Number(machine?.minDailyCiro||0),[machine]);
  const profitDelta = useMemo(()=> dailyCiro - dailyThreshold,[dailyCiro,dailyThreshold]);

  const profitTone = useMemo(()=>{
    if(!dailyThreshold) return "muted";
    const ratio = profitDelta/dailyThreshold;
    if(ratio>=0.05) return "good";
    if(ratio<=-0.05) return "bad";
    return "warn";
  },[profitDelta,dailyThreshold]);

  const aiText = useMemo(()=>{
    const deptName=dept?.name||"Departman";
    const modelTxt=model ? `Model: ${model}.` : "Model seçilmedi.";
    const capTxt = dailyCapacity ? `Günlük kapasite: ${Math.round(dailyCapacity)} (G${useDay?`:${Math.round(dayOutEffective)}`:""} ${useNight?` N:${Math.round(nightOutEffective)}`:""}).` : "Kapasite yok.";
    const passTxt = `Makine giriş: ${machinePassCount}.`;
    const planTxt = dailyCapacity ? `${qtyOffer} adet ≈ ${estDays.toFixed(2)} gün / ${estShiftCount} vardiya.` : "";
    const minTxt = minSafeUnit ? `Minimum güvenli: ${fmtTRY(minSafeUnit)} TL.` : "Minimum güvenli: —";
    return `${deptName}. ${modelTxt} ${capTxt} ${passTxt} ${planTxt} ${minTxt}`;
  },[dept?.name,model,dailyCapacity,useDay,useNight,dayOutEffective,nightOutEffective,machinePassCount,qtyOffer,estDays,estShiftCount,minSafeUnit]);

  // ===== PHOTO search (demo) =====
  const modelCatalog = useMemo(()=>{
    const map=new Map();
    for(const r of priceHistoryAll){
      const key=(r.model||"").toUpperCase().trim();
      if(!key) continue;
      if(!map.has(key)) map.set(key,r);
    }
    return Array.from(map.values()).map(r=>({
      model:(r.model||"").toUpperCase().trim(),
      lastAt:r.at,
      deptId:r.deptId,
      boyaTuru:r.boyaTuru||"",
      colorSeg:r.colorSeg||0,
      effects:r.effects||[],
      thumbKey:(r.model||"").toUpperCase().trim(),
    }));
  },[priceHistoryAll]);

  const searchResults = useMemo(()=>{
    const q=(searchQuery||"").toUpperCase().trim();
    let base=modelCatalog;
    if(q) base=base.filter(m=>(m.model||"").includes(q));
    function hashScore(s){
      let h=0; for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))>>>0;
      const x=(h%1000)/1000;
      return 0.55+0.4*x;
    }
    const wantSeg=colorSeg, wantBoya=boyaTuru, wantEf=new Set(effects);
    return base
      .map(m=>{
        let score=hashScore((photoUrl?"PHOTO:":"TXT:")+m.thumbKey+"|"+(q||""));
        if(m.colorSeg===wantSeg) score+=0.05;
        if((m.boyaTuru||"")===wantBoya) score+=0.03;
        if(wantEf.size){
          let common=0; for(const e of m.effects) if(wantEf.has(e)) common++;
          score+=0.02*common;
        }
        return { ...m, score: clamp(score,0,0.99) };
      })
      .sort((a,b)=>b.score-a.score)
      .slice(0,12);
  },[modelCatalog,photoUrl,searchQuery,colorSeg,boyaTuru,effects]);

  function onPickModelFromSearch(m){
    setSelectedSearchModel(m.model);
    setModel(m.model);
    if(m.boyaTuru) setBoyaTuru(m.boyaTuru);
    if(m.colorSeg) setColorCount(m.colorSeg);
  }
  function onUploadPhoto(e){
    const f=e.target.files?.[0]; if(!f) return;
    setPhotoUrl(URL.createObjectURL(f));
  }
  function onPrintSearch(){ window.print(); }

  function onSaveDemo(){
    const rec={
      id:"p_"+Math.random().toString(16).slice(2),
      at: nowISO(),
      customerId, deptId,
      model:(model||"").toUpperCase().trim(),
      machineId,
      en:Number(en||0), boy:Number(boy||0),
      colorCount:Number(colorCount||0), colorSeg,
      boyaTuru,
      locations:{ on:!!locOn, arka:!!locArka, kol:!!locKol, ense:!!locEnse },
      effects:[...effects],
      qtyOffer:Number(qtyOffer||0),

      // ✅ vardiya planı (kayıtlı)
      useDay:!!useDay,
      useNight:!!useNight,
      dayShiftHours:Number(dayShiftHours||10),
      nightShiftHours:Number(nightShiftHours||10),
      dayOut: useDay ? Math.round(dayOutEffective||0) : 0,       // adet/vardiya
      nightOut: useNight ? Math.round(nightOutEffective||0) : 0, // adet/vardiya
      passCount: machinePassCount,
      estDays: dailyCapacity ? Number(estDays.toFixed(2)) : null,
      estShiftCount: estShiftCount || null,

      // gerçekleşenler sonradan
      qtyPrint:null,
      dayShiftsUsed:null,
      nightShiftsUsed:null,

      systemUnit:Number(systemUnit.toFixed(2)),
      finalUnit:Number(finalUnitNum.toFixed(2)),
      note: needReason ? (priceReason||"").trim() : "",
      status,
      mkReason: status==="MK" ? (mkReason||"").trim() : "",
    };

    if(!rec.model) return alert("Model zorunlu.");
    if(!customerId||!deptId||!machineId) return alert("Müşteri / Departman / Makine zorunlu.");
    if(status==="MK" && !rec.mkReason) return alert("m.k seçili. Sebep zorunlu.");
    if(needReason && !rec.note) return alert("Nihai fiyat sistemden farklı. Sebep zorunlu.");
    if(!rec.useDay && !rec.useNight) return alert("En az 1 vardiya seç (Gündüz veya Gece).");

    const old=safeJsonParse(localStorage.getItem(LS_KEYS.PRICE_HISTORY),[]);
    localStorage.setItem(LS_KEYS.PRICE_HISTORY, JSON.stringify([rec,...old]));
    alert("Kaydedildi (demo).");
    window.location.reload();
  }

  const headerRight = (
    <>
      <Pill text="REV-1" />
      <button className="no-print" style={styles.primaryBtn} onClick={onSaveDemo}>Kaydet (demo)</button>
      <button className="no-print" style={styles.secondaryBtn} onClick={()=>alert("Kilitleme REV-2: audit + versiyon + pasifleme.")}>Onayla/Kilitle</button>
    </>
  );

  return (
    <div style={styles.page}>
      <div style={styles.pageHeader}>
        <div>
          <div style={styles.hTitle}>ERP • TURLAMA & FİYATLANDIRMA</div>
          <div style={styles.hSub}>Gündüz/Gece vardiya gerçek mantık • Foto ile model bul • Yazdır/PDF çıktı</div>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}} className="no-print">
          <Pill
            text={profitTone==="good"?"🟢 Karlı":profitTone==="warn"?"🟡 Sınır":profitTone==="bad"?"🔴 Zarar":"—"}
            tone={profitTone==="good"?"good":profitTone==="warn"?"warn":profitTone==="bad"?"bad":"muted"}
          />
          {headerRight}
        </div>
      </div>

      <div style={styles.grid}>
        {/* LEFT */}
        <div style={{display:"grid",gap:12}}>
          <Card title="Foto ile Model Bul (REV-1 Demo)" right={<Pill text={selectedSearchModel?`Seçili: ${selectedSearchModel}`:"—"} />}>
            <Row>
              <Field label="Foto yükle">
                <Input type="file" accept="image/*" onChange={onUploadPhoto} />
              </Field>
              <Field label="Metin ile ara">
                <Input value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} placeholder="örn: MELLINO" />
              </Field>
            </Row>

            <div style={{display:"grid",gridTemplateColumns:"160px 1fr",gap:12}}>
              <div style={styles.photoBox}>
                {photoUrl ? <img src={photoUrl} alt="photo" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:10}}/> : <div style={styles.photoHint}>Foto yok</div>}
              </div>

              <div>
                <div className="no-print" style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
                  <div style={{fontSize:12,color:"#7b8bb3"}}>Sonuçlar: seç → model dolsun.</div>
                  <button style={styles.ghostBtn} onClick={onPrintSearch}>Yazdır / PDF</button>
                </div>

                <div className="print-area" style={styles.searchList}>
                  {searchResults.map((m)=>{
                    const deptName = DEMO.customers.flatMap(c=>c.departments).find(d=>d.id===m.deptId)?.name || m.deptId;
                    const effNames = (m.effects||[]).map(id=>DEMO.effects.find(e=>e.id===id)?.name).filter(Boolean).join(", ");
                    return (
                      <button
                        key={m.model}
                        className="print-card"
                        onClick={()=>onPickModelFromSearch(m)}
                        style={{...styles.searchRowBtn,...(selectedSearchModel===m.model?styles.searchRowBtnActive:null)}}
                      >
                        <div style={styles.thumb}>{m.model.slice(0,2)}</div>
                        <div style={{textAlign:"left"}}>
                          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                            <div style={{fontWeight:950}}>{m.model}</div>
                            <Pill text={`${Math.round(m.score*100)}%`} />
                            <span style={{fontSize:11,color:"#7b8bb3"}}>{daysBetweenNow(m.lastAt)} gün önce</span>
                          </div>
                          <div style={{marginTop:4,fontSize:12,color:"#2a3a63"}}>
                            {m.boyaTuru||"—"} • Seg {m.colorSeg||"—"} • {effNames||"Efekt yok"} • {deptName}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{fontSize:11,color:"#7b8bb3"}}>REV-2: gerçek benzerlik (embedding). Şimdilik UX oturuyor.</div>
          </Card>

          <Card title="MODEL & TUR">
            <Field label="Model">
              <Input value={model} onChange={(e)=>setModel(e.target.value)} placeholder="Model adı" />
            </Field>

            <Row>
              <Field label="Müşteri">
                <Select value={customerId} onChange={(e)=>setCustomerId(e.target.value)}>
                  {DEMO.customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </Field>

              <Field label="Departman">
                <Select value={deptId} onChange={(e)=>setDeptId(e.target.value)}>
                  {departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>
              </Field>
            </Row>

            {/* ✅ Vardiya gerçek mantık burada */}
            <Card title="Makine & Vardiya Planı" right={<Pill text={`Min Ciro: ${fmtTRY(machine?.minDailyCiro)} TL`} />}>
              <Row>
                <Field label="Makine">
                  <Select value={machineId} onChange={(e)=>setMachineId(e.target.value)}>
                    {DEMO.machines.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
                  </Select>
                </Field>

                <Field label="Makine giriş" hint="Lokasyondan otomatik">
                  <Input value={machinePassCount} readOnly />
                </Field>
              </Row>

              <div style={styles.shiftGrid}>
                <div style={styles.shiftBox}>
                  <div style={styles.shiftTitle}>
                    <label style={styles.chk}>
                      <input type="checkbox" checked={useDay} onChange={(e)=>setUseDay(e.target.checked)} /> Gündüz
                    </label>
                    <Pill text={`${Math.round(dayOutEffective||0)} / vardiya`} />
                  </div>
                  <Row>
                    <Field label="Saat">
                      <Input type="number" min={1} max={24} value={dayShiftHours} onChange={(e)=>setDayShiftHours(e.target.value)} />
                    </Field>
                    <Field label="Adet / Vardiya (manuel)" hint={`Boş: ref ${machine?.refDay||"—"}`}>
                      <Input type="number" min={0} value={dayOutManual} onChange={(e)=>setDayOutManual(e.target.value)} placeholder="örn 3000" />
                    </Field>
                  </Row>
                </div>

                <div style={styles.shiftBox}>
                  <div style={styles.shiftTitle}>
                    <label style={styles.chk}>
                      <input type="checkbox" checked={useNight} onChange={(e)=>setUseNight(e.target.checked)} /> Gece
                    </label>
                    <Pill text={`${Math.round(nightOutEffective||0)} / vardiya`} />
                  </div>
                  <Row>
                    <Field label="Saat">
                      <Input type="number" min={1} max={24} value={nightShiftHours} onChange={(e)=>setNightShiftHours(e.target.value)} />
                    </Field>
                    <Field label="Adet / Vardiya (manuel)" hint={`Boş: ref ${machine?.refNight||"—"}`}>
                      <Input type="number" min={0} value={nightOutManual} onChange={(e)=>setNightOutManual(e.target.value)} placeholder="örn 2800" />
                    </Field>
                  </Row>
                </div>
              </div>

              <div style={styles.machineSummary}>
                <div style={{display:"grid",gap:4}}>
                  <div style={styles.machineSumTitle}>Günlük kapasite</div>
                  <div style={styles.machineSumText}>
                    {dailyCapacity ? (
                      <>
                        <b>{Math.round(dailyCapacity)}</b> adet/gün (G{useDay?`:${Math.round(dayOutEffective)}`:""}{useNight?` + N:${Math.round(nightOutEffective)}`:""})
                      </>
                    ) : (
                      "Vardiya seçilmedi."
                    )}
                  </div>
                </div>
                <div style={{display:"grid",gap:4}}>
                  <div style={styles.machineSumTitle}>Plan</div>
                  <div style={styles.machineSumText}>
                    {dailyCapacity ? (
                      <>
                        {qtyOffer} adet ≈ <b>{estDays.toFixed(2)} gün</b> / <b>{estShiftCount} vardiya</b>
                      </>
                    ) : "—"}
                  </div>
                </div>
              </div>

              <div style={{fontSize:11,color:"#7b8bb3"}}>
                Not: Gerçek “gündüz/gece kaç vardiya basıldı” bilgisi üretimde satıra işlenecek (dayShiftsUsed/nightShiftsUsed).
              </div>
            </Card>

            <Row>
              <Field label="Durum">
                <Select value={status} onChange={(e)=>setStatus(e.target.value)}>
                  <option value="DEVAM">Devam</option>
                  <option value="REVIZE">Revize</option>
                  <option value="MK">m.k</option>
                </Select>
              </Field>
              <Field label="Boya Türü">
                <Select value={boyaTuru} onChange={(e)=>setBoyaTuru(e.target.value)}>
                  <option value="Su Bazlı">Su Bazlı</option>
                  <option value="Plastisol">Plastisol</option>
                  <option value="Pigment">Pigment</option>
                  <option value="Reaktif">Reaktif</option>
                </Select>
              </Field>
            </Row>

            {status==="MK" ? (
              <Field label="m.k sebep (zorunlu)">
                <Input value={mkReason} onChange={(e)=>setMkReason(e.target.value)} placeholder="Sebep" />
              </Field>
            ) : null}

            <Row>
              <Field label="Renk Sayısı" hint={`Segment: ${colorSeg}`}>
                <Input type="number" min={1} max={11} value={colorCount} onChange={(e)=>setColorCount(e.target.value)} />
              </Field>
              <Field label="Sipariş Adedi">
                <Input type="number" min={0} value={qtyOffer} onChange={(e)=>setQtyOffer(e.target.value)} />
              </Field>
            </Row>

            <Field label="Efekt(ler)" hint="çoklu seç">
              <Select multiple value={effects} onChange={(e)=>{
                const opts=Array.from(e.target.options).filter(o=>o.selected).map(o=>o.value);
                setEffects(opts);
              }} style={{height:92}}>
                {DEMO.effects.map(ef=>(
                  <option key={ef.id} value={ef.id}>{ef.name} (+{fmtTRY(ef.tl)} TL)</option>
                ))}
              </Select>
            </Field>

            <Row>
              <Field label="En (cm)"><Input type="number" min={0} value={en} onChange={(e)=>setEn(e.target.value)} /></Field>
              <Field label="Boy (cm)" hint={`Alan: ${fmtTRY(area.area)} cm² • /100: ${fmtTRY(area.factor)}`}>
                <Input type="number" min={0} value={boy} onChange={(e)=>setBoy(e.target.value)} />
              </Field>
            </Row>

            <Field label="Lokasyon">
              <div style={styles.checkRow}>
                <label style={styles.chk}><input type="checkbox" checked={locOn} onChange={(e)=>setLocOn(e.target.checked)} /> Ön</label>
                <label style={styles.chk}><input type="checkbox" checked={locArka} onChange={(e)=>setLocArka(e.target.checked)} /> Arka</label>
                <label style={styles.chk}><input type="checkbox" checked={locKol} onChange={(e)=>setLocKol(e.target.checked)} /> Kol</label>
                <label style={styles.chk}><input type="checkbox" checked={locEnse} onChange={(e)=>setLocEnse(e.target.checked)} /> Ense</label>
              </div>
            </Field>
          </Card>
        </div>

        {/* RIGHT */}
        <div style={{display:"grid",gap:12}}>
          <Card title="Fiyatlandırma" right={<Pill text={`Dept: ${deptAdj.value>0?"+":""}${deptAdj.value||0}%`} />}>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr><th style={{textAlign:"left"}}>Kalem</th><th style={{textAlign:"right"}}>TL</th><th style={{textAlign:"left"}}>Açıklama</th></tr>
                </thead>
                <tbody>
                  {locTL.items.map(it=>(
                    <tr key={it.key}>
                      <td>{it.label}</td>
                      <td style={{textAlign:"right",fontFamily:"var(--mono)"}}>{fmtTRY(it.tl)}</td>
                      <td style={{color:"#93a6d6"}}>{it.note}</td>
                    </tr>
                  ))}
                  <tr><td>Alan / Boya</td><td style={{textAlign:"right",fontFamily:"var(--mono)"}}>{fmtTRY(paintTL)}</td><td style={{color:"#93a6d6"}}>cm²/100 × boya</td></tr>
                  {effectsTL.items.map(ef=>(
                    <tr key={ef.id}><td>Efekt: {ef.name}</td><td style={{textAlign:"right",fontFamily:"var(--mono)"}}>{fmtTRY(ef.tl)}</td><td style={{color:"#93a6d6"}}>TL ek</td></tr>
                  ))}
                  <tr><td style={{fontWeight:700}}>Sistem (ham)</td><td style={{textAlign:"right",fontFamily:"var(--mono)",fontWeight:700}}>{fmtTRY(systemUnitRaw)}</td><td style={{color:"#93a6d6"}}>Lok+Alan+Efekt</td></tr>
                  <tr><td style={{fontWeight:900}}>Sistem Birim</td><td style={{textAlign:"right",fontFamily:"var(--mono)",fontWeight:900}}>{fmtTRY(systemUnit)}</td><td style={{color:"#93a6d6"}}>Dept düzeltmeli</td></tr>
                </tbody>
              </table>
            </div>

            <div style={styles.priceBox}>
              <div>
                <div style={styles.priceLabel}>Sistem</div>
                <div style={styles.priceValue}>{fmtTRY(systemUnit)} TL</div>
              </div>

              <div style={{width:1,background:"rgba(255,255,255,.08)"}} />

              <div style={{minWidth:260}}>
                <div style={styles.priceLabel}>Nihai (editable)</div>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <Input style={{fontFamily:"var(--mono)",fontSize:16}} value={finalUnit} onChange={(e)=>setFinalUnit(e.target.value)} />
                  <Pill text={`${diffPct>=0?"+":""}${fmtTRY(diffPct)}%`} tone={Math.abs(diffPct)<0.5?"muted":diffPct>0?"good":"warn"} />
                </div>
                {needReason ? (
                  <Field label="Sebep (zorunlu)">
                    <Input value={priceReason} onChange={(e)=>setPriceReason(e.target.value)} placeholder="pazar / termin / rekabet" />
                  </Field>
                ) : (
                  <div style={{marginTop:8,color:"#7b8bb3",fontSize:12}}>Aynıysa sebep şart değil.</div>
                )}
              </div>
            </div>
          </Card>

          <Card
            title="Karlılık (Gündüz+Gece kapasiteye göre)"
            right={<Pill text={profitTone==="good"?"🟢 Karlı":profitTone==="warn"?"🟡 Sınır":profitTone==="bad"?"🔴 Zarar":"—"} tone={profitTone} />}
          >
            <div style={{display:"grid",gridTemplateColumns:"1.2fr .8fr",gap:12}}>
              <div style={styles.kpiGrid}>
                <div style={styles.kpi}>
                  <div style={styles.kpiLabel}>Günlük kapasite</div>
                  <div style={styles.kpiValue}>{Math.round(dailyCapacity||0)}</div>
                  <div style={styles.kpiHint}>G+N toplam</div>
                </div>
                <div style={styles.kpi}>
                  <div style={styles.kpiLabel}>Tahmini vardiya</div>
                  <div style={styles.kpiValue}>{estShiftCount||0}</div>
                  <div style={styles.kpiHint}>plan</div>
                </div>
                <div style={styles.kpi}>
                  <div style={styles.kpiLabel}>Min günlük ciro</div>
                  <div style={styles.kpiValue}>{fmtTRY(dailyThreshold)} TL</div>
                  <div style={styles.kpiHint}>makine</div>
                </div>
                <div style={styles.kpi}>
                  <div style={styles.kpiLabel}>Günlük ciro (öngörü)</div>
                  <div style={styles.kpiValue}>{fmtTRY(dailyCiro)} TL</div>
                  <div style={styles.kpiHint}>birim×kapasite</div>
                </div>
              </div>

              <div style={styles.profitBox}>
                <div style={{fontSize:12,color:"#7b8bb3"}}>Ciro farkı</div>
                <div style={{fontFamily:"var(--mono)",fontSize:22,fontWeight:950}}>
                  {profitDelta>=0?"+":""}{fmtTRY(profitDelta)} TL
                </div>
                <div style={{fontSize:12,color:"#7b8bb3"}}>Minimum güvenli: {minSafeUnit?`${fmtTRY(minSafeUnit)} TL`:"—"}</div>
              </div>
            </div>
          </Card>

          <Card title="AI Hafıza (plan + minimum güvenli)" right={<Pill text={`${historyMonths} ay`} />}>
            <div style={styles.aiLine}>
              <div style={{fontWeight:950}}>AI:</div>
              <div style={{color:"#2a3a63"}}>{aiText}</div>
            </div>

            <div style={{marginTop:10,color:"#7b8bb3",fontSize:12}}>
              REV-2: Üretim gerçekleşeni (gündüz kaç vardiya / gece kaç vardiya) üretim modülünden satıra işlenecek.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page:{ padding:16 },
  pageHeader:{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,marginBottom:12 },
  hTitle:{ fontSize:14,fontWeight:950,letterSpacing:0.3 },
  hSub:{ marginTop:4,fontSize:12,color:"#7b8bb3" },
  grid:{ display:"grid",gridTemplateColumns:"420px 1fr",gap:12,alignItems:"start" },

  card:{ background:"#fff",border:"1px solid #e8edf6",borderRadius:12,overflow:"hidden" },
  cardHeader:{ padding:"12px 12px 10px 12px",borderBottom:"1px solid #eef2fb",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10 },
  cardTitle:{ fontSize:13,fontWeight:950 },
  cardBody:{ padding:12,display:"grid",gap:10 },

  field:{ display:"grid",gap:6 },
  fieldLabelRow:{ display:"flex",justifyContent:"space-between",gap:10,alignItems:"baseline" },
  fieldLabel:{ fontSize:12,fontWeight:900,color:"#23335a" },
  fieldHint:{ fontSize:11,color:"#7b8bb3" },

  input:{ width:"100%",padding:"10px 10px",borderRadius:10,border:"1px solid #d9e2f5",outline:"none",background:"#fff",fontSize:13 },

  checkRow:{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,padding:10,border:"1px solid #d9e2f5",borderRadius:10,background:"#fbfcff" },
  chk:{ display:"flex",alignItems:"center",gap:8,fontSize:12,color:"#23335a" },

  tableWrap:{ border:"1px solid #e8edf6",borderRadius:12,overflow:"hidden",background:"#fff" },
  table:{ width:"100%",borderCollapse:"collapse",fontSize:12 },

  priceBox:{ display:"grid",gridTemplateColumns:"1fr 1px 1.2fr",gap:12,padding:12,border:"1px solid #e8edf6",borderRadius:12,background:"#fbfcff",alignItems:"start" },
  priceLabel:{ fontSize:12,color:"#7b8bb3",fontWeight:900 },
  priceValue:{ fontSize:22,fontWeight:950,letterSpacing:0.2,marginTop:4 },

  primaryBtn:{ border:"1px solid rgba(106,166,255,.35)",background:"rgba(106,166,255,.12)",color:"#0b2b5f",padding:"10px 12px",borderRadius:10,cursor:"pointer",fontWeight:950 },
  secondaryBtn:{ border:"1px solid #111",background:"#111",color:"#fff",padding:"10px 12px",borderRadius:10,cursor:"pointer",fontWeight:950 },
  ghostBtn:{ border:"1px solid #e1e8fb",background:"#fff",color:"#2a3a63",padding:"8px 10px",borderRadius:10,cursor:"pointer",fontWeight:900 },

  kpiGrid:{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 },
  kpi:{ border:"1px solid #e8edf6",borderRadius:12,padding:12,background:"#fbfcff" },
  kpiLabel:{ fontSize:11,color:"#7b8bb3",fontWeight:900 },
  kpiValue:{ marginTop:6,fontSize:18,fontWeight:950,fontFamily:"var(--mono)" },
  kpiHint:{ marginTop:4,fontSize:11,color:"#7b8bb3" },

  profitBox:{ border:"1px solid #e8edf6",borderRadius:12,padding:12,background:"#fff",display:"grid",gap:6,alignContent:"start" },
  aiLine:{ display:"grid",gridTemplateColumns:"40px 1fr",gap:10,padding:12,borderRadius:12,border:"1px solid #e8edf6",background:"#fbfcff",fontSize:12,alignItems:"start" },

  photoBox:{ width:160,height:160,borderRadius:12,border:"1px dashed #d9e2f5",background:"#fbfcff",overflow:"hidden",display:"grid",placeItems:"center" },
  photoHint:{ fontSize:12,color:"#7b8bb3" },

  searchList:{ marginTop:10,display:"grid",gap:8,maxHeight:340,overflow:"auto",paddingRight:2 },
  searchRowBtn:{ border:"1px solid #e8edf6",background:"#fff",borderRadius:12,padding:10,cursor:"pointer",display:"grid",gridTemplateColumns:"44px 1fr",gap:10,alignItems:"center" },
  searchRowBtnActive:{ borderColor:"rgba(106,166,255,.55)",background:"rgba(106,166,255,.08)" },
  thumb:{ width:44,height:44,borderRadius:12,border:"1px solid #e8edf6",background:"#fbfcff",display:"grid",placeItems:"center",fontWeight:950,color:"#2a3a63" },

  shiftGrid:{ display:"grid",gridTemplateColumns:"1fr",gap:10 },
  shiftBox:{ border:"1px solid #e8edf6",borderRadius:12,padding:12,background:"#fff" },
  shiftTitle:{ display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,marginBottom:10 },

  machineSummary:{ border:"1px solid #e8edf6",borderRadius:12,padding:12,background:"#fbfcff",display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 },
  machineSumTitle:{ fontSize:11,color:"#7b8bb3",fontWeight:900 },
  machineSumText:{ fontSize:12,color:"#23335a" },
};

// basic table css
if(typeof document!=="undefined"){
  const id="turlama-table-css";
  if(!document.getElementById(id)){
    const st=document.createElement("style");
    st.id=id;
    st.innerHTML=`
      table thead th{ padding:10px 10px; background:#fbfcff; border-bottom:1px solid #eef2fb; font-weight:950; color:#23335a; font-size:12px; }
      table tbody td{ padding:10px 10px; border-bottom:1px solid #f0f3fb; vertical-align:top; }
      table tbody tr:last-child td{ border-bottom:none; }
      :root { --mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
    `;
    document.head.appendChild(st);
  }
}
