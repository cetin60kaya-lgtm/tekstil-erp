// C:\ERP\erp-frontend\src\pages\ModelPanel.jsx
import React, { useMemo, useState } from "react";

export default function ModelPanel() {
  const [model, setModel] = useState("KARTAL");

  const models = useMemo(() => ["KARTAL", "TIGER", "EAGLE"], []);

  const timeline = useMemo(
    () => [
      { at: "14.02.2026 14:35", mod: "Boyahane", text: "Renk reçetesi güncellendi (demo)" },
      { at: "14.02.2026 14:10", mod: "Kalıphane", text: "Kalıp bağlandı: 60x70-001 (demo)" },
      { at: "13.02.2026 18:00", mod: "Numune", text: "Numune açıldı: N-0002 (demo)" },
      { at: "13.02.2026 10:20", mod: "Desen", text: "Baskı bölümü kaydedildi (demo)" },
      { at: "12.02.2026 20:20", mod: "Turlama", text: "Tur 1: Beklemede (demo)" },
    ],
    []
  );

  const snapshot = useMemo(
    () => ({
      desen: "Var (demo)",
      boyahane: "Var (demo)",
      kalip: "60x70-001 (demo)",
      numune: "N-0002 (demo)",
      sevkiyat: "OUT: 30 (demo)",
    }),
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
        .grid2{display:grid;grid-template-columns:380px 1fr;gap:12px;align-items:start}
        @media(max-width:1200px){.grid2{grid-template-columns:1fr}}
        .btn{border:1px solid var(--line);background:#fff;padding:7px 10px;border-radius:8px;font-weight:800;cursor:pointer}
        .btn.dark{background:var(--black);border-color:var(--black);color:#fff}
        table{border-collapse:collapse;width:100%}
        th,td{border:1px solid var(--line);padding:8px;font-size:13px}
        th{background:var(--soft);font-weight:900;text-align:left}
        .mono{font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,"Liberation Mono","Courier New", monospace;}
      `}</style>

      <div className="wrap">
        <section className="card">
          <div className="headRow">
            <div>
              <div className="title">ERP • MODEL PANEL (Ortak Panel)</div>
              <div className="muted">Mali rapor/fatura görünmez • sadece olay kaydı + snapshot</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                style={{ padding: 8, border: "1px solid var(--line)", borderRadius: 8, fontWeight: 900 }}
              >
                {models.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <button className="btn">Yenile (demo)</button>
              <button className="btn dark">Arşiv (later)</button>
            </div>
          </div>
        </section>

        <section className="grid2">
          <aside className="card">
            <div className="title">Snapshot</div>
            <div className="muted">REV-2’de gerçek snapshot</div>
            <div className="divider" />
            <table>
              <tbody>
                <tr><th>Desen</th><td>{snapshot.desen}</td></tr>
                <tr><th>Boyahane</th><td>{snapshot.boyahane}</td></tr>
                <tr><th>Kalıp</th><td className="mono">{snapshot.kalip}</td></tr>
                <tr><th>Numune</th><td className="mono">{snapshot.numune}</td></tr>
                <tr><th>Sevkiyat</th><td>{snapshot.sevkiyat}</td></tr>
              </tbody>
            </table>
            <div className="divider" />
            <div className="muted">Not: Muhasebe/fatura detayları burada yok.</div>
          </aside>

          <section className="card">
            <div className="title">Timeline</div>
            <div className="muted">Kim ne yaptı → otomatik ilgili modüle gider (REV-2)</div>
            <div className="divider" />
            <table>
              <thead>
                <tr>
                  <th>Zaman</th>
                  <th>Modül</th>
                  <th>Olay</th>
                </tr>
              </thead>
              <tbody>
                {timeline.map((t, i) => (
                  <tr key={i}>
                    <td className="mono">{t.at}</td>
                    <td>{t.mod}</td>
                    <td>{t.text}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </section>
      </div>
    </div>
  );
}
