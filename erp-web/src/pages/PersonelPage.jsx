import { useEffect, useMemo, useState } from "react";

const BASE_URL = "http://localhost:3100";

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text().catch(() => "İstek başarısız"));
  return res.json();
}

export default function PersonelPage() {
  const [q, setQ] = useState("");
  const [aktif, setAktif] = useState("true");
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  const url = useMemo(() => {
    const qs = new URLSearchParams();
    if (q.trim()) qs.set("q", q.trim());
    if (aktif) qs.set("aktif", aktif);
    return `${BASE_URL}/personel?${qs.toString()}`;
  }, [q, aktif]);

  useEffect(() => {
    let alive = true;
    setErr("");
    getJson(url)
      .then((d) => alive && setRows(Array.isArray(d) ? d : [d]))
      .catch((e) => alive && setErr(e.message || String(e)));
    return () => { alive = false; };
  }, [url]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h2 style={{ margin: 0 }}>Personel</h2>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ad / Sicil / Departman ara"
          style={{
            width: 320,
            maxWidth: "100%",
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.2)",
          }}
        />

        <select
          value={aktif}
          onChange={(e) => setAktif(e.target.value)}
          style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.2)" }}
        >
          <option value="true">Aktif</option>
          <option value="false">Pasif</option>
          <option value="">Tümü</option>
        </select>
      </div>

      {err ? (
        <div style={{ padding: 12, border: "1px solid rgba(255,0,0,0.3)", borderRadius: 12 }}>
          <b>Hata:</b> {err}
          <div style={{ marginTop: 6, opacity: 0.75, fontSize: 12 }}>
            Not: Personel/Puantaj tabloları için prisma db push + prisma generate gerekir.
          </div>
        </div>
      ) : (
        <div style={{ border: "1px solid rgba(0,0,0,0.1)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: 10, background: "rgba(0,0,0,0.03)", fontWeight: 700 }}>
            {rows.length} personel
          </div>
          <div style={{ padding: 10, overflowX: "auto" }}>
            <pre style={{ margin: 0, fontSize: 12 }}>{JSON.stringify(rows, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
