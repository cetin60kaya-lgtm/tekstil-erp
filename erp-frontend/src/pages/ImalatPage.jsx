// src/pages/ImalatPage.jsx
// ERP GÖRSEL REV-2 — İmalat
// Kilitler:
// - "Beden/Grup Notu" YOK
// - Beden grubu seçimi Desen Yerleşim (JSON) verisinden gelir (MASTER Desen)
// - Sol üst thumbnail + popup, sağda sticky Ortak Panel

import React, { useEffect, useMemo, useState } from "react";
import { Store, nowIso } from "../lib/storeAdapter";

/** -----------------------------
 *  Helpers
 *  ----------------------------- */
function Card({ title, right, children, style }) {
  return (
    <div
      style={{
        border: "1px solid #e8e8e8",
        borderRadius: 14,
        padding: 14,
        background: "#fff",
        boxShadow: "0 1px 10px rgba(0,0,0,0.04)",
        ...style,
      }}
    >
      {(title || right) && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ fontWeight: 800, fontSize: 14 }}>{title}</div>
          <div style={{ marginLeft: "auto" }}>{right}</div>
        </div>
      )}
      {children}
    </div>
  );
}

function Label({ children }) {
  return <div style={{ fontSize: 12, color: "#444", fontWeight: 700, marginBottom: 6 }}>{children}</div>;
}

function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        border: "1px solid #e2e2e2",
        borderRadius: 10,
        padding: "10px 12px",
        outline: "none",
        fontSize: 14,
      }}
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 6 }) {
  return (
    <textarea
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: "100%",
        border: "1px solid #e2e2e2",
        borderRadius: 10,
        padding: "10px 12px",
        outline: "none",
        fontSize: 13,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
        resize: "vertical",
      }}
    />
  );
}

function Button({ children, onClick, variant = "primary", disabled }) {
  const base = {
    border: "1px solid transparent",
    borderRadius: 10,
    padding: "10px 12px",
    fontWeight: 800,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    userSelect: "none",
    fontSize: 13,
    whiteSpace: "nowrap",
  };
  const styles =
    variant === "primary"
      ? { background: "#111", color: "#fff" }
      : variant === "ghost"
      ? { background: "#fff", color: "#111", borderColor: "#e2e2e2" }
      : variant === "danger"
      ? { background: "#c62828", color: "#fff" }
      : { background: "#f5f5f5", color: "#111" };

  return (
    <button disabled={disabled} onClick={disabled ? undefined : onClick} style={{ ...base, ...styles }}>
      {children}
    </button>
  );
}

function Pill({ children }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 10px",
        borderRadius: 999,
        border: "1px solid #e3e3e3",
        background: "#fafafa",
        fontWeight: 800,
        fontSize: 12,
        color: "#222",
      }}
    >
      {children}
    </span>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "#efefef", margin: "12px 0" }} />;
}

// Yerleşim beden grubu çıkarımı (DesenPage ile aynı tolerant yaklaşım)
function extractBedenGruplari(obj) {
  const uniq = new Set();

  function add(v) {
    if (!v) return;
    const s = String(v).trim();
    if (!s) return;
    uniq.add(s);
  }

  function walk(x) {
    if (!x) return;
    if (Array.isArray(x)) {
      x.forEach(walk);
      return;
    }
    if (typeof x === "object") {
      const directKeys = ["bedenGruplari", "beden_gruplari", "bedenGrupları", "sizeGroups", "groups"];
      directKeys.forEach((k) => {
        if (x[k] && Array.isArray(x[k])) x[k].forEach(add);
      });

      if (x.beden && Array.isArray(x.beden)) x.beden.forEach(add);
      if (x.sizes && Array.isArray(x.sizes)) x.sizes.forEach(add);

      const maybe = ["sizeGroup", "bedenGrubu", "beden_grubu", "group", "size"];
      maybe.forEach((k) => add(x[k]));

      Object.keys(x).forEach((k) => {
        if (k === "__proto__" || k === "constructor") return;
        walk(x[k]);
      });
    }
  }

  walk(obj);

  return Array.from(uniq).sort((a, b) => a.localeCompare(b, "tr"));
}

function pickActivePlacement(model) {
  const pv = Array.isArray(model?.desen?.placementVersions) ? model.desen.placementVersions : [];
  const act = model?.desen?.activePlacementVersion ?? (pv[0]?.version ?? null);
  const found = pv.find((x) => x.version === act) || pv[0] || null;
  return { pv, act, found };
}

/** -----------------------------
 *  Main Page
 *  ----------------------------- */
export default function ImalatPage() {
  const [models, setModels] = useState([]);
  const [modelName, setModelName] = useState("");
  const [loadedModel, setLoadedModel] = useState(null);

  // Derived from Desen placement
  const [placementInfo, setPlacementInfo] = useState({ act: null, found: null, pv: [] });
  const bedenGruplari = useMemo(() => extractBedenGruplari(placementInfo?.found?.json), [placementInfo]);

  // İmalat kayıt alanları (minimal, kilitli mimari)
  const [isTipi, setIsTipi] = useState("İmalat"); // Numune/İmalat ayrımı ileride modülleşir; şimdilik sabit
  const [seciliBedenGrubu, setSeciliBedenGrubu] = useState("");
  const [adet, setAdet] = useState("0");
  const [vardiya, setVardiya] = useState("Gündüz");
  const [makina, setMakina] = useState("");
  const [operator, setOperator] = useState("");
  const [notlar, setNotlar] = useState("");

  // Visual
  const [showThumbPopup, setShowThumbPopup] = useState(false);

  // UX
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const list = Store.listModels();
    setModels(Array.isArray(list) ? list : []);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!modelName) {
      setLoadedModel(null);
      setPlacementInfo({ act: null, found: null, pv: [] });
      setSeciliBedenGrubu("");
      setDirty(false);
      return;
    }

    const m = Store.getModelByName(modelName.trim());
    setLoadedModel(m || null);

    if (m) {
      const info = pickActivePlacement(m);
      setPlacementInfo(info);

      // hydrate imalat (if exists)
      const im = m?.imalat || {};
      setIsTipi(im?.isTipi || "İmalat");
      setSeciliBedenGrubu(im?.bedenGrubu || "");
      setAdet(im?.adet != null ? String(im.adet) : "0");
      setVardiya(im?.vardiya || "Gündüz");
      setMakina(im?.makina || "");
      setOperator(im?.operator || "");
      setNotlar(im?.notlar || "");

      setDirty(false);
    } else {
      setPlacementInfo({ act: null, found: null, pv: [] });
      setIsTipi("İmalat");
      setSeciliBedenGrubu("");
      setAdet("0");
      setVardiya("Gündüz");
      setMakina("");
      setOperator("");
      setNotlar("");
      setDirty(false);
    }
  }, [modelName]);

  useEffect(() => {
    const handler = (e) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  function markDirty() {
    if (!dirty) setDirty(true);
  }

  function save() {
    const name = (modelName || "").trim();
    if (!name) {
      setToast("Model adı zorunlu.");
      return;
    }

    // beden grubu kontrol: yerleşimden gelmeli
    if (!seciliBedenGrubu) {
      setToast("Beden grubu seç.");
      return;
    }

    const base = Store.getModelByName(name) || { name };

    const payload = {
      ...base,
      name,
      imalat: {
        ...(base?.imalat || {}),
        isTipi,
        bedenGrubu: seciliBedenGrubu, // KİLİT: Yerleşimden seçilir
        adet: Number.isFinite(Number(adet)) ? Number(adet) : 0,
        vardiya,
        makina,
        operator,
        notlar,
        updatedAt: nowIso(),
      },
      updatedAt: nowIso(),
    };

    Store.upsertModel(payload);

    // refresh list & model
    const list = Store.listModels();
    setModels(Array.isArray(list) ? list : []);
    setLoadedModel(payload);
    setDirty(false);
    setToast("İmalat kaydedildi.");
  }

  const modelOptions = useMemo(() => {
    const list = models || [];
    return list
      .map((m) => m?.name)
      .filter(Boolean)
      .filter((n, i, arr) => arr.indexOf(n) === i);
  }, [models]);

  const thumbDataUrl = loadedModel?.desen?.thumbDataUrl || "";

  const placementBadge = useMemo(() => {
    const v = placementInfo?.act;
    if (!v) return "Yerleşim: —";
    return `Yerleşim: v${v}`;
  }, [placementInfo]);

  const hasPlacement = Boolean(placementInfo?.found?.json);

  // if selected group not present anymore, clear it
  useEffect(() => {
    if (!seciliBedenGrubu) return;
    if ((bedenGruplari || []).length === 0) return;
    if (!bedenGruplari.includes(seciliBedenGrubu)) {
      setSeciliBedenGrubu("");
      markDirty();
    }
  }, [bedenGruplari]);

  return (
    <div style={{ padding: 18, background: "#f6f7f8", minHeight: "calc(100vh - 0px)" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div style={{ fontSize: 18, fontWeight: 900 }}>İmalat</div>
        {dirty ? <Pill>Değişiklik var</Pill> : <Pill>Kaydedilmiş</Pill>}
        <Pill>{placementBadge}</Pill>

        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          <Button variant="ghost" onClick={() => setShowThumbPopup(true)} disabled={!thumbDataUrl}>
            Model Görseli
          </Button>
          <Button onClick={save} disabled={!modelName}>
            Kaydet
          </Button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 14, alignItems: "start" }}>
        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Model */}
          <Card title="Model">
            <Label>Model Adı</Label>
            <input
              list="modelNamesImalat"
              value={modelName}
              onChange={(e) => {
                setModelName(e.target.value);
                markDirty();
              }}
              placeholder="Model seç..."
              style={{
                width: "100%",
                border: "1px solid #e2e2e2",
                borderRadius: 10,
                padding: "10px 12px",
                outline: "none",
                fontSize: 14,
              }}
            />
            <datalist id="modelNamesImalat">
              {modelOptions.map((n) => (
                <option key={n} value={n} />
              ))}
            </datalist>

            <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
              <Pill>{loadedModel ? "Kayıt var" : "Yeni model"}</Pill>
              {thumbDataUrl ? <Pill>Thumbnail OK</Pill> : <Pill>Thumbnail yok</Pill>}
              {hasPlacement ? <Pill>Yerleşim OK</Pill> : <Pill>Yerleşim yok</Pill>}
            </div>

            {!hasPlacement && (
              <div style={{ marginTop: 10, padding: 10, borderRadius: 12, background: "#fff7e6", border: "1px solid #ffe1a6" }}>
                <div style={{ fontWeight: 950, marginBottom: 6 }}>Yerleşim verisi bulunamadı</div>
                <div style={{ color: "#6b4f00", fontWeight: 700, fontSize: 13 }}>
                  DesenPage’de Yerleşim (JSON) yükleyip v+ kaydet. İmalat beden grubu seçimi yerleşimden geliyor (kilit).
                </div>
              </div>
            )}
          </Card>

          {/* İş bilgisi */}
          <Card title="İş Bilgisi">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <Label>İş Tipi</Label>
                <select
                  value={isTipi}
                  onChange={(e) => {
                    setIsTipi(e.target.value);
                    markDirty();
                  }}
                  style={{
                    width: "100%",
                    border: "1px solid #e2e2e2",
                    borderRadius: 10,
                    padding: "10px 12px",
                    outline: "none",
                    fontSize: 14,
                    background: "#fff",
                  }}
                >
                  <option value="Numune">Numune</option>
                  <option value="İmalat">İmalat</option>
                </select>
              </div>

              <div>
                <Label>Vardiya</Label>
                <select
                  value={vardiya}
                  onChange={(e) => {
                    setVardiya(e.target.value);
                    markDirty();
                  }}
                  style={{
                    width: "100%",
                    border: "1px solid #e2e2e2",
                    borderRadius: 10,
                    padding: "10px 12px",
                    outline: "none",
                    fontSize: 14,
                    background: "#fff",
                  }}
                >
                  <option value="Gündüz">Gündüz</option>
                  <option value="Gece">Gece</option>
                </select>
              </div>
            </div>

            <Divider />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <Label>Beden Grubu (Yerleşimden)</Label>
                <select
                  value={seciliBedenGrubu}
                  onChange={(e) => {
                    setSeciliBedenGrubu(e.target.value);
                    markDirty();
                  }}
                  disabled={!hasPlacement || (bedenGruplari || []).length === 0}
                  style={{
                    width: "100%",
                    border: "1px solid #e2e2e2",
                    borderRadius: 10,
                    padding: "10px 12px",
                    outline: "none",
                    fontSize: 14,
                    background: !hasPlacement ? "#f5f5f5" : "#fff",
                  }}
                >
                  <option value="">{hasPlacement ? "Seç..." : "Yerleşim yok"}</option>
                  {(bedenGruplari || []).map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>

                <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {(bedenGruplari || []).slice(0, 12).map((b) => (
                    <Pill key={b}>{b}</Pill>
                  ))}
                  {(bedenGruplari || []).length > 12 && <Pill>+{bedenGruplari.length - 12}</Pill>}
                </div>
              </div>

              <div>
                <Label>Adet</Label>
                <Input
                  type="number"
                  value={adet}
                  onChange={(v) => {
                    setAdet(v);
                    markDirty();
                  }}
                  placeholder="0"
                />
              </div>

              <div>
                <Label>Makina</Label>
                <Input
                  value={makina}
                  onChange={(v) => {
                    setMakina(v);
                    markDirty();
                  }}
                  placeholder="Örn: M1 / Baskı Makinası"
                />
              </div>

              <div>
                <Label>Operatör</Label>
                <Input
                  value={operator}
                  onChange={(v) => {
                    setOperator(v);
                    markDirty();
                  }}
                  placeholder="Ad Soyad"
                />
              </div>
            </div>

            <Divider />

            <Label>Notlar</Label>
            <TextArea
              rows={6}
              value={notlar}
              onChange={(v) => {
                setNotlar(v);
                markDirty();
              }}
              placeholder={"Beden/Grup Notu YOK (kilit).\nBuraya serbest not yazılabilir (örn. kalite, uyarılar)."}
            />
          </Card>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Button onClick={save}>Kaydet</Button>
          </div>
        </div>

        {/* RIGHT: Ortak Panel (sticky) */}
        <div style={{ position: "sticky", top: 14, alignSelf: "start" }}>
          <Card title="Ortak Panel" style={{ minHeight: 520 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Pill>Model: {modelName || "—"}</Pill>
              <Pill>{placementBadge}</Pill>
              <Pill>Beden Grubu: {seciliBedenGrubu || "—"}</Pill>
              <Divider />
              <Label>Ortak Notlar</Label>
              <TextArea
                rows={12}
                value={loadedModel?.ortakPanel?.not || ""}
                onChange={(v) => {
                  const name = (modelName || "").trim();
                  if (!name) return;
                  const base = Store.getModelByName(name) || { name };
                  const payload = {
                    ...base,
                    name,
                    ortakPanel: {
                      ...(base?.ortakPanel || {}),
                      not: v,
                      updatedAt: nowIso(),
                    },
                    updatedAt: nowIso(),
                  };
                  Store.upsertModel(payload);
                  setLoadedModel(payload);
                  markDirty();
                }}
                placeholder={"Mali bilgiler burada gösterilmez.\nBu panel tüm modüllerde ortak kullanılacak.\n(REV-2'de alanlar admin'den yönetilecek)"}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <Button onClick={save}>Kaydet</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Thumb popup */}
      {showThumbPopup && (
        <div
          onClick={() => setShowThumbPopup(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 18,
            zIndex: 50,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(920px, 96vw)",
              background: "#fff",
              borderRadius: 18,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.2)",
              boxShadow: "0 12px 60px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", padding: 12, borderBottom: "1px solid #eee" }}>
              <div style={{ fontWeight: 950 }}>Model Görseli</div>
              <div style={{ marginLeft: "auto" }}>
                <Button variant="ghost" onClick={() => setShowThumbPopup(false)}>
                  Kapat
                </Button>
              </div>
            </div>
            <div style={{ padding: 12, background: "#fafafa" }}>
              {thumbDataUrl ? (
                <img
                  src={thumbDataUrl}
                  alt="model"
                  style={{ width: "100%", maxHeight: "78vh", objectFit: "contain", borderRadius: 12, background: "#fff" }}
                />
              ) : (
                <div style={{ padding: 24, fontWeight: 900, color: "#777" }}>Thumbnail yok.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#111",
            color: "#fff",
            padding: "10px 14px",
            borderRadius: 999,
            fontWeight: 900,
            zIndex: 60,
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
