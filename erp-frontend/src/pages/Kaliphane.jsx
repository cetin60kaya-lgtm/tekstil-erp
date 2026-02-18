// C:\ERP\erp-frontend\src\pages\KalipKartPage.jsx
import React, { useMemo, useState } from "react";

/**
 * REV-2 bazlı (prototip):
 * - Kalıp no formatı: EBAT-XXX (örn: 60x70-001) otomatik; manuel değişmez
 * - Ekran: Desenden Gelen Modeller + Görsel Hafıza (Desen/Kanal toggle)
 * - Kanal listesi her zaman açık: No, Renk, Pantone (desenden), Boya Türü + Efekt (kalıphaneden tek seçim)
 * - İşlem geçmişi + büyük kalıp no referansı
 */
export default function KalipKartPage() {
  const [modelSearch, setModelSearch] = useState("");
  const [selectedModel, setSelectedModel] = useState("KARTAL");
  const [toggle, setToggle] = useState("Desen");
  const [ebat, setEbat] = useState("60x70");
  const [seq, setSeq] = useState(1);

  const kalipNo = useMemo(() => {
    const s = String(seq).padStart(3, "0");
    return `${ebat}-${s}`;
  }, [ebat, seq]);

  const gelenModeller = useMemo(
    () => ["KARTAL", "TIGER", "EAGLE", "PUMA", "LION"],
    []
  );

  const kanalList = useMemo(
    () => [
      { no: 1, renk: "Kırmızı", pantone: "18-1663", boyaTuru: "Pigment", efekt: "Sim" },
      { no: 2, renk: "Beyaz", pantone: "11-0601", boyaTuru: "Pigment", efekt: "Yok" },
      { no: 3, renk: "Siyah", pantone: "19-4006", boyaTuru: "Pigment", efekt: "Kabaran" },
    ],
    []
  );

  const [kanalState, setKanalState] = useState(() => kanalList);

  const history = useMemo(
    () => [
      { at: "12.02.2026 19:05", by: "Kalıpçı", text: "Kalıp bağlandı (T1 A+B)" },
      { at: "12.02.2026 19:15", by: "Desenci", text: "Kanal 2 pantone güncellendi" },
    ],
    []
  );

  function setKanal(idx, key, val) {
    setKanalState((p) => {
      const next = [...p];
      next[idx] = { ...next[idx], [key]: val };
      return next;
    });
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
        .grid3{display:grid;grid-template-columns:360px 520px 1fr;gap:12px;align-items:start}
        @media(max-width:1400px){.grid3{grid-template-columns:1fr}}
        .field{display:grid;gap:4px}
        .field label{font-size:12px;color:var(--muted);font-weight:900}
        .field input,.field select{padding:7px;border:1px solid var(--line);border-radius:8px;background:#fff;width:100%}
        table{border-collapse:collapse;width:100%}
        th,td{border:1px solid var(--line);padding:8px;font-size:13px;vertical-align:middle}
        th{background:var(--soft);font-weight:900;text-align:left;white-space:nowrap}
        .bigRef{font-size:34px;font-weight:900;letter-spacing:1px}
        .mono{font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,"Liberation Mono","Courier New", monospace;}
        .imgbox{height:220px;border:1px dashed #aaa;border-radius:10px;background:#fff;display:flex;align-items:center;justify-content:center;color:#777}
      `}</style>

      <div className="wrap">
        <section className="card">
          <div className="headRow">
            <div>
              <div className="title">ERP • KALIPHANE (Tek Ekran)</div>
              <div className="muted">Kalıp arama odaklı • Kalıp no otomatik • Kanal listesi hep açık</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn">Kaydet (demo)</button>
              <button className="btn dark">Onayla/Kilitle</button>
            </div>
          </div>
        </section>

        <section className="grid3">
          {/* 1) Desenden Gelen Modeller */}
          <aside className="card">
            <div className="subhead">Desenden Gelen Modeller</div>
            <div className="muted">Liste – arama odaklı</div>
            <div className="divider" />

            <div className="field">
              <label>Model Ara</label>
              <input value={modelSearch} onChange={(e) => setModelSearch(e.target.value)} placeholder="KARTAL..." />
            </div>

            <div className="divider" />

            <div style={{ display: "grid", gap: 8 }}>
              {gelenModeller
                .filter((m) => m.toLowerCase().includes(modelSearch.toLowerCase()))
                .map((m) => (
                  <button
                    key={m}
                    className="btn"
                    style={{
                      textAlign: "left",
                      background: m === selectedModel ? "#111" : "#fff",
                      color: m === selectedModel ? "#fff" : "#111",
                      borderColor: m === selectedModel ? "#111" : "var(--line)",
                    }}
                    onClick={() => setSelectedModel(m)}
                  >
                    {m}
                  </button>
                ))}
            </div>

            <div className="divider" />
            <div className="muted">Not: Model panel ile ortak çalışır (REV-2)</div>
          </aside>

          {/* 2) Görsel Hafıza */}
          <section className="card">
            <div className="headRow">
              <div>
                <div className="subhead">Görsel Hafıza</div>
                <div className="muted">Desen / Kanal toggle</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className={`btn ${toggle === "Desen" ? "dark" : ""}`} onClick={() => setToggle("Desen")}>Desen</button>
                <button className={`btn ${toggle === "Kanal" ? "dark" : ""}`} onClick={() => setToggle("Kanal")}>Kanal</button>
              </div>
            </div>

            <div className="divider" />
            <div className="imgbox">{toggle === "Desen" ? "Desen Görseli" : "PSD Kanal Görseli"}</div>

            <div className="divider" />
            <div className="subhead">Kalıp No (Otomatik)</div>
            <div className="muted">Format: EBAT-XXX</div>

            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginTop: 10 }}>
              <div className="field" style={{ width: 140 }}>
                <label>Ebat</label>
                <input value={ebat} onChange={(e) => setEbat(e.target.value)} />
              </div>
              <div className="field" style={{ width: 120 }}>
                <label>Sıra</label>
                <input value={seq} onChange={(e) => setSeq(parseInt(e.target.value || "1", 10) || 1)} />
              </div>
              <div>
                <div className="muted">Referans</div>
                <div className="bigRef mono">{kalipNo}</div>
                <div className="muted">Manuel değiştirilemez (REV-2)</div>
              </div>
            </div>
          </section>

          {/* 3) Kanal Listesi + Geçmiş */}
          <section className="card">
            <div className="subhead">Kanal Listesi (Her Zaman Açık)</div>
            <div className="muted">Pantone desenden gelir • Boya Türü/Efekt kalıphaneden tek seçim</div>
            <div className="divider" />

            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Renk</th>
                  <th>Pantone</th>
                  <th>Boya Türü</th>
                  <th>Efekt</th>
                </tr>
              </thead>
              <tbody>
                {kanalState.map((k, i) => (
                  <tr key={k.no}>
                    <td className="mono">{k.no}</td>
                    <td>{k.renk}</td>
                    <td className="mono">{k.pantone}</td>
                    <td>
                      <select value={k.boyaTuru} onChange={(e) => setKanal(i, "boyaTuru", e.target.value)}>
                        <option>Pigment</option>
                        <option>Dispers</option>
                        <option>Reaktif</option>
                      </select>
                    </td>
                    <td>
                      <select value={k.efekt} onChange={(e) => setKanal(i, "efekt", e.target.value)}>
                        <option>Yok</option>
                        <option>Sim</option>
                        <option>Kabaran</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="divider" />
            <div className="subhead">İşlem Geçmişi</div>
            <div className="muted">Silinmez (audit mantığı)</div>

            <table style={{ marginTop: 8 }}>
              <thead>
                <tr>
                  <th>Zaman</th>
                  <th>Kim</th>
                  <th>Olay</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i}>
                    <td className="mono">{h.at}</td>
                    <td>{h.by}</td>
                    <td>{h.text}</td>
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
