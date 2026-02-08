import { useEffect, useMemo, useState } from "react";

const BASE_URL = "http://localhost:3100";

function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: "1px solid rgba(0,0,0,0.15)",
        padding: "8px 10px",
        borderRadius: 10,
        background: active ? "rgba(0,0,0,0.08)" : "white",
        fontWeight: active ? 700 : 600,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text().catch(() => "İstek başarısız"));
  return res.json();
}

export default function MuhasebePage() {
  const [tab, setTab] = useState("fatura");
  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  const url = useMemo(() => {
    const qs = new URLSearchParams();
    if (q.trim()) qs.set("q", q.trim());

    if (tab === "musteri") return `${BASE_URL}/musteri?${qs}`;
    if (tab === "tedarikci") return `${BASE_URL}/tedarikci?${qs}`;
    if (tab === "fatura") return `${BASE_URL}/fatura?${qs}`;
    if (tab === "tahsilat") return `${BASE_URL}/tahsilat?${qs}`;
    if (tab === "odeme") return `${BASE_URL}/odeme?${qs}`;
    if (tab === "kdv") return `${BASE_URL}/kdv-rapor?${qs}`;
    return `${BASE_URL}/fatura?${qs}`;
  }, [tab, q]);

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
      <h2 style={{ margin: 0 }}>Muhasebe</h2>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <TabButton active={tab === "fatura"} onClick={() => setTab("fatura")}>Faturalar</TabButton>
        <TabButton active={tab === "musteri"} onClick={() => setTab("musteri")}>Müşteri</TabButton>
        <TabButton active={tab === "tedarikci"} onClick={() => setTab("tedarikci")}>Tedarikçi</TabButton>
        <TabButton active={tab === "tahsilat"} onClick={() => setTab("tahsilat")}>Tahsilat</TabButton>
        <TabButton active={tab === "odeme"} onClick={() => setTab("odeme")}>Ödeme</TabButton>
        <TabButton active={tab === "kdv"} onClick={() => setTab("kdv")}>KDV</TabButton>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Ara (q)"
        style={{
          width: 360,
          maxWidth: "100%",
          padding: "10px 12px",
          borderRadius: 12,
          border: "1px solid rgba(0,0,0,0.2)",
        }}
      />

      {err ? (
        <div style={{ padding: 12, border: "1px solid rgba(255,0,0,0.3)", borderRadius: 12 }}>
          <b>Hata:</b> {err}
          <div style={{ marginTop: 6, opacity: 0.75, fontSize: 12 }}>
            Backend çalışıyor mu? (http://localhost:3100)
          </div>
        </div>
      ) : (
        <div style={{ border: "1px solid rgba(0,0,0,0.1)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: 10, background: "rgba(0,0,0,0.03)", fontWeight: 700 }}>
            {tab.toUpperCase()} • {rows.length} kayıt
          </div>
          <div style={{ padding: 10, overflowX: "auto" }}>
            <pre style={{ margin: 0, fontSize: 12 }}>{JSON.stringify(rows, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
