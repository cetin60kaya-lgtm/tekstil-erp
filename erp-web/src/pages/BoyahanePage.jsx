import { useEffect, useMemo, useState } from "react";
import { boyahaneApi as BoyahaneAPI } from "../api/boyahane";
import RenkKart from "../components/RenkKart";

export default function BoyahanePage() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [items, setItems] = useState([]);

  // filters
  const [aktif, setAktif] = useState("true");
  const [boyaTuru, setBoyaTuru] = useState("");
  const [isImalat, setIsImalat] = useState("");
  const [isNumune, setIsNumune] = useState("");
  const [q, setQ] = useState("");

  // create form
  const [newPantone, setNewPantone] = useState("");
  const [newVersiyon, setNewVersiyon] = useState("v1");
  const [newBoyaTuru, setNewBoyaTuru] = useState("Pigment");
  const [newHex, setNewHex] = useState(""); // BOŞ = AUTOHEX
  const [newIsImalat, setNewIsImalat] = useState(false);
  const [newIsNumune, setNewIsNumune] = useState(false);
  const [newNot, setNewNot] = useState("");

  const params = useMemo(
    () => ({
      aktif: aktif === "" ? undefined : aktif,
      boyaTuru: boyaTuru || undefined,
      isImalat: isImalat === "" ? undefined : isImalat,
      isNumune: isNumune === "" ? undefined : isNumune,
      take: 200,
      skip: 0,
    }),
    [aktif, boyaTuru, isImalat, isNumune]
  );

  async function load() {
    setLoading(true);
    setErr("");
    try {
      if (q && q.trim().length >= 1) {
        const data = await BoyahaneAPI.search(q.trim());
        setItems(Array.isArray(data.data) ? data.data : []);
      } else {
        const data = await BoyahaneAPI.list(params);
        setItems(Array.isArray(data.data) ? data.data : []);
      }
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  async function onEditHex(item) {
    const current = item.hexRenk || "#FFFFFF";
    const next = window.prompt("HEX gir (örn: #E34A34)", current);
    if (!next) return;
    const hex = next.trim();
    if (!/^#([0-9a-fA-F]{6})$/.test(hex)) {
      alert("HEX formatı yanlış. Örn: #E34A34");
      return;
    }
    try {
      setLoading(true);
      await BoyahaneAPI.update(item.id, { hexRenk: hex });
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  async function onTogglePasif(item) {
    if (!confirm("Bu rengi pasif yapmak istiyor musun?")) return;
    try {
      setLoading(true);
      await BoyahaneAPI.pasif(item.id);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  async function onCreate(e) {
    e.preventDefault();

    const hexRaw = (newHex || "").trim();
    if (hexRaw && !/^#([0-9a-fA-F]{6})$/.test(hexRaw)) {
      return alert("HEX formatı yanlış. Örn: #E34A34");
    }

    const payload = {
      pantone: newPantone.trim(),
      versiyon: newVersiyon.trim(),
      boyaTuru: newBoyaTuru,
      hexRenk: hexRaw ? hexRaw : null, // AUTOHEX
      isNumune: !!newIsNumune,
      isImalat: !!newIsImalat,
      aktif: true,
      not: newNot.trim() || null,
    };

    if (!payload.pantone) return alert("Pantone zorunlu");

    try {
      setLoading(true);
      await BoyahaneAPI.create(payload);
      setNewPantone("");
      setNewNot("");
      setNewHex("");
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.h1}>Boyahane • Renk Kataloğu</h1>
          <div style={styles.small}>
            API: <code>{import.meta.env.VITE_API_BASE_URL}</code>
          </div>
        </div>
        <button style={styles.btn} onClick={load} disabled={loading}>
          Yenile
        </button>
      </header>

      <section style={styles.panel}>
        <form onSubmit={onCreate} style={styles.create}>
          <strong>Yeni Renk</strong>
          <div style={styles.row}>
            <input value={newPantone} onChange={e => setNewPantone(e.target.value)} placeholder="Pantone" style={styles.input} />
            <input value={newVersiyon} onChange={e => setNewVersiyon(e.target.value)} placeholder="Versiyon" style={styles.input} />
            <input value={newBoyaTuru} onChange={e => setNewBoyaTuru(e.target.value)} placeholder="Boya Türü" style={styles.input} />
            <input value={newHex} onChange={e => setNewHex(e.target.value)} placeholder="HEX (boş = AUTO)" style={styles.input} />
            <button type="submit" style={styles.btn}>Ekle</button>
          </div>
        </form>

        {err && <div style={styles.error}>Hata: {err}</div>}
        {loading && <div style={styles.small}>Yükleniyor...</div>}

        <div style={styles.grid}>
          {items.map(it => (
            <RenkKart
              key={it.id}
              item={it}
              onEditHex={onEditHex}
              onTogglePasif={onTogglePasif}
            />
          ))}
        </div>

        {!loading && items.length === 0 && <div style={styles.small}>Kayıt yok.</div>}
      </section>
    </div>
  );
}

const styles = {
  page: { padding: 16, background: "#f6f6f6", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", marginBottom: 12 },
  h1: { margin: 0 },
  small: { fontSize: 12, opacity: 0.7 },
  panel: { background: "#fff", padding: 16, borderRadius: 16 },
  create: { marginBottom: 16 },
  row: { display: "flex", gap: 8, flexWrap: "wrap" },
  input: { padding: 10, borderRadius: 12, border: "1px solid #ddd" },
  btn: { padding: "10px 14px", borderRadius: 12, cursor: "pointer" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 12 },
  error: { background: "#ffecec", padding: 12, borderRadius: 12 },
};
