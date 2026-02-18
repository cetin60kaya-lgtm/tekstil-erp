// C:\ERP\erp-frontend\src\pages\Dashboard.jsx
import React, { useMemo, useState } from "react";

export default function Dashboard() {
  const [donem, setDonem] = useState("2026-02");

  const cards = useMemo(
    () => [
      { title: "Açık İş Emirleri", value: "—", hint: "Numune + İmalat (REV-2)" },
      { title: "Bugün Sevkiyat", value: "—", hint: "IN/OUT toplam (REV-2)" },
      { title: "Boyahane Aktif Renk", value: "—", hint: "Son aktif deneme (REV-2)" },
      { title: "KDV Özet", value: "—", hint: "Çıkan / İndirilecek / Devreden" },
    ],
    []
  );

  const timeline = useMemo(
    () => [
      { at: "14.02.2026 14:40", who: "Muhasebe", what: "Satış fatura taslağı oluşturuldu (demo)" },
      { at: "14.02.2026 14:35", who: "Boyahane", what: "Renk reçetesi güncellendi (demo)" },
      { at: "14.02.2026 14:20", who: "Sevkiyat", what: "OUT kaydı girildi (demo)" },
    ],
    []
  );

  return (
    <div>
      <style>{`
        :root{--bg:#f5f5f5;--card:#fff;--line:#d1d5db;--muted:#6b7280;--soft:#fafafa;--black:#111;}
        *{box-sizing:border-box;font-family:Arial,sans-serif}
        .wrap{max-width:1780px;margin:0 auto;padding:14px;display:grid;gap:12px;background:var(--bg);color:#111}
        .card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:12px}
        .headRow{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
        .title{font-weight:900}
        .muted{font-size:12px;color:var(--muted)}
        .divider{height:1px;background:var(--line);margin:10px 0}
        .btn{border:1px solid var(--line);background:#fff;padding:7px 10px;border-radius:8px;font-weight:800;cursor:pointer}
        .btn.dark{background:var(--black);border-color:var(--black);color:#fff}
        .grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
        @media(max-width:1200px){.grid4{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:700px){.grid4{grid-template-columns:1fr}}
        .kpi{font-size:26px;font-weight:900;margin-top:6px}
        table{border-collapse:collapse;width:100%}
        th,td{border:1px solid var(--line);padding:8px;font-size:13px}
        th{background:var(--soft);font-weight:900;text-align:left}
        .mono{font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,"Liberation Mono","Courier New", monospace;}
      `}</style>

      <div className="wrap">
        <section className="card">
          <div className="headRow">
            <div>
              <div className="title">ERP • DASHBOARD (Yönetici Özet)</div>
              <div className="muted">REV-1 prototip • Gerçek veriler REV-2</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <select
                value={donem}
                onChange={(e) => setDonem(e.target.value)}
                style={{ padding: 8, border: "1px solid var(--line)", borderRadius: 8, fontWeight: 900 }}
              >
                <option value="2026-01">2026-01</option>
                <option value="2026-02">2026-02</option>
                <option value="2026-03">2026-03</option>
              </select>
              <button className="btn">Yenile (demo)</button>
              <button className="btn dark">Rapor (later)</button>
            </div>
          </div>
        </section>

        <section className="grid4">
          {cards.map((c, i) => (
            <div className="card" key={i}>
              <div className="muted">{c.title}</div>
              <div className="kpi">{c.value}</div>
              <div className="muted">{c.hint}</div>
            </div>
          ))}
        </section>

        <section className="card">
          <div className="title">Timeline (Ortak Panel Mantığı)</div>
          <div className="muted">Mali detay göstermez • sadece olay kaydı</div>
          <div className="divider" />
          <table>
            <thead>
              <tr>
                <th>Zaman</th>
                <th>Kim</th>
                <th>Olay</th>
              </tr>
            </thead>
            <tbody>
              {timeline.map((t, i) => (
                <tr key={i}>
                  <td className="mono">{t.at}</td>
                  <td>{t.who}</td>
                  <td>{t.what}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
