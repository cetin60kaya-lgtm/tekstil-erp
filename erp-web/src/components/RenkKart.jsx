export default function RenkKart({ item, onEditHex, onTogglePasif }) {
  const hex = item.hexRenk || "#FFFFFF";
  const pantone = item.pantone || "-";
  const versiyon = item.versiyon ? ` • ${item.versiyon}` : "";
  const boyaTuru = item.boyaTuru ? String(item.boyaTuru) : "";
  const aktif = item.aktif !== false;

  return (
    <div style={styles.card}>
      <button
        type="button"
        onClick={() => onEditHex(item)}
        title="Rengi düzenle (HEX)"
        style={styles.swatchBtn}
      >
        <div style={{ ...styles.swatch, background: hex }} />
      </button>

      <div style={styles.meta}>
        <div style={styles.pantone}>{pantone}{versiyon}</div>
        {boyaTuru ? <div style={styles.sub}>{boyaTuru}</div> : null}
        <div style={styles.sub}>
          HEX: <code>{hex}</code>
        </div>
      </div>

      <div style={styles.actions}>
        <button type="button" onClick={() => onEditHex(item)} style={styles.btn}>
          Düzenle
        </button>
        <button
          type="button"
          onClick={() => onTogglePasif(item)}
          style={{ ...styles.btn, ...(aktif ? {} : styles.btnDanger) }}
        >
          {aktif ? "Pasif Yap" : "Aktif/Pasif"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #e5e5e5",
    borderRadius: 12,
    padding: 12,
    display: "grid",
    gridTemplateColumns: "92px 1fr",
    gap: 12,
    background: "#fff",
  },
  swatchBtn: {
    all: "unset",
    cursor: "pointer",
    width: 92,
    height: 92,
    display: "grid",
    placeItems: "center",
  },
  swatch: {
    width: 80,
    height: 80,
    border: "2px solid #000",
    borderRadius: 6,
  },
  meta: { display: "flex", flexDirection: "column", gap: 4 },
  pantone: { fontWeight: 700, fontSize: 14 },
  sub: { fontSize: 12, opacity: 0.8 },
  actions: {
    gridColumn: "1 / -1",
    display: "flex",
    gap: 8,
    marginTop: 4,
  },
  btn: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #ddd",
    background: "#fafafa",
    cursor: "pointer",
    fontSize: 12,
  },
  btnDanger: {
    borderColor: "#ffb3b3",
    background: "#fff5f5",
  },
};
