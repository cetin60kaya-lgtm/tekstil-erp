export default function RenkKarti({ renk, onPasif, onKopyala }) {
  return (
    <div style={styles.card}>
      <div
        style={{
          ...styles.colorBox,
          backgroundColor: renk.hexRenk,
          opacity: renk.aktif ? 1 : 0.35,
        }}
        title={renk.hexRenk}
      />
      <div style={styles.text}>
        <strong>
          {renk.pantone}
          {renk.versiyon ? ` ${renk.versiyon}` : ""}
        </strong>
        <div style={styles.sub}>{renk.boyaTuru}</div>
      </div>

      <div style={styles.actions}>
        <button style={styles.btn} onClick={() => onKopyala?.(renk)}>
          Kopyala
        </button>
        <button
          style={styles.btn}
          onClick={() => onPasif?.(renk)}
          disabled={!renk.aktif}
          title={!renk.aktif ? "Zaten pasif" : "Pasif yap"}
        >
          Pasif
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    width: 160,
    border: "1px solid #000",
    padding: 8,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  colorBox: {
    width: 110,
    height: 110,
    border: "1px solid #000",
    marginBottom: 8,
  },
  text: {
    textAlign: "center",
    fontSize: 13,
  },
  sub: {
    fontSize: 11,
    opacity: 0.7,
  },
  actions: {
    display: "flex",
    gap: 8,
    marginTop: 8,
  },
  btn: {
    border: "1px solid #000",
    background: "white",
    padding: "4px 8px",
    cursor: "pointer",
    fontSize: 12,
  },
};
