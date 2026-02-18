// C:\ERP\erp-frontend\src\pages\NumunePage.jsx
import React, { useMemo, useState } from "react";

export default function NumunePage() {
  const [numuneNo, setNumuneNo] = useState("");
  const [tarih, setTarih] = useState("");
  const [model, setModel] = useState("");
  const [desen, setDesen] = useState("");
  const [kalip, setKalip] = useState("");
  const [ebat, setEbat] = useState("");
  const [adet, setAdet] = useState("1");
  const [durum, setDurum] = useState("Beklemede");
  const [not, setNot] = useState("");

  const list = useMemo(
    () => [
      { no: "N-0001", tarih: "12.02.2026", model: "KARTAL", ebat: "60x70", adet: 1, durum: "Beklemede" },
      { no: "N-0002", tarih: "13.02.2026", model: "TIGER", ebat: "30x40", adet: 1, durum: "Hazır" },
    ],
    []
  );

  return (
    <div>
      <style>{`
        :root{
          --bg:#f5f5f5;--card:#fff;--line:#d1d5db;
          --muted:#6b7280;--soft:#fafafa;--black:#111;
          --ok:#16a34a;--warn:#f59e0b;--bad:#dc2626;
        }
        *{box-sizing:border-box;font-family:Arial,sans-serif}
        body{margin:0;background:var(--bg);color:#111}
        header{
          position:sticky;top:0;background:#fff;border-bottom:1px solid var(--line);
          padding:10px 14px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;z-index:10
        }
        .title{font-weight:900}
        .muted{font-size:12px;color:var(--muted)}
        .pill{font-size:11px;font-weight:900;padding:3px 8px;border-radius:999px;border:1px solid var(--line);background:#fff;display:inline-block}
        .pill.ok{background:#ecfdf5;border-color:#a7f3d0}
        .pill.warn{background:#fff7ed;border-color:#fed7aa}
        .btn{border:1px solid var(--line);background:#fff;padding:7px 10px;border-radius:8px;font-weight:800;cursor:pointer}
        .btn.dark{background:var(--black);border-color:var(--black);color:#fff}
        .btn.soft{background:var(--soft)}
        main{max-width:1780px;margin:0 auto;padding:14px;display:grid;gap:12px}
        .card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:12px}
        .headRow{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px}
        .subhead{font-weight:900}
        .divider{height:1px;background:var(--line);margin:10px 0}
        .grid2{display:grid;grid-template-columns:520px 1fr;gap:12px}
        @media(max-width:1200px){.grid2{grid-template-columns:1fr}}
        .field{display:grid;gap:4px}
        .field label{font-size:12px;color:var(--muted);font-weight:900}
        .field input,.field select,.field textarea{padding:7px;border:1px solid var(--line);border-radius:8px;background:#fff;width:100%}
        table{border-collapse:collapse;width:100%}
        th,td{border:1px solid var(--line);padding:8px;font-size:13px}
        th{background:var(--soft);font-weight:900;text-align:left}
        .right{text-align:right}
        .mono{font-family:monospace}
      `}</style>

      <header>
        <div>
          <div className="title">ERP • NUMUNE</div>
          <div className="muted">Numune Aç → Desen Bağla → Kalıp Seç → Boyahane Snapshot</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span className="pill ok">REV-1</span>
          <button className="btn">Kaydet (demo)</button>
          <button className="btn dark">Onayla/Kilitle (demo)</button>
        </div>
      </header>

      <main>
        <section className="grid2">
          {/* SOL FORM */}
          <aside className="card">
            <div className="subhead">NUMUNE BİLGİSİ</div>
            <div className="divider" />

            <div className="grid2" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="field">
                <label>Numune No</label>
                <input value={numuneNo} onChange={(e) => setNumuneNo(e.target.value)} placeholder="otomatik üretilecek (later)" />
              </div>
              <div className="field">
                <label>Tarih</label>
                <input value={tarih} onChange={(e) => setTarih(e.target.value)} placeholder="gg.aa.yyyy" />
              </div>
            </div>

            <div style={{ height: 10 }} />

            <div className="field">
              <label>Model</label>
              <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Desenden seçilecek (later)" />
            </div>

            <div style={{ height: 10 }} />

            <div className="field">
              <label>Desen</label>
              <input value={desen} onChange={(e) => setDesen(e.target.value)} placeholder="Desen seç (görsel önizleme gelecek)" />
            </div>

            <div style={{ height: 10 }} />

            <div className="field">
              <label>Kalıp</label>
              <input value={kalip} onChange={(e) => setKalip(e.target.value)} placeholder="örn: 60x70-003" />
            </div>

            <div style={{ height: 10 }} />

            <div className="grid2" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="field">
                <label>Ebat</label>
                <input value={ebat} onChange={(e) => setEbat(e.target.value)} placeholder="60x70" />
              </div>
              <div className="field">
                <label>Adet</label>
                <input value={adet} onChange={(e) => setAdet(e.target.value)} placeholder="1" />
              </div>
            </div>

            <div className="divider" />

            <div className="field">
              <label>Durum</label>
              <select value={durum} onChange={(e) => setDurum(e.target.value)}>
                <option>Beklemede</option>
                <option>Boyahanede</option>
                <option>Hazır</option>
                <option>Revize</option>
              </select>
            </div>

            <div style={{ height: 10 }} />

            <div className="field">
              <label>Not</label>
              <textarea rows={3} value={not} onChange={(e) => setNot(e.target.value)} />
            </div>

            <div className="divider" />

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn dark">Kaydet</button>
              <button className="btn soft">Vazgeç</button>
            </div>
          </aside>

          {/* SAĞ LİSTE */}
          <section className="card">
            <div className="headRow">
              <div>
                <div className="subhead">NUMUNE LİSTE</div>
                <div className="muted">Son numuneler / filtreleme (later)</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input style={{ padding: 7, border: "1px solid var(--line)", borderRadius: 8 }} placeholder="Ara (Model/No)..." />
                <button className="btn">Filtre</button>
              </div>
            </div>

            <div className="divider" />

            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Tarih</th>
                  <th>Model</th>
                  <th>Ebat</th>
                  <th className="right">Adet</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                {list.map((r, i) => (
                  <tr key={i}>
                    <td className="mono">{r.no}</td>
                    <td>{r.tarih}</td>
                    <td>{r.model}</td>
                    <td>{r.ebat}</td>
                    <td className="right">{r.adet}</td>
                    <td>{r.durum}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="divider" />
            <div className="muted">Kural: Numune kaydı model panel timeline’a “olay” olarak düşer (mali detay yok).</div>
          </section>
        </section>
      </main>
    </div>
  );
}
