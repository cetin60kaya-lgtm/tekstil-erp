// C:\ERP\erp-frontend\src\pages\Muhasebe.jsx
import React, { useMemo, useState } from "react";

export default function Muhasebe() {
  // muhasebe.html tabs: cari, alis, satis, tahsilat, odeme, kdv
  const [tab, setTab] = useState("cari");

  const meta = useMemo(() => {
    const map = {
      cari: {
        tabLabel: "Cari",
        formTitle: "Cari Kart",
        formHint: "Müşteri / Tedarikçi ekle-düzenle",
        listTitle: "Cari Liste",
        listHint: "Arama + son işlemler",
      },
      alis: {
        tabLabel: "Alış Fatura",
        formTitle: "Alış Fatura",
        formHint: "Tedarikçi fatura girişi",
        listTitle: "Fatura Liste",
        listHint: "Alış/Satış faturaları",
      },
      satis: {
        tabLabel: "Satış Fatura",
        formTitle: "Satış Fatura",
        formHint: "Müşteri fatura girişi",
        listTitle: "Fatura Liste",
        listHint: "Alış/Satış faturaları",
      },
      tahsilat: {
        tabLabel: "Tahsilat",
        formTitle: "Tahsilat",
        formHint: "Müşteriden gelen ödeme",
        listTitle: "Kasa Hareketleri",
        listHint: "Tahsilat/Ödeme kayıtları",
      },
      odeme: {
        tabLabel: "Ödeme",
        formTitle: "Ödeme",
        formHint: "Tedarikçiye yapılan ödeme",
        listTitle: "Kasa Hareketleri",
        listHint: "Tahsilat/Ödeme kayıtları",
      },
      kdv: {
        tabLabel: "KDV",
        formTitle: "KDV",
        formHint: "Aylık KDV özeti / devreden dahil",
        listTitle: "KDV Dönemleri",
        listHint: "Dönem bazlı özet",
      },
    };
    return map;
  }, []);

  const listMode = useMemo(() => {
    if (tab === "cari") return "cari";
    if (tab === "alis" || tab === "satis") return "fatura";
    if (tab === "tahsilat" || tab === "odeme") return "kasa";
    return "kdv";
  }, [tab]);

  // Demo list verileri (HTML'deki örnekler)
  const cariler = useMemo(
    () => [
      { tip: "Müşteri", unvan: "HKNS TEKSTİL", bakiye: "₺ 0,00", durum: "Aktif" },
      { tip: "Tedarikçi", unvan: "BOYA TEDARİK", bakiye: "₺ 12.500,00", durum: "Aktif" },
    ],
    []
  );

  const faturalar = useMemo(
    () => [{ no: "FAT-001", cari: "HKNS TEKSTİL", tarih: "12.02.2026", toplam: "₺ 5.000,00", kdv: "₺ 900,00" }],
    []
  );

  const kasa = useMemo(
    () => [{ tarih: "12.02.2026", cari: "HKNS TEKSTİL", tip: "Tahsilat", tutar: "₺ 2.000,00" }],
    []
  );

  const kdvList = useMemo(
    () => [{ donem: "2026-02", cikan: "₺ 0,00", indirilecek: "₺ 0,00", devreden: "₺ 0,00", odenecek: "₺ 0,00" }],
    []
  );

  const formTitle = meta[tab].formTitle;
  const formHint = meta[tab].formHint;
  const listTitle = meta[tab].listTitle;
  const listHint = meta[tab].listHint;

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
        .grid2{display:grid;grid-template-columns:520px 1fr;gap:12px;align-items:start}
        @media(max-width:1200px){.grid2{grid-template-columns:1fr}}
        .field{display:grid;gap:4px}
        .field label{font-size:12px;color:var(--muted);font-weight:900}
        .field input,.field select,.field textarea{padding:7px;border:1px solid var(--line);border-radius:8px;background:#fff;width:100%}
        table{border-collapse:collapse;width:100%}
        th,td{border:1px solid var(--line);padding:8px;font-size:13px;vertical-align:middle}
        th{background:var(--soft);font-weight:900;text-align:left;white-space:nowrap}
        .right{text-align:right}
      `}</style>

      <div className="wrap">
        {/* HEADER (muhasebe.html gibi) */}
        <section className="card">
          <div className="headRow">
            <div>
              <div className="title">ERP • Muhasebe (Ön Muhasebe) • REV-1</div>
              <div className="muted">Bu ekranlar admin panelden aktif/pasif yapılacak (kural kilit)</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span className="pill ok">REV-1</span>
              <button className="btn">Yenile (demo)</button>
              <button className="btn dark">Onayla/Kilitle (demo)</button>
            </div>
          </div>

          <div className="divider"></div>

          <div className="tabs">
            <button className={`tab ${tab === "cari" ? "active" : ""}`} onClick={() => setTab("cari")}>Cari</button>
            <button className={`tab ${tab === "alis" ? "active" : ""}`} onClick={() => setTab("alis")}>Alış Fatura</button>
            <button className={`tab ${tab === "satis" ? "active" : ""}`} onClick={() => setTab("satis")}>Satış Fatura</button>
            <button className={`tab ${tab === "tahsilat" ? "active" : ""}`} onClick={() => setTab("tahsilat")}>Tahsilat</button>
            <button className={`tab ${tab === "odeme" ? "active" : ""}`} onClick={() => setTab("odeme")}>Ödeme</button>
            <button className={`tab ${tab === "kdv" ? "active" : ""}`} onClick={() => setTab("kdv")}>KDV</button>
          </div>
        </section>

        <section className="grid2">
          {/* SOL: FORM */}
          <aside className="card">
            <div className="subhead">{formTitle}</div>
            <div className="muted">{formHint}</div>
            <div className="divider"></div>

            {/* CARİ */}
            {tab === "cari" && (
              <div>
                <div className="grid2" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  <div className="field">
                    <label>Tip</label>
                    <select>
                      <option>Müşteri</option>
                      <option>Tedarikçi</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Durum</label>
                    <select>
                      <option>Aktif</option>
                      <option>Pasif</option>
                    </select>
                  </div>
                </div>

                <div style={{ height: 10 }} />

                <div className="field">
                  <label>Unvan / Ad Soyad</label>
                  <input placeholder="örn: HKNS TEKSTİL" />
                </div>

                <div style={{ height: 10 }} />

                <div className="field">
                  <label>Vergi No / TCKN</label>
                  <input placeholder="—" />
                </div>

                <div style={{ height: 10 }} />

                <div className="field">
                  <label>Telefon</label>
                  <input placeholder="—" />
                </div>

                <div style={{ height: 10 }} />

                <div className="field">
                  <label>Adres</label>
                  <textarea rows={3} placeholder="—" />
                </div>
              </div>
            )}

            {/* ALIŞ */}
            {tab === "alis" && (
              <div>
                <div className="field">
                  <label>Tedarikçi</label>
                  <input placeholder="arama/ seç" />
                </div>

                <div style={{ height: 10 }} />

                <div className="grid2" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  <div className="field">
                    <label>Fatura No</label>
                    <input placeholder="—" />
                  </div>
                  <div className="field">
                    <label>Tarih</label>
                    <input placeholder="gg.aa.yyyy" />
                  </div>
                </div>

                <div style={{ height: 10 }} />

                <div className="grid2" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  <div className="field">
                    <label>Ara Toplam</label>
                    <input placeholder="0,00" />
                  </div>
                  <div className="field">
                    <label>KDV</label>
                    <input placeholder="0,00" />
                  </div>
                </div>

                <div style={{ height: 10 }} />

                <div className="field">
                  <label>Toplam</label>
                  <input placeholder="0,00" />
                </div>

                <div style={{ height: 10 }} />

                <div className="field">
                  <label>Belge (JPG/PDF)</label>
                  <input placeholder="dosya seç (later)" />
                </div>
              </div>
            )}

            {/* SATIŞ */}
            {tab === "satis" && (
              <div>
                <div className="field">
                  <label>Müşteri</label>
                  <input placeholder="arama/ seç" />
                </div>

                <div style={{ height: 10 }} />

                <div className="grid2" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  <div className="field">
                    <label>Fatura No</label>
                    <input placeholder="—" />
                  </div>
                  <div className="field">
                    <label>Tarih</label>
                    <input placeholder="gg.aa.yyyy" />
                  </div>
                </div>

                <div style={{ height: 10 }} />

                <div className="grid2" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  <div className="field">
                    <label>Ara Toplam</label>
                    <input placeholder="0,00" />
                  </div>
                  <div className="field">
                    <label>KDV</label>
                    <input placeholder="0,00" />
                  </div>
                </div>

                <div style={{ height: 10 }} />

                <div className="field">
                  <label>Toplam</label>
                  <input placeholder="0,00" />
                </div>
              </div>
            )}

            {/* TAHSİLAT */}
            {tab === "tahsilat" && (
              <div>
                <div className="field">
                  <label>Müşteri</label>
                  <input placeholder="arama/ seç" />
                </div>

                <div style={{ height: 10 }} />

                <div className="grid2" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  <div className="field">
                    <label>Tarih</label>
                    <input placeholder="gg.aa.yyyy" />
                  </div>
                  <div className="field">
                    <label>Tutar</label>
                    <input placeholder="0,00" />
                  </div>
                </div>

                <div style={{ height: 10 }} />

                <div className="field">
                  <label>Ödeme Tipi</label>
                  <select>
                    <option>Nakit</option>
                    <option>Havale</option>
                    <option>POS</option>
                    <option>Çek</option>
                  </select>
                </div>

                <div style={{ height: 10 }} />

                <div className="field">
                  <label>Not</label>
                  <textarea rows={3} placeholder="—" />
                </div>
              </div>
            )}

            {/* ÖDEME */}
            {tab === "odeme" && (
              <div>
                <div className="field">
                  <label>Tedarikçi</label>
                  <input placeholder="arama/ seç" />
                </div>

                <div style={{ height: 10 }} />

                <div className="grid2" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  <div className="field">
                    <label>Tarih</label>
                    <input placeholder="gg.aa.yyyy" />
                  </div>
                  <div className="field">
                    <label>Tutar</label>
                    <input placeholder="0,00" />
                  </div>
                </div>

                <div style={{ height: 10 }} />

                <div className="field">
                  <label>Ödeme Tipi</label>
                  <select>
                    <option>Nakit</option>
                    <option>Havale</option>
                    <option>POS</option>
                    <option>Çek</option>
                  </select>
                </div>

                <div style={{ height: 10 }} />

                <div className="field">
                  <label>Not</label>
                  <textarea rows={3} placeholder="—" />
                </div>
              </div>
            )}

            {/* KDV */}
            {tab === "kdv" && (
              <div>
                <div className="muted">KDV ekranı hesap ekranıdır. Ay seçilir, özet görülür.</div>

                <div style={{ height: 10 }} />

                <div className="grid2" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  <div className="field">
                    <label>Yıl</label>
                    <select>
                      <option>2026</option>
                      <option>2025</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Ay</label>
                    <select>
                      <option>01</option>
                      <option>02</option>
                      <option>03</option>
                    </select>
                  </div>
                </div>

                <div className="divider"></div>

                <div className="field">
                  <label>Devreden KDV</label>
                  <input placeholder="0,00" />
                </div>

                <div style={{ height: 10 }} />

                <div className="field">
                  <label>Çıkan KDV</label>
                  <input placeholder="0,00" />
                </div>

                <div style={{ height: 10 }} />

                <div className="field">
                  <label>İndirilecek KDV</label>
                  <input placeholder="0,00" />
                </div>

                <div style={{ height: 10 }} />

                <div className="field">
                  <label>Ödenecek / Devreden</label>
                  <input placeholder="0,00" />
                </div>

                <div style={{ height: 10 }} />

                <button className="btn dark">PDF Al (later)</button>
              </div>
            )}

            <div className="divider"></div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn dark">Kaydet</button>
              <button className="btn soft">Vazgeç</button>
            </div>
          </aside>

          {/* SAĞ: LİSTE */}
          <section className="card">
            <div className="headRow">
              <div>
                <div className="subhead">{listTitle}</div>
                <div className="muted">{listHint}</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input style={{ padding: 7, border: "1px solid var(--line)", borderRadius: 8 }} placeholder="Ara..." />
                <button className="btn">Filtre</button>
              </div>
            </div>

            <div className="divider"></div>

            {/* list_cari */}
            {listMode === "cari" && (
              <table>
                <thead>
                  <tr>
                    <th>Tip</th>
                    <th>Unvan</th>
                    <th className="right">Bakiye</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {cariler.map((c, i) => (
                    <tr key={i}>
                      <td>{c.tip}</td>
                      <td>{c.unvan}</td>
                      <td className="right">{c.bakiye}</td>
                      <td>
                        <span className="pill ok">{c.durum}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* list_fatura */}
            {listMode === "fatura" && (
              <table>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Cari</th>
                    <th>Tarih</th>
                    <th className="right">Toplam</th>
                    <th>KDV</th>
                  </tr>
                </thead>
                <tbody>
                  {faturalar.map((f, i) => (
                    <tr key={i}>
                      <td>{f.no}</td>
                      <td>{f.cari}</td>
                      <td>{f.tarih}</td>
                      <td className="right">{f.toplam}</td>
                      <td>{f.kdv}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* list_kasa */}
            {listMode === "kasa" && (
              <table>
                <thead>
                  <tr>
                    <th>Tarih</th>
                    <th>Cari</th>
                    <th>Tip</th>
                    <th className="right">Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  {kasa.map((k, i) => (
                    <tr key={i}>
                      <td>{k.tarih}</td>
                      <td>{k.cari}</td>
                      <td>{k.tip}</td>
                      <td className="right">{k.tutar}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* list_kdv */}
            {listMode === "kdv" && (
              <table>
                <thead>
                  <tr>
                    <th>Dönem</th>
                    <th className="right">Çıkan</th>
                    <th className="right">İndirilecek</th>
                    <th className="right">Devreden</th>
                    <th className="right">Ödenecek</th>
                  </tr>
                </thead>
                <tbody>
                  {kdvList.map((k, i) => (
                    <tr key={i}>
                      <td>{k.donem}</td>
                      <td className="right">{k.cikan}</td>
                      <td className="right">{k.indirilecek}</td>
                      <td className="right">{k.devreden}</td>
                      <td className="right">{k.odenecek}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="divider"></div>
            <div className="muted">
              Not: Ortak Panel’de mali rapor/fatura detayları gösterilmez. Sadece “olay kaydı” gider.
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}
