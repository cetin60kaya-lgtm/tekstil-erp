// C:\ERP\erp-frontend\src\pages\AdminRoot.jsx
import React, { useMemo, useState } from "react";

/**
 * REV-1:
 * - /admin (firma admin) + /root (tam admin)
 * - 2FA zorunlu (REV-1 demo)
 * - Modül/alan/liste/workflow yönetimi
 * - Arşiv kaynakları Local/OneDrive/GDrive (later)
 * - PDF şablon font/punto ayarı (later)
 */
export default function AdminRoot() {
  const [mode, setMode] = useState("admin"); // admin | root
  const [twofa, setTwofa] = useState("");
  const [twofaOk, setTwofaOk] = useState(false);

  const [company, setCompany] = useState("HKNS TEKSTİL");
  const [archive, setArchive] = useState("Local");
  const [pdfFont, setPdfFont] = useState("Arial");
  const [pdfSize, setPdfSize] = useState("11");

  const modules = useMemo(
    () => [
      { key: "Dashboard", on: true },
      { key: "Model Panel", on: true },
      { key: "Muhasebe", on: true },
      { key: "Turlama", on: true },
      { key: "İK/Yövmiye", on: true },
      { key: "Desen", on: true },
      { key: "Boyahane", on: true },
      { key: "Kalıphane", on: true },
      { key: "Numune", on: true },
      { key: "Sevkiyat", on: true },
    ],
    []
  );

  const [modState, setModState] = useState(() => modules);

  function toggleModule(i) {
    setModState((p) => {
      const next = [...p];
      next[i] = { ...next[i], on: !next[i].on };
      return next;
    });
  }

  function verify2FA() {
    // REV-1 demo: 6 hane girince ok
    if ((twofa || "").trim().length === 6) setTwofaOk(true);
    else alert("2FA kod 6 hane olmalı (REV-1 demo).");
  }

  return (
    <div>
      <style>{`
        :root{--bg:#f5f5f5;--card:#fff;--line:#d1d5db;--muted:#6b7280;--soft:#fafafa;--black:#111;}
        *{box-sizing:border-box;font-family:Arial,sans-serif}
        .wrap{max-width:1780px;margin:0 auto;padding:14px;display:grid;gap:12px;background:var(--bg);color:#111}
        .card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:12px}
        .headRow{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
        .title{font-weight:900}
        .subhead{font-weight:900}
        .muted{font-size:12px;color:var(--muted)}
        .divider{height:1px;background:var(--line);margin:10px 0}
        .btn{border:1px solid var(--line);background:#fff;padding:7px 10px;border-radius:8px;font-weight:800;cursor:pointer}
        .btn.dark{background:var(--black);border-color:var(--black);color:#fff}
        .btn.soft{background:var(--soft)}
        .grid2{display:grid;grid-template-columns:520px 1fr;gap:12px;align-items:start}
        @media(max-width:1200px){.grid2{grid-template-columns:1fr}}
        .field{display:grid;gap:4px}
        .field label{font-size:12px;color:var(--muted);font-weight:900}
        .field input,.field select{padding:7px;border:1px solid var(--line);border-radius:8px;background:#fff;width:100%}
        table{border-collapse:collapse;width:100%}
        th,td{border:1px solid var(--line);padding:8px;font-size:13px}
        th{background:var(--soft);font-weight:900;text-align:left}
        .pill{font-size:11px;font-weight:900;padding:3px 8px;border-radius:999px;border:1px solid var(--line);background:#fff;display:inline-block}
        .mono{font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,"Liberation Mono","Courier New", monospace;}
      `}</style>

      <div className="wrap">
        <section className="card">
          <div className="headRow">
            <div>
              <div className="title">ERP • {mode === "admin" ? "ADMIN" : "ROOT"} PANEL</div>
              <div className="muted">2FA zorunlu • Modül/alan/workflow yönetimi • Arşiv kaynakları</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span className="pill mono">/{mode}</span>
              <button className={`btn ${mode === "admin" ? "dark" : ""}`} onClick={() => { setMode("admin"); setTwofaOk(false); }}>Admin</button>
              <button className={`btn ${mode === "root" ? "dark" : ""}`} onClick={() => { setMode("root"); setTwofaOk(false); }}>Root</button>
              <button className="btn soft" onClick={() => alert("REV-1 demo kaydet")}>Kaydet</button>
            </div>
          </div>
        </section>

        {!twofaOk ? (
          <section className="card">
            <div className="subhead">2FA Doğrulama</div>
            <div className="muted">REV-1 demo: 6 haneli kod girince açılır</div>
            <div className="divider" />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <input
                style={{ padding: 10, border: "1px solid var(--line)", borderRadius: 10, width: 220, fontWeight: 900 }}
                placeholder="2FA Kodu (6 hane)"
                value={twofa}
                onChange={(e) => setTwofa(e.target.value)}
              />
              <button className="btn dark" onClick={verify2FA}>Doğrula</button>
            </div>
          </section>
        ) : (
          <section className="grid2">
            {/* SOL: Firma / Arşiv / PDF */}
            <aside className="card">
              <div className="subhead">Genel Ayarlar</div>
              <div className="divider" />

              <div className="field">
                <label>Firma Adı</label>
                <input value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>

              <div style={{ height: 10 }} />

              <div className="field">
                <label>Arşiv Kaynağı</label>
                <select value={archive} onChange={(e) => setArchive(e.target.value)}>
                  <option>Local</option>
                  <option>OneDrive (later)</option>
                  <option>Google Drive (later)</option>
                </select>
              </div>

              <div className="divider" />

              <div className="subhead">PDF Şablon Ayarları</div>
              <div className="muted">Font / punto / firma başlığı (REV-2 PDF)</div>

              <div style={{ height: 10 }} />

              <div className="grid2" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div className="field">
                  <label>Font</label>
                  <select value={pdfFont} onChange={(e) => setPdfFont(e.target.value)}>
                    <option>Arial</option>
                    <option>Calibri</option>
                    <option>Times</option>
                  </select>
                </div>
                <div className="field">
                  <label>Punto</label>
                  <input value={pdfSize} onChange={(e) => setPdfSize(e.target.value)} />
                </div>
              </div>

              <div className="divider" />
              <div className="muted">
                Not: Bu panelde iş kuralları değiştirilebilir; audit log zorunlu (REV-2).
              </div>
            </aside>

            {/* SAĞ: Modüller + Workflow */}
            <section className="card">
              <div className="subhead">Modül Yönetimi</div>
              <div className="muted">Aktif/Pasif • Firma admin yalnız kendi firmasını görür</div>

              <div className="divider" />

              <table>
                <thead>
                  <tr>
                    <th>Modül</th>
                    <th>Durum</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {modState.map((m, i) => (
                    <tr key={m.key}>
                      <td>{m.key}</td>
                      <td><b>{m.on ? "Aktif" : "Pasif"}</b></td>
                      <td style={{ width: 140 }}>
                        <button className="btn" onClick={() => toggleModule(i)}>{m.on ? "Pasif Yap" : "Aktif Yap"}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="divider" />

              <div className="subhead">Workflow / Alan Yönetimi (REV-2)</div>
              <div className="muted">
                Alan/form düzeni, sözlükler, kalite kontrol maddeleri, iş emri PDF şablonları burada yönetilecek.
              </div>
            </section>
          </section>
        )}
      </div>
    </div>
  );
}
