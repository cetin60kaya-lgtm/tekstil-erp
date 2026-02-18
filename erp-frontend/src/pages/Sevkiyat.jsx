// C:\ERP\erp-frontend\src\pages\Sevkiyat.jsx
import React, { useMemo, useState } from "react";

export default function Sevkiyat() {
  const [tab, setTab] = useState("IN");
  const [model, setModel] = useState("");
  const [adet, setAdet] = useState("");
  const [depo, setDepo] = useState("Depo-1");
  const [floorColor, setFloorColor] = useState("Kırmızı"); // IN zorunlu (kural)
  const [aciklama, setAciklama] = useState("");

  const logs = useMemo(
    () => [
      { at: "12.02.2026 20:10", tip: "IN", model: "KARTAL", adet: "50", depo: "Depo-1", floor: "Kırmızı", kim: "Depo" },
      { at: "13.02.2026 09:05", tip: "OUT", model: "KARTAL", adet: "30", depo: "Depo-1", floor: "—", kim: "Depo" },
    ],
    []
  );

  const floorRequired = tab === "IN";

  return (
    <div>
      <style>{`
        :root{--bg:#f5f5f5;--card:#fff;--line:#d1d5db;--muted:#6b7280;--soft:#fafafa;--black:#111;--ok:#16a34a;--warn:#f59e0b;--bad:#dc2626;}
        *{box-sizing:border-box;font-family:Arial,sans-serif}
        .wrap{max-width:1780px;margin:0 auto;padding:14px;display:grid;gap:12px;background:var(--bg);color:#111}
        .card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:12px}
        .headRow{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px}
        .title{font-weight:900}
        .subhead{font-weight:900}
        .muted{font-size:12px;color:var(--muted)}
        .divider{height:1px;background:var(--line);margin:10px 0}
        .tabs{display:flex;gap:8px;flex-wrap:wrap}
        .tab{border:1px solid var(--line);background:#fff;padding:7px 10px;border-radius:10px;font-weight:900;cursor:pointer}
        .tab.active{background:#111;color:#fff;border-color:#111}
        .btn{border:1px solid var(--line);background:#fff;padding:7px 10px;border-radius:8px;font-weight:800;cursor:pointer}
        .btn.dark{background:var(--black);border-color:var(--black);color:#fff}
        .btn.soft{background:var(--soft)}
        .pill{font-size:11px;font-weight:900;padding:3px 8px;border-radius:999px;border:1px solid var(--line);background:#fff;display:inline-block}
        .pill.ok{background:#ecfdf5;border-color:#a7f3d0}
        .pill.warn{background:#fff7ed;border-color:#fed7aa}
        .grid2{display:grid;grid-template-columns:520px 1fr;gap:12px;align-items:start}
        @media(max-width:1200px){.grid2{grid-template-columns:1fr}}
        .field{display:grid;gap:4px}
        .field label{font-size:12px;color:var(--muted);font-weight:900}
        .field input,.field select,.field textarea{padding:7px;border:1px solid var(--line);border-radius:8px;background:#fff;width:100%}
        table{border-collapse:collapse;width:100%}
        th,td{border:1px solid var(--line);padding:8px;font-size:13px;vertical-align:middle}
        th{background:var(--soft);font-weight:900;text-align:left;white-space:nowrap}
        .right{text-align:right}
        .mono{font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,"Liberation Mono","Courier New", monospace;}
      `}</style>

      <div className="wrap">
        {/* HEADER */}
        <section className="card">
          <div className="headRow">
            <div>
              <div className="title">ERP • SEVKİYAT (Tek Ekran)</div>
              <div className="muted">IN: floorColor zorunlu • OUT: floorColor opsiyonel • Takip kaydı / bildirim (later)</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span className="pill ok">REV-1</span>
              <button className="btn">Yenile (demo)</button>
              <button className="btn dark">Onayla/Kilitle</button>
            </div>
          </div>

          <div className="divider"></div>

          <div className="tabs">
            <button className={`tab ${tab === "IN" ? "active" : ""}`} onClick={() => setTab("IN")}>IN (Giriş)</button>
            <button className={`tab ${tab === "OUT" ? "active" : ""}`} onClick={() => setTab("OUT")}>OUT (Çıkış)</button>
          </div>
        </section>

        <section className="grid2">
          {/* SOL: KAYIT */}
          <aside className="card">
            <div className="subhead">{tab} Kayıt</div>
            <div className="divider"></div>

            <div className="field">
              <label>Model</label>
              <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="örn: KARTAL" />
            </div>

            <div style={{ height: 10 }} />

            <div className="grid2" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="field">
                <label>Adet</label>
                <input value={adet} onChange={(e) => setAdet(e.target.value)} placeholder="0" />
              </div>
              <div className="field">
                <label>Depo</label>
                <select value={depo} onChange={(e) => setDepo(e.target.value)}>
                  <option>Depo-1</option>
                  <option>Depo-2</option>
                </select>
              </div>
            </div>

            <div style={{ height: 10 }} />

            <div className="field">
              <label>
                Floor Color {floorRequired ? <span className="pill warn">Zorunlu</span> : <span className="pill">Opsiyonel</span>}
              </label>
              <select
                value={floorColor}
                onChange={(e) => setFloorColor(e.target.value)}
                disabled={!floorRequired && !floorColor}
                style={{ opacity: floorRequired ? 1 : 0.95 }}
              >
                <option>Kırmızı</option>
                <option>Mavi</option>
                <option>Siyah</option>
                <option>Beyaz</option>
              </select>
              {!floorRequired && <div className="muted">OUT’ta floorColor boş bırakılabilir.</div>}
            </div>

            <div style={{ height: 10 }} />

            <div className="field">
              <label>Açıklama</label>
              <textarea rows={3} value={aciklama} onChange={(e) => setAciklama(e.target.value)} placeholder="Not..." />
            </div>

            <div className="divider"></div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn dark">Kaydet</button>
              <button className="btn soft">Vazgeç</button>
            </div>
          </aside>

          {/* SAĞ: TAKİP / LOG */}
          <section className="card">
            <div className="headRow">
              <div>
                <div className="subhead">Takip / Son Kayıtlar</div>
                <div className="muted">GET /takip/latest mantığı (later)</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input style={{ padding: 7, border: "1px solid var(--line)", borderRadius: 8 }} placeholder="Model filtre..." />
                <button className="btn">Filtre</button>
              </div>
            </div>

            <div className="divider"></div>

            <table>
              <thead>
                <tr>
                  <th>Zaman</th>
                  <th>Tip</th>
                  <th>Model</th>
                  <th className="right">Adet</th>
                  <th>Depo</th>
                  <th>Floor</th>
                  <th>Kim</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l, i) => (
                  <tr key={i}>
                    <td className="mono">{l.at}</td>
                    <td>{l.tip}</td>
                    <td>{l.model}</td>
                    <td className="right">{l.adet}</td>
                    <td>{l.depo}</td>
                    <td>{l.floor}</td>
                    <td>{l.kim}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="divider"></div>
            <div className="muted">
              Not: IN kayıtlarında floorColor zorunlu. Bildirimler soft-fail (later).
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}
