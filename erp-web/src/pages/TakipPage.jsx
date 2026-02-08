import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:3100";

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text().catch(() => "İstek başarısız"));
  return res.json();
}

export default function TakipPage() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    getJson(`${BASE_URL}/takip/latest?limit=50`)
      .then((d) => setRows(d))
      .catch((e) => setErr(e.message || String(e)));
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h2 style={{ margin: 0 }}>Takip / Sevkiyat</h2>
      {err ? <div><b>Hata:</b> {err}</div> : <pre style={{ margin: 0, fontSize: 12 }}>{JSON.stringify(rows, null, 2)}</pre>}
    </div>
  );
}
