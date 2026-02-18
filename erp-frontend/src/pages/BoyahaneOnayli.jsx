import React, { useEffect, useMemo, useState } from "react";

// LocalStorage keys (aynen korunuyor)
const LS_POOL = "boyahane_color_pool_v1";
const LS_LOG = "boyahane_islem_log_v1";
const LS_ACTIVE = "boyahane_active_snapshot_v1";

// Yardımcılar
const uid = () => Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const nowTR = () => new Date().toLocaleString("tr-TR");

const pillClass = (status) => {
  if (status === "AKTIF") return "ok";
  if (status === "DUZENLENMIS") return "warn";
  return "off";
};
const pillText = (status) => {
  if (status === "AKTIF") return "AKTİF";
  if (status === "DUZENLENMIS") return "DÜZENLENMİŞ";
  return "PASİF";
};

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// Varsayılan DEMO içeriği (REV-1 HTML ile uyumlu)
const defaultMixRows = [
  { no: "NO1", urun: "S10 ŞEFFAF", marka: "URAS", lot: "23070321", pct: 50, grkg: 30, gr1: "", gr2: "", gr3: "", gr4: "", note: "" },
  { no: "NO2", urun: "S20 BEYAZ", marka: "URAS", lot: "23070345", pct: 50, grkg: 120, gr1: "", gr2: "", gr3: "", gr4: "", note: "" },
];

const defaultColors = [
  { id: "c1", no: 1, code: "18-1663", page: "136", name: "AÇIK MAVİ", boya: "SUBAZLI", status: "AKTIF" },
  { id: "c2", no: 2, code: "13-2801", page: "112", name: "PEMBE", boya: "SUBAZLI", status: "AKTIF" },
  { id: "c3", no: 3, code: "12-1009", page: "98", name: "TEN", boya: "SUBAZLI", status: "DUZENLENMIS" },
];

function loadPool(seedRows) {
  try {
    const raw = localStorage.getItem(LS_POOL);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore parse error */
  }
  const seed = [
    {
      id: "r001",
      createdAt: new Date().toISOString(),
      orderIndex: 1,
      colorCode: "18-1663",
      colorName: "AÇIK MAVİ",
      boyaTuru: "SUBAZLI",
      version: "v1",
      hex: "#4aa3ff",
      snapshot: { mixRows: [...seedRows], kat: 1, note: "seed" },
    },
    {
      id: "r002",
      createdAt: new Date().toISOString(),
      orderIndex: 2,
      colorCode: "18-1663",
      colorName: "AÇIK MAVİ",
      boyaTuru: "SUBAZLI",
      version: "v2",
      hex: "#4aa3ff",
      snapshot: { mixRows: [...seedRows], kat: 2, note: "seed" },
    },
    {
      id: "r003",
      createdAt: new Date().toISOString(),
      orderIndex: 3,
      colorCode: "13-2801",
      colorName: "PEMBE",
      boyaTuru: "SUBAZLI",
      version: "v1",
      hex: "#ff6fb1",
      snapshot: { mixRows: [...seedRows], kat: 1, note: "seed" },
    },
  ];
  localStorage.setItem(LS_POOL, JSON.stringify(seed));
  return seed;
}
function savePool(pool) {
  localStorage.setItem(LS_POOL, JSON.stringify(pool));
}

function loadLogs() {
  try {
    const raw = localStorage.getItem(LS_LOG);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore parse error */
  }
  const seed = [];
  localStorage.setItem(LS_LOG, JSON.stringify(seed));
  return seed;
}
function saveLogs(logs) {
  localStorage.setItem(LS_LOG, JSON.stringify(logs));
}

function saveActiveSnapshot({ selectedColor, kat, mixRows }) {
  const snap = {
    selectedColorId: selectedColor?.id || null,
    colorCode: selectedColor?.code || "",
    boyaTuru: selectedColor?.boya || "",
    kat,
    mixRows,
  };
  localStorage.setItem(LS_ACTIVE, JSON.stringify(snap));
}
function loadActiveSnapshot() {
  try {
    const raw = localStorage.getItem(LS_ACTIVE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function computeKgFromMix() {
  return "—";
}

export default function BoyahaneOnayli() {
  // Üst bilgi alanları (demo)
  const [modelName, setModelName] = useState("NAYSEN");
  const [modelDesc, setModelDesc] = useState("");
  const [zemin, setZemin] = useState("EKRU");
  const [tarih, setTarih] = useState(todayStr());
  const [adet, setAdet] = useState("");
  const [sorumlu, setSorumlu] = useState("");

  // Ana state
  const [dirty, setDirty] = useState(false);
  const initialActive = loadActiveSnapshot();
  const [kat, setKat] = useState(() => (Number.isFinite(Number(initialActive?.kat)) ? Number(initialActive?.kat) : 1));
  const [colors, setColors] = useState(defaultColors);
  const [selectedId, setSelectedId] = useState("c1");
  const [mixRows, setMixRows] = useState(() => (Array.isArray(initialActive?.mixRows) ? initialActive.mixRows : defaultMixRows));

  // Registered + Logs + Search
  const [pool, _setPool] = useState(() => loadPool(defaultMixRows));
  const [logs, setLogs] = useState(() => loadLogs());
  const [regSearch, setRegSearch] = useState("");

  const selected = useMemo(() => colors.find((c) => c.id === selectedId) || colors[0], [colors, selectedId]);

  const sumPct = useMemo(() => round2(mixRows.reduce((a, r) => a + (Number(r.pct) || 0), 0)), [mixRows]);
  const sumKat = useMemo(() => round2(sumPct * (Number(kat) || 1)), [sumPct, kat]);

  // İlk yükleme: zaten lazy initializer ile state’e alındı
  useEffect(() => {}, []);

  // pool/logs değişince persist
  useEffect(() => {
    savePool(pool);
  }, [pool]);
  useEffect(() => {
    saveLogs(logs);
  }, [logs]);

  // Kullanışlı yardımcılar
  const updateSelectedColor = (patch) => {
    setColors((prev) => prev.map((c) => (c.id === selected.id ? { ...c, ...patch } : c)));
  };

  const renumberMix = (rows) => rows.map((x, idx) => ({ ...x, no: "NO" + (idx + 1) }));

  const onMixChange = (i, key, value) => {
    setMixRows((prev) => {
      const next = [...prev];
      let v = value;
      if (key === "pct" || key === "grkg") v = v === "" ? "" : Number(v);
      next[i] = { ...next[i], [key]: v };
      return next;
    });
    setDirty(true);
  };

  const onDeleteRow = (i) => {
    setMixRows((prev) => {
      const next = prev.filter((_, idx) => idx !== i);
      return renumberMix(next);
    });
    setDirty(true);
  };

  const onAddRow = () => {
    setMixRows((prev) => [...prev, { no: "NO" + (prev.length + 1), urun: "", marka: "", lot: "", pct: "", grkg: "", gr1: "", gr2: "", gr3: "", gr4: "", note: "" }]);
    setDirty(true);
  };

  const applyRegistered = (rec) => {
    const ok = window.confirm("Kayıtlı renk seçildi. Mevcut tablo üzerine yazılacak. Devam?");
    if (!ok) return;

    updateSelectedColor({
      code: rec.colorCode,
      name: rec.colorName || selected.name,
      boya: rec.boyaTuru || selected.boya,
      status: "DUZENLENMIS",
    });

    const newKat = num(rec.snapshot?.kat) || 1;
    const newRows = (rec.snapshot?.mixRows || []).map((r, idx) => ({
      no: r.no || "NO" + (idx + 1),
      urun: r.urun || "",
      marka: r.marka || "",
      lot: r.lot || "",
      pct: r.pct ?? "",
      grkg: r.grkg ?? "",
      gr1: r.gr1 ?? "",
      gr2: r.gr2 ?? "",
      gr3: r.gr3 ?? "",
      gr4: r.gr4 ?? "",
      note: r.note || "",
    }));

    setKat(newKat);
    setMixRows(newRows);
    setDirty(true);

    saveActiveSnapshot({ selectedColor: { ...selected, code: rec.colorCode, boya: rec.boyaTuru }, kat: newKat, mixRows: newRows });
  };

  const applyLog = (lg) => {
    const ok = window.confirm("Log kaydı seçildi. Snapshot geri yüklenecek. Devam?");
    if (!ok) return;

    updateSelectedColor({ code: lg.colorCode, boya: lg.boyaTuru, status: "DUZENLENMIS" });

    const newKat = num(lg.snapshot?.kat) || 1;
    const newRows = (lg.snapshot?.mixRows || []).map((r, idx) => ({
      no: r.no || "NO" + (idx + 1),
      urun: r.urun || "",
      marka: r.marka || "",
      lot: r.lot || "",
      pct: r.pct ?? "",
      grkg: r.grkg ?? "",
      gr1: r.gr1 ?? "",
      gr2: r.gr2 ?? "",
      gr3: r.gr3 ?? "",
      gr4: r.gr4 ?? "",
      note: r.note || "",
    }));

    setKat(newKat);
    setMixRows(newRows);
    setDirty(true);

    saveActiveSnapshot({ selectedColor: { ...selected, code: lg.colorCode, boya: lg.boyaTuru }, kat: newKat, mixRows: newRows });
  };

  const onSave = () => {
    if (!selected) return;
    const log = {
      id: uid(),
      when: nowTR(),
      status: "DÜZENLENDİ",
      colorCode: selected.code || "",
      boyaTuru: selected.boya || "",
      hex: "#999",
      kg: computeKgFromMix(),
      snapshot: { kat, mixRows },
    };
    setLogs((prev) => [...prev, log]);

    updateSelectedColor({ status: "AKTIF" });
    setDirty(false);

    saveActiveSnapshot({ selectedColor: selected, kat, mixRows });
    window.alert("Kaydedildi (log eklendi).");
  };

  const onPassiveToggle = () => {
    const next = selected.status === "PASIF" ? "AKTIF" : "PASIF";
    updateSelectedColor({ status: next });
    setDirty(true);
    saveActiveSnapshot({ selectedColor: { ...selected, status: next }, kat, mixRows });
  };

  const onAddColor = () => {
    const maxNo = colors.reduce((m, x) => Math.max(m, x.no || 0), 0);
    const nextNo = maxNo + 1;
    const id = "c" + Date.now();
    const boya = selected?.boya || "SUBAZLI";
    const c = { id, no: nextNo, code: "", page: "", name: "(Yeni)", boya, status: "DUZENLENMIS" };
    setColors((prev) => [...prev, c]);
    setSelectedId(id);
    setDirty(true);
    saveActiveSnapshot({ selectedColor: c, kat, mixRows });
  };

  // Registered (orderIndex sabit, arama sadece filtre)
  const registeredOrdered = useMemo(() => {
    return [...pool].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }, [pool]);
  const registeredMatches = useMemo(() => {
    const code = String(selected?.code || "").trim();
    const q = regSearch.trim().toLowerCase();
    return registeredOrdered
      .filter((x) => String(x.colorCode || "") === code)
      .filter((x) => {
        if (!q) return true;
        const hay = `${x.id} ${x.colorCode} ${x.boyaTuru} ${x.version} ${x.colorName}`.toLowerCase();
        return hay.includes(q);
      });
  }, [registeredOrdered, selected, regSearch]);

  // Kat değişimi
  const onKatChange = (v) => {
    const k = Number(v) || 1;
    setKat(k);
    setDirty(true);
    saveActiveSnapshot({ selectedColor: selected, kat: k, mixRows });
  };

  // Renk bilgisi alanları
  const onColorNameChange = (v) => {
    updateSelectedColor({ name: v, status: "DUZENLENMIS" });
    setDirty(true);
    saveActiveSnapshot({ selectedColor: { ...selected, name: v, status: "DUZENLENMIS" }, kat, mixRows });
  };
  const onColorCodeChange = (v) => {
    updateSelectedColor({ code: v, status: "DUZENLENMIS" });
    setDirty(true);
    saveActiveSnapshot({ selectedColor: { ...selected, code: v, status: "DUZENLENMIS" }, kat, mixRows });
  };
  const onPageChange = (v) => {
    updateSelectedColor({ page: v, status: "DUZENLENMIS" });
    setDirty(true);
    saveActiveSnapshot({ selectedColor: { ...selected, page: v, status: "DUZENLENMIS" }, kat, mixRows });
  };
  const onBoyaChange = (v) => {
    updateSelectedColor({ boya: v, status: "DUZENLENMIS" });
    setDirty(true);
    saveActiveSnapshot({ selectedColor: { ...selected, boya: v, status: "DUZENLENMIS" }, kat, mixRows });
  };

  return (
    <div>
      <style>{`
  :root{
    --bg:#f5f5f5; --card:#fff; --line:#d1d5db; --muted:#6b7280; --soft:#fafafa; --black:#111;
    --accent:#eef2ff;
  }
  *{box-sizing:border-box;font-family:Arial,sans-serif;}
  body{margin:0;background:var(--bg);color:#111;}
  header{
    position:sticky;top:0;z-index:10;background:#fff;border-bottom:1px solid var(--line);
    padding:10px 14px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;
  }
  .title{font-weight:900;letter-spacing:.2px}
  .muted{font-size:12px;color:var(--muted)}
  .btn{border:1px solid var(--line);background:#fff;padding:7px 10px;border-radius:8px;font-weight:800;cursor:pointer}
  .btn.dark{background:var(--black);border-color:var(--black);color:#fff}
  .btn.warn{background:#fff7ed;border-color:#fed7aa}
  .pill{display:inline-block;font-size:11px;font-weight:900;padding:3px 8px;border-radius:999px;border:1px solid var(--line);background:#fff}
  .pill.ok{background:#ecfdf5;border-color:#a7f3d0}
  .pill.warn{background:#fff7ed;border-color:#fed7aa}
  .pill.off{background:#f3f4f6;border-color:#e5e7eb}

  main{max-width:1680px;margin:0 auto;padding:14px;display:grid;gap:12px;}
  .card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:12px;}
  .field{display:grid;gap:4px;}
  .field label{font-size:12px;color:var(--muted);font-weight:800}
  .field input,.field select,.field textarea{
    padding:7px;border:1px solid var(--line);border-radius:8px;width:100%;background:#fff;
  }
  .row{display:flex;gap:10px;flex-wrap:wrap;align-items:end}
  .subhead{font-weight:900}
  .headRow{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
  .divider{height:1px;background:var(--line);margin:10px 0}
  .mono{font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;}

  /* TOP GRID */
  .topGrid{display:grid;grid-template-columns:300px 460px 1fr;gap:12px;align-items:start;}
  .modelImg{
    height:260px;border:1px dashed #9ca3af;border-radius:10px;background:var(--soft);
    display:grid;place-items:center;color:var(--muted);font-weight:900;
  }

  /* MODEL COLORS LIST */
  .list{border:1px solid var(--line);border-radius:10px;background:var(--soft);display:flex;flex-direction:column;min-height:360px}
  .listHead{padding:10px;border-bottom:1px solid var(--line);background:#fff;display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center}
  .listBody{overflow:auto;max-height:360px;}
  .item{padding:10px;border-bottom:1px solid var(--line);cursor:pointer}
  .item:hover{background:#f3f4f6}
  .item.active{background:var(--accent)}
  .itemTop{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
  .bigCode{font-weight:900;font-size:14px}
  .bigPage{font-weight:900}
  .smallName{font-size:12px;color:#374151;margin-top:2px}
  .noTag{font-weight:900}

  /* TABLE (tight) */
  .tableWrap{border:1px solid var(--line);border-radius:10px;overflow:auto;background:#fff;}
  table{border-collapse:collapse;width:100%;min-width:1100px;}
  th,td{border:1px solid var(--line);padding:5px 6px;font-size:13px;white-space:nowrap;vertical-align:middle;}
  th{background:#f3f4f6;font-weight:900;text-align:left;}
  .cell{width:100%;height:26px;padding:4px 6px;border:1px solid #cbd5e1;border-radius:4px;font-size:13px;background:#fff;}
  .cell.num{text-align:right;}
  .xbtn{width:28px;height:26px;border:1px solid var(--line);background:#fff;border-radius:6px;cursor:pointer;font-weight:900}

  /* Kat + totals bar */
  .bar{
    display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;
    padding:10px;border:1px solid var(--line);border-radius:10px;background:#fff;
  }
  .leftBar{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
  .inKat{width:70px;padding:6px 8px;border:1px solid var(--line);border-radius:8px;font-weight:900;text-align:right}
  .scrollHint{font-size:11px;color:var(--muted)}

  /* MASTER: Registered (TOP) + Log (BOTTOM) */
  .stack{display:flex;flex-direction:column;gap:12px}
  .stackCard{border:1px solid var(--line);border-radius:10px;background:#fff;overflow:hidden}
  .stackH{
    padding:10px 12px;border-bottom:1px solid var(--line);
    display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;
    background:#fff;
  }
  .stackH b{font-size:13px}
  .stackH span{font-size:12px;color:var(--muted)}
  .stackB{padding:10px 12px;max-height:280px;overflow:auto;background:#fff}
  .searchRow{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
  .searchRow input{
    width:280px;padding:8px 10px;border-radius:10px;border:1px solid var(--line);background:#fff;
    font-size:12px;outline:none
  }
  .searchRow input:focus{border-color:#93c5fd}
  .miniList{display:flex;flex-direction:column;gap:8px}
  .miniItem{
    border:1px solid #e5e7eb;border-radius:10px;padding:10px;cursor:pointer;
    display:flex;align-items:center;justify-content:space-between;gap:10px;
    background:#fff;
  }
  .miniItem:hover{background:#f9fafb}
  .miniItem .l{display:flex;gap:10px;align-items:center;min-width:0}
  .sw{width:16px;height:16px;border-radius:5px;border:1px solid #d1d5db;flex:0 0 auto}
  .info{min-width:0}
  .info b{font-size:12px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .info small{font-size:12px;color:var(--muted);display:block;margin-top:3px}
  .tag{font-size:11px;font-weight:900;border:1px solid var(--line);border-radius:999px;padding:2px 8px;background:#fff}
  .tag.dim{color:#6b7280}

  @media(max-width:1100px){
    .topGrid{grid-template-columns:1fr}
    .searchRow input{width:100%}
  }
      `}</style>

      <header>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div className="title">ERP • BOYAHANE (TEK EKRAN) — MASTER</div>
          <span className="pill ok">REV-1</span>
          <span className="muted">Model → Renk (NO) → Boya Yapımı → Kaydet → Log</span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn" onClick={() => window.alert("Demo: Güncelle")}>Güncelle</button>
          <button className="btn dark" onClick={onSave}>Kaydet</button>
          <button className="btn warn" onClick={onPassiveToggle}>Pasif</button>
        </div>
      </header>

      <main>
        {/* TOP: Model + Model Renkleri + Üst Bilgi */}
        <section className="card">
          <div className="topGrid">
            {/* Model */}
            <div style={{ display: "grid", gap: 10 }}>
              <div className="field">
                <label>MODEL ADI</label>
                <input value={modelName} onChange={(e) => setModelName(e.target.value)} />
              </div>
              <div className="modelImg">MODEL GÖRSELİ</div>
              <div className="field">
                <label>AÇIKLAMA</label>
                <textarea rows={3} placeholder="Not..." value={modelDesc} onChange={(e) => setModelDesc(e.target.value)} />
              </div>
            </div>

            {/* Model Renkleri */}
            <div className="list">
              <div className="listHead">
                <div>
                  <div className="subhead">MODEL RENKLERİ</div>
                  <div className="muted">NO 1..N • Renk kodu ve sayfa no büyük • Renk adı küçük</div>
                </div>
                <button className="btn" onClick={onAddColor}>Renk Ekle</button>
              </div>
              <div className="listBody">
                {[...colors].sort((a, b) => a.no - b.no).map((c) => {
                  const active = c.id === selected?.id;
                  return (
                    <div key={c.id} className={`item ${active ? "active" : ""}`} onClick={() => { setSelectedId(c.id); setDirty(false); }}>
                      <div className="itemTop">
                        <div style={{ minWidth: 0 }}>
                          <div className="bigCode">
                            <span className="noTag">NO {c.no}</span>
                            <span> • </span>
                            <span className="mono">{c.code || "-"}</span>
                            <span> • </span>
                            <span className="bigPage mono">S:{c.page || "-"}</span>
                          </div>
                          <div className="smallName">{c.name || "(Adsız)"}</div>
                        </div>
                        <span className={`pill ${pillClass(c.status)}`}>{pillText(c.status)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ padding: "8px 10px", background: "#fff", borderTop: "1px solid var(--line)" }}>
                <div className="scrollHint">12–15 renk için scroll aktif.</div>
              </div>
            </div>

            {/* Üst Bilgi */}
            <div style={{ display: "grid", gap: 12 }}>
              <div className="card" style={{ background: "var(--soft)" }}>
                <div className="headRow">
                  <div>
                    <div className="subhead">ÜST BİLGİ</div>
                    <div className="muted">Zemin / Tarih / Adet / Sorumlu</div>
                  </div>
                  {dirty ? <span className="pill warn">Kaydedilmemiş</span> : null}
                </div>
                <div style={{ height: 8 }} />
                <div className="row">
                  <div className="field" style={{ minWidth: 160, flex: 1 }}>
                    <label>Zemin</label>
                    <input value={zemin} onChange={(e) => setZemin(e.target.value)} />
                  </div>
                  <div className="field" style={{ minWidth: 160, flex: 1 }}>
                    <label>Tarih</label>
                    <input type="date" value={tarih} onChange={(e) => setTarih(e.target.value)} />
                  </div>
                  <div className="field" style={{ minWidth: 120, flex: 0.7 }}>
                    <label>Adet</label>
                    <input type="number" placeholder="0" value={adet} onChange={(e) => setAdet(e.target.value)} />
                  </div>
                  <div className="field" style={{ minWidth: 220, flex: 1.2 }}>
                    <label>Sorumlu</label>
                    <input placeholder="Çetin Usta" value={sorumlu} onChange={(e) => setSorumlu(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="card" style={{ background: "var(--soft)" }}>
                <div className="subhead">Bilgi</div>
                <div className="muted">Kayıtlı Renkler + Log artık sayfanın en altında (üstte kayıtlı, altta log).</div>
              </div>
            </div>
          </div>
        </section>

        {/* Renk Bilgisi */}
        <section className="card">
          <div className="headRow">
            <div>
              <div className="subhead">RENK BİLGİSİ</div>
              <div className="muted">“Pantone” adı yok: Renk Kodu (Pantone/Müşteri kodu) olarak geçer</div>
            </div>
            <span className={`pill ${pillClass(selected?.status)}`}>{pillText(selected?.status)}</span>
          </div>

          <div style={{ height: 10 }} />

          <div style={{ background: "var(--soft)", border: "1px solid var(--line)", borderRadius: 10, padding: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 220px 160px 200px", gap: 10, alignItems: "end" }}>
              <div className="field">
                <label>Renk No</label>
                <input className="mono" value={selected ? `NO ${selected.no}` : ""} readOnly />
              </div>

              <div className="field">
                <label>Renk Adı (küçük)</label>
                <input value={selected?.name || ""} onChange={(e) => onColorNameChange(e.target.value)} />
              </div>

              <div className="field">
                <label>Renk Kodu (büyük)</label>
                <input className="mono" value={selected?.code || ""} onChange={(e) => onColorCodeChange(e.target.value)} />
              </div>

              <div className="field">
                <label>Sayfa No (büyük)</label>
                <input className="mono" value={selected?.page || ""} onChange={(e) => onPageChange(e.target.value)} />
              </div>

              <div className="field">
                <label>Boya Türü</label>
                <select value={selected?.boya || "SUBAZLI"} onChange={(e) => onBoyaChange(e.target.value)}>
                  <option>SUBAZLI</option>
                  <option>ECOPLAST</option>
                  <option>SİLİKON</option>
                  <option>VARAK TUTKALI</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Boya Yapımı */}
        <section className="card">
          <div className="headRow">
            <div>
              <div className="subhead">BOYA YAPIMI (TEK TABLO)</div>
              <div className="muted">NO1..N = pigment/ürün satırı • GR4 sabit • satırlar sıkı</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn" onClick={onAddRow}>+ NO Satırı</button>
            </div>
          </div>

          <div style={{ height: 10 }} />

          {/* ÜST BAR: Kat + Toplamlar aynı hizada */}
          <div className="bar">
            <div className="leftBar">
              <span className="pill">
                Toplam %: <span className="mono">{sumPct}</span>
              </span>
              <span className="pill">
                Katlı Toplam: <span className="mono">{sumKat}</span>
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="muted" style={{ fontWeight: 800 }}>
                Kat
              </span>
              <input className="inKat mono" type="number" min={1} step={1} value={kat} onChange={(e) => onKatChange(e.target.value)} />
            </div>
          </div>

          <div style={{ height: 10 }} />

          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>NO</th>
                  <th>Ürün / Pigment</th>
                  <th>Marka</th>
                  <th>LOT</th>
                  <th>%</th>
                  <th className="mono">GR/KG</th>
                  <th className="mono">GR1</th>
                  <th className="mono">GR2</th>
                  <th className="mono">GR3</th>
                  <th className="mono">GR4</th>
                  <th>Not</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {mixRows.map((r, i) => (
                  <tr key={i}>
                    <td>
                      <input className="cell mono" value={r.no} onChange={(e) => onMixChange(i, "no", e.target.value)} />
                    </td>
                    <td>
                      <input className="cell" value={r.urun} onChange={(e) => onMixChange(i, "urun", e.target.value)} />
                    </td>
                    <td>
                      <input className="cell" value={r.marka} onChange={(e) => onMixChange(i, "marka", e.target.value)} />
                    </td>
                    <td>
                      <input className="cell mono" value={r.lot} onChange={(e) => onMixChange(i, "lot", e.target.value)} />
                    </td>
                    <td>
                      <input className="cell num" type="number" step="0.01" value={r.pct} onChange={(e) => onMixChange(i, "pct", e.target.value)} />
                    </td>
                    <td>
                      <input className="cell num mono" type="number" step="0.01" value={r.grkg} onChange={(e) => onMixChange(i, "grkg", e.target.value)} />
                    </td>
                    <td>
                      <input className="cell num mono" value={r.gr1} onChange={(e) => onMixChange(i, "gr1", e.target.value)} />
                    </td>
                    <td>
                      <input className="cell num mono" value={r.gr2} onChange={(e) => onMixChange(i, "gr2", e.target.value)} />
                    </td>
                    <td>
                      <input className="cell num mono" value={r.gr3} onChange={(e) => onMixChange(i, "gr3", e.target.value)} />
                    </td>
                    <td>
                      <input className="cell num mono" value={r.gr4} onChange={(e) => onMixChange(i, "gr4", e.target.value)} />
                    </td>
                    <td>
                      <input className="cell" value={r.note} onChange={(e) => onMixChange(i, "note", e.target.value)} />
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button className="xbtn" title="Sil" onClick={() => onDeleteRow(i)}>
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* MASTER: Registered (TOP wide) + Log (BOTTOM) */}
        <section className="card">
          <div className="headRow">
            <div>
              <div className="subhead">KAYITLI RENKLER + İŞLEM LOGU</div>
              <div className="muted">Üstte Kayıtlı Renkler (arama) • Altta Log • tıkla uygula / geri yükle • sıra bozulmaz</div>
            </div>
            <span className="pill off">LOCAL</span>
          </div>

          <div style={{ height: 10 }} />

          <div className="stack">
            {/* Registered TOP */}
            <div className="stackCard">
              <div className="stackH">
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <b>Kayıtlı Renkler (Seçili Renk Koduna Göre)</b>
                  <span>Arama sadece filtreler, orderIndex sırası BOZULMAZ</span>
                </div>
                <div className="searchRow">
                  <input placeholder="Ara: renk kodu, boya türü, versiyon, kayıt id..." value={regSearch} onChange={(e) => setRegSearch(e.target.value)} />
                  <span className="tag dim">{registeredMatches.length}</span>
                </div>
              </div>
              <div className="stackB">
                <div className="miniList">
                  {!String(selected?.code || "").trim() ? (
                    <div className="muted">Seçili renk kodu boş. Önce renk kodu gir.</div>
                  ) : registeredMatches.length === 0 ? (
                    <div className="muted">Bu renk kodu için kayıt yok.</div>
                  ) : (
                    registeredMatches.map((rec) => (
                      <div key={rec.id} className="miniItem" onClick={() => applyRegistered(rec)}>
                        <div className="l">
                          <div className="sw" style={{ background: rec.hex || "#777" }} />
                          <div className="info">
                            <b>
                              {rec.colorCode} • {rec.version || "v?"} • {rec.boyaTuru || "-"}
                            </b>
                            <small>
                              KayıtID: {rec.id} • Sıra: {rec.orderIndex}
                            </small>
                          </div>
                        </div>
                        <span className="tag dim">{rec.boyaTuru || "-"}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Log BOTTOM */}
            <div className="stackCard">
              <div className="stackH">
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <b>Model Boyahane İşlem Logu</b>
                  <span>Kaydet → yeni log • Log tıkla → snapshot geri yükle</span>
                </div>
                <span className="tag dim">{logs.length}</span>
              </div>
              <div className="stackB">
                <div className="miniList">
                  {logs.length === 0 ? (
                    <div className="muted">Henüz log yok.</div>
                  ) : (
                    logs.map((lg) => (
                      <div key={lg.id} className="miniItem" onClick={() => applyLog(lg)}>
                        <div className="l">
                          <div className="sw" style={{ background: lg.hex || "#999" }} />
                          <div className="info">
                            <b>
                              {lg.colorCode} • {lg.boyaTuru} • {lg.status}
                            </b>
                            <small>
                              {lg.when} • LogID: {lg.id}
                            </small>
                          </div>
                        </div>
                        <span className="tag">{lg.kg || "—"} KG</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
