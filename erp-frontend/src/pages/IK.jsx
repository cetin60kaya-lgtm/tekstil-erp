// C:\ERP\erp-frontend\src\pages\IK.jsx
import React, { useMemo, useState } from "react";

export default function IK() {
  const [tab, setTab] = useState("Personel");
  const [ay, setAy] = useState("2026-02");

  const maasli = useMemo(
    () => [
      { ad: "Ali Yılmaz", rol: "Operatör", izin: 5, durum: "Aktif" },
      { ad: "Mehmet Demir", rol: "Boyacı", izin: 5, durum: "Aktif" },
    ],
    []
  );

  const yovmiye = useMemo(
    () => [
      { ad: "Ahmet Kaya", vasif: "Usta", vardiya: "Gündüz", ucret: "₺ —", hafta: "—" },
      { ad: "Can Eren", vasif: "Çırak", vardiya: "Gece", ucret: "₺ —", hafta: "—" },
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
        .tabs{display:flex;gap:8px;flex-wrap:wrap}
        .tab{border:1px solid var(--line);background:#fff;padding:7px 10px;border-radius:10px;font-weight:900;cursor:pointer}
        .tab.active{background:#111;color:#fff;border-color:#111}
        .btn{border:1px solid var(--line);background:#fff;padding:7px 10px;border-radius:8px;font-weight:800;cursor:pointer}
        .btn.dark{background:var(--black);border-color:var(--black);color:#fff}
        table{border-collapse:collapse;width:100%}
        th,td{border:1px solid var(--line);padding:8px;font-size:13px}
        th{background:var(--soft);font-weight:900;text-align:left}
      `}</style>

      <div className="wrap">
        <section className="card">
          <div className="headRow">
            <div>
              <div className="title">ERP • İK / YÖVMİYE</div>
              <div className="muted">Maaşlı personel + yıllık izin • Yövmiye ayrı sayfa/şifreli (REV-2)</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <select
                value={ay}
                onChange={(e) => setAy(e.target.value)}
                style={{ padding: 8, border: "1px solid var(--line)", borderRadius: 8, fontWeight: 900 }}
              >
                <option value="2026-01">2026-01</option>
                <option value="2026-02">2026-02</option>
                <option value="2026-03">2026-03</option>
              </select>
              <button className="btn">Kaydet (demo)</button>
              <button className="btn dark">Haftalık Özet Fişi (later)</button>
            </div>
          </div>

          <div className="divider" />

          <div className="tabs">
            <button className={`tab ${tab === "Personel" ? "active" : ""}`} onClick={() => setTab("Personel")}>Personel</button>
            <button className={`tab ${tab === "İzin" ? "active" : ""}`} onClick={() => setTab("İzin")}>Yıllık İzin</button>
            <button className={`tab ${tab === "Yövmiye" ? "active" : ""}`} onClick={() => setTab("Yövmiye")}>Yövmiye</button>
          </div>
        </section>

        <section className="card">
          {tab === "Personel" && (
            <>
              <div className="title">Maaşlı Personel</div>
              <div className="muted">Cumartesi çalışılan firmada cumartesi dahil • resmi tatiller izinden düşmez</div>
              <div className="divider" />
              <table>
                <thead>
                  <tr>
                    <th>Ad Soyad</th>
                    <th>Rol</th>
                    <th>Yıllık İzin (gün)</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {maasli.map((p, i) => (
                    <tr key={i}>
                      <td>{p.ad}</td>
                      <td>{p.rol}</td>
                      <td>{p.izin}</td>
                      <td>{p.durum}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {tab === "İzin" && (
            <>
              <div className="title">İzin Yönetimi (REV-1)</div>
              <div className="muted">İzin kaydı → timeline olay kaydı (mali detay yok)</div>
              <div className="divider" />
              <div className="muted">REV-2: Takvim + resmi tatil otomatik düşmeme kuralı</div>
            </>
          )}

          {tab === "Yövmiye" && (
            <>
              <div className="title">Yövmiye (Şifreli Sayfa – REV-2)</div>
              <div className="muted">Gündüz/Gece vardiya • Haftalık özet fişi ayrı</div>
              <div className="divider" />
              <table>
                <thead>
                  <tr>
                    <th>Ad Soyad</th>
                    <th>Vasıf</th>
                    <th>Vardiya</th>
                    <th>Ücret</th>
                    <th>Hafta Özeti</th>
                  </tr>
                </thead>
                <tbody>
                  {yovmiye.map((p, i) => (
                    <tr key={i}>
                      <td>{p.ad}</td>
                      <td>{p.vasif}</td>
                      <td>{p.vardiya}</td>
                      <td>{p.ucret}</td>
                      <td>{p.hafta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
