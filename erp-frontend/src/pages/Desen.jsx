// src/pages/DesenPage.jsx
// ERP GÖRSEL REV-2 — Desen (MASTER)
// Kilitler:
// - Desen MASTER: renk kimliği, görseller, placement (versiyonlu)
// - Beden/grup listesi yerleşim JSON'dan türetilir
// - Sağda sticky Ortak Panel; mali bilgi içermez
// - Sol üstte model thumbnail + popup

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Store, nowIso } from "../lib/storeAdapter";

/** UI Primitives **/
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
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
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

/** Yardımcılar **/
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

function makeColorKeyFromFields({ pantone, name }) {
  const p = (pantone || "").trim();
  const n = (name || "").trim();
  return (p ? p : n).toLowerCase();
}

function formatPantoneDisplay(pantone, name) {
  const p = (pantone || "").trim();
  const n = (name || "").trim();
  if (p && n) return `${p} – ${n}`;
  if (p) return p;
  if (n) return n;
  return "Renk";
}

export default function DesenPage() {
  const [models, setModels] = useState([]);
  const [modelName, setModelName] = useState("");
  const [loadedModel, setLoadedModel] = useState(null);

  // master fields
  const [baskiAlanlari, setBaskiAlanlari] = useState("");
  const [onOlcu, setOnOlcu] = useState("");
  const [arkaOlcu, setArkaOlcu] = useState("");

  // visuals
  const [thumbDataUrl, setThumbDataUrl] = useState("");
  const [desenGorselDataUrl, setDesenGorselDataUrl] = useState("");
  const [kanalGorselDataUrl, setKanalGorselDataUrl] = useState("");

  // placement
  const [placementJsonText, setPlacementJsonText] = useState("");
  const [placementParsed, setPlacementParsed] = useState(null);
  const [placementParseError, setPlacementParseError] = useState("");
  const [placementVersions, setPlacementVersions] = useState([]);
  const [activePlacementVersion, setActivePlacementVersion] = useState(null);
  const bedenGruplari = useMemo(() => extractBedenGruplari(placementParsed), [placementParsed]);

  // colors (MASTER)
  const [colors, setColors] = useState([]);
  const [newColorPantone, setNewColorPantone] = useState("");
  const [newColorName, setNewColorName] = useState("");
  const [newColorBoyaTuru, setNewColorBoyaTuru] = useState("Su Bazlı");
  const [newColorEfekt, setNewColorEfekt] = useState("");
  const [newColorHex, setNewColorHex] = useState("");

  // UI/UX
  const [showThumbPopup, setShowThumbPopup] = useState(false);
  const fileThumbRef = useRef(null);
  const fileDesenRef = useRef(null);
  const fileKanalRef = useRef(null);
  const filePlacementJsonRef = useRef(null);
  const filePlacementPdfRef = useRef(null);
  const [placementPdfName, setPlacementPdfName] = useState("");
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState("");

  // init model list
  useEffect(() => {
    const list = Store.listModels();
    setModels(Array.isArray(list) ? list : []);
  }, []);

  // warn on unload
  useEffect(() => {
    const handler = (e) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // load model
  useEffect(() => {
    if (!modelName) {
      setLoadedModel(null);
      setBaskiAlanlari("");
      setOnOlcu("");
      setArkaOlcu("");
      setThumbDataUrl("");
      setDesenGorselDataUrl("");
      setKanalGorselDataUrl("");
      setPlacementJsonText("");
      setPlacementParsed(null);
      setPlacementParseError("");
      setPlacementVersions([]);
      setActivePlacementVersion(null);
      setColors([]);
      setDirty(false);
      return;
    }
    const m = Store.getModelByName(modelName.trim());
    setLoadedModel(m || null);

    if (m) {
      const d = m?.desen || {};
      setBaskiAlanlari(d?.baskiAlanlari || "");
      setOnOlcu(d?.onOlcu || "");
      setArkaOlcu(d?.arkaOlcu || "");
      setThumbDataUrl(d?.thumbDataUrl || "");
      setDesenGorselDataUrl(d?.desenGorselDataUrl || "");
      setKanalGorselDataUrl(d?.kanalGorselDataUrl || "");
      setPlacementVersions(Array.isArray(d?.placementVersions) ? d.placementVersions : []);
      setActivePlacementVersion(d?.activePlacementVersion ?? null);
      setPlacementPdfName(d?.placementPdfName || "");
      setColors(Array.isArray(d?.colors) ? d.colors : []);
      setDirty(false);
    } else {
      setBaskiAlanlari("");
      setOnOlcu("");
      setArkaOlcu("");
      setThumbDataUrl("");
      setDesenGorselDataUrl("");
      setKanalGorselDataUrl("");
      setPlacementVersions([]);
      setActivePlacementVersion(null);
      setPlacementPdfName("");
      setColors([]);
      setDirty(false);
    }
  }, [modelName]);

  // toast auto hide
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  function markDirty() {
    if (!dirty) setDirty(true);
  }

  function onPickImage(file, setter) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setter(String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  function parsePlacementJson(text) {
    const raw = (text || "").trim();
    if (!raw) {
      setPlacementParsed(null);
      setPlacementParseError("");
      return;
    }
    try {
      const obj = JSON.parse(raw);
      setPlacementParsed(obj);
      setPlacementParseError("");
    } catch (e) {
      setPlacementParsed(null);
      setPlacementParseError("JSON parse hatası");
    }
  }

  function addPlacementVersionFromParsed(sourceName = "Manual/JSON") {
    if (!placementParsed) return;
    const nextVersion = (() => {
      const maxV = (placementVersions || []).reduce((mx, x) => Math.max(mx, Number(x?.version) || 0), 0);
      return maxV + 1;
    })();
    const entry = {
      version: nextVersion,
      createdAt: nowIso(),
      sourceName: sourceName || "JSON",
      json: placementParsed,
    };
    const next = [entry, ...(placementVersions || [])];
    setPlacementVersions(next);
    setActivePlacementVersion(nextVersion);
    setToast(`Yerleşim v${nextVersion} eklendi.`);
    markDirty();
  }

  function switchPlacementVersion(v) {
    setActivePlacementVersion(v);
    markDirty();
  }

  function removePlacementVersion(v) {
    const next = (placementVersions || []).filter((x) => x.version !== v);
    setPlacementVersions(next);
    if (activePlacementVersion === v) setActivePlacementVersion(next[0]?.version ?? null);
    setToast(`Yerleşim v${v} silindi.`);
    markDirty();
  }

  function addColor() {
    const pantone = (newColorPantone || "").trim();
    const name = (newColorName || "").trim();
    const boyaTuru = (newColorBoyaTuru || "").trim();
    const efekt = (newColorEfekt || "").trim();
    const hex = (newColorHex || "").trim();
    const key = makeColorKeyFromFields({ pantone, name });
    if (!key) {
      setToast("Pantone veya Renk adı gerekli.");
      return;
    }
    const display = formatPantoneDisplay(pantone, name);
    const item = {
      key,
      display,
      pantone,
      name,
      boyaTuru: boyaTuru || "Su Bazlı",
      efekt,
      hex,
      updatedAt: nowIso(),
    };
    const idx = colors.findIndex((c) => (c?.key || "").toLowerCase() === key.toLowerCase());
    const next = colors.slice();
    if (idx >= 0) next[idx] = { ...next[idx], ...item };
    else next.unshift(item);
    setColors(next);
    setNewColorPantone("");
    setNewColorName("");
    setNewColorBoyaTuru("Su Bazlı");
    setNewColorEfekt("");
    setNewColorHex("");
    setToast(idx >= 0 ? "Renk güncellendi." : "Renk eklendi.");
    markDirty();
  }

  function removeColor(key) {
    const next = colors.filter((c) => c?.key !== key);
    setColors(next);
    markDirty();
  }

  function savePublish() {
    const name = (modelName || "").trim();
    if (!name) {
      setToast("Model adı zorunlu.");
      return;
    }
    const base = Store.getModelByName(name) || { name };
    const payload = {
      ...base,
      name,
      desen: {
        ...(base?.desen || {}),
        baskiAlanlari: baskiAlanlari || "",
        onOlcu: onOlcu || "",
        arkaOlcu: arkaOlcu || "",
        thumbDataUrl: thumbDataUrl || "",
        desenGorselDataUrl: desenGorselDataUrl || "",
        kanalGorselDataUrl: kanalGorselDataUrl || "",
        placementVersions: placementVersions || [],
        activePlacementVersion: activePlacementVersion ?? null,
        placementPdfName: placementPdfName || "",
        colors: colors || [],
        updatedAt: nowIso(),
      },
      updatedAt: nowIso(),
    };
    Store.upsertModel(payload);
    const list = Store.listModels();
    setModels(Array.isArray(list) ? list : []);
    setLoadedModel(payload);
    setDirty(false);
    setToast("Kaydedildi (Yayınlandı).");
  }

  const modelOptions = useMemo(() => {
    const list = models || [];
    return list
      .map((m) => m?.name)
      .filter(Boolean)
      .filter((n, i, arr) => arr.indexOf(n) === i);
  }, [models]);

  const placementSummary = useMemo(() => {
    const v = activePlacementVersion;
    const found = (placementVersions || []).find((x) => x.version === v) || null;
    const sizes = bedenGruplari;
    return {
      activeVersion: v,
      sourceName: found?.sourceName || "",
      createdAt: found?.createdAt || "",
      bedenGruplari: sizes,
    };
  }, [activePlacementVersion, placementVersions, bedenGruplari]);

  return (
    <div style={{ padding: 18, background: "#f6f7f8", minHeight: "calc(100vh - 0px)" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div style={{ fontSize: 18, fontWeight: 900 }}>Desen (MASTER)</div>
        {dirty ? <Pill>Değişiklik var</Pill> : <Pill>Kaydedilmiş</Pill>}
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          <Button variant="ghost" onClick={() => setShowThumbPopup(true)} disabled={!thumbDataUrl}>
            Model Görseli
          </Button>
          <Button onClick={savePublish}>Kaydet (Yayın)</Button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 14, alignItems: "start" }}>
        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Model + thumbnail */}
          <Card
            title="Model"
            right={
              <div style={{ display: "flex", gap: 8 }}>
                <Button variant="ghost" onClick={() => fileThumbRef.current?.click()}>
                  Thumbnail Yükle
                </Button>
                <input
                  ref={fileThumbRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    onPickImage(f, setThumbDataUrl);
                    e.target.value = "";
                    markDirty();
                  }}
                />
              </div>
            }
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 12 }}>
              <div>
                <Label>Model Adı</Label>
                <input
                  list="modelNames"
                  value={modelName}
                  onChange={(e) => {
                    setModelName(e.target.value);
                    markDirty();
                  }}
                  placeholder="Örn: 18-1663 Kırmızı / Model-XYZ"
                  style={{
                    width: "100%",
                    border: "1px solid #e2e2e2",
                    borderRadius: 10,
                    padding: "10px 12px",
                    outline: "none",
                    fontSize: 14,
                  }}
                />
                <datalist id="modelNames">
                  {modelOptions.map((n) => (
                    <option key={n} value={n} />
                  ))}
                </datalist>
                <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                  <Pill>{loadedModel ? "Kayıt var" : "Yeni model"}</Pill>
                </div>
              </div>
              <div>
                <Label>Thumbnail</Label>
                <div
                  onClick={() => thumbDataUrl && setShowThumbPopup(true)}
                  title={thumbDataUrl ? "Büyüt" : "Yükleyin"}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 14,
                    border: "1px solid #e2e2e2",
                    overflow: "hidden",
                    background: "#fafafa",
                    cursor: thumbDataUrl ? "pointer" : "default",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    color: "#aaa",
                  }}
                >
                  {thumbDataUrl ? (
                    <img src={thumbDataUrl} alt="thumb" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span>YOK</span>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Ölçüler + baskı alanları */}
          <Card title="Baskı Bilgileri">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <Label>Ön Ölçü</Label>
                <Input value={onOlcu} onChange={(v) => { setOnOlcu(v); markDirty(); }} placeholder="Örn: 30x40 / metin" />
              </div>
              <div>
                <Label>Arka Ölçü</Label>
                <Input value={arkaOlcu} onChange={(v) => { setArkaOlcu(v); markDirty(); }} placeholder="Örn: 28x38 / metin" />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <Label>Baskı Alanları (metin)</Label>
              <TextArea
                rows={4}
                value={baskiAlanlari}
                onChange={(v) => { setBaskiAlanlari(v); markDirty(); }}
                placeholder={"Örn:\n- Üst Ön\n- Üst Arka\n- Kol\n- Alt/Paça\n(REV-2'de admin sözlükten gelecek)"}
              />
            </div>
          </Card>

          {/* Görseller */}
          <Card
            title="Görseller"
            right={
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Button variant="ghost" onClick={() => fileDesenRef.current?.click()}>Desen Görseli</Button>
                <Button variant="ghost" onClick={() => fileKanalRef.current?.click()}>Kanal Görseli</Button>
                <input
                  ref={fileDesenRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files?.[0]; if (!f) return; onPickImage(f, setDesenGorselDataUrl); e.target.value = ""; markDirty();
                  }}
                />
                <input
                  ref={fileKanalRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files?.[0]; if (!f) return; onPickImage(f, setKanalGorselDataUrl); e.target.value = ""; markDirty();
                  }}
                />
              </div>
            }
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <Label>Desen</Label>
                <div
                  style={{
                    border: "1px solid #e2e2e2",
                    borderRadius: 14,
                    overflow: "hidden",
                    background: "#fafafa",
                    height: 220,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#aaa",
                    fontWeight: 900,
                  }}
                >
                  {desenGorselDataUrl ? (
                    <img src={desenGorselDataUrl} alt="desen" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  ) : (
                    <span>YOK</span>
                  )}
                </div>
              </div>
              <div>
                <Label>Kanal / Photoshop</Label>
                <div
                  style={{
                    border: "1px solid #e2e2e2",
                    borderRadius: 14,
                    overflow: "hidden",
                    background: "#fafafa",
                    height: 220,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#aaa",
                    fontWeight: 900,
                  }}
                >
                  {kanalGorselDataUrl ? (
                    <img src={kanalGorselDataUrl} alt="kanal" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  ) : (
                    <span>YOK</span>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Yerleşim (versiyonlu) */}
          <Card
            title="Desen Yerleşim (Versiyonlu)"
            right={
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Button variant="ghost" onClick={() => filePlacementPdfRef.current?.click()}>PDF Kaynak Seç</Button>
                <Button variant="ghost" onClick={() => filePlacementJsonRef.current?.click()}>JSON Yükle</Button>
                <Button onClick={() => { parsePlacementJson(placementJsonText); setTimeout(() => addPlacementVersionFromParsed("JSON/Paste"), 0); }} disabled={!placementJsonText}>
                  v+ Kaydet
                </Button>
                <input
                  ref={filePlacementPdfRef}
                  type="file"
                  accept="application/pdf"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files?.[0]; if (!f) return; setPlacementPdfName(f.name); setToast("PDF kaynak adı kaydedildi (parse yok)."); markDirty(); e.target.value = "";
                  }}
                />
                <input
                  ref={filePlacementJsonRef}
                  type="file"
                  accept="application/json,.json"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files?.[0]; if (!f) return; const reader = new FileReader(); reader.onload = () => { const txt = String(reader.result || ""); setPlacementJsonText(txt); parsePlacementJson(txt); markDirty(); }; reader.readAsText(f, "utf-8"); e.target.value = "";
                  }}
                />
              </div>
            }
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 12 }}>
              <div>
                <Label>Yerleşim Verisi (JSON)</Label>
                <TextArea
                  rows={10}
                  value={placementJsonText}
                  onChange={(v) => { setPlacementJsonText(v); parsePlacementJson(v); markDirty(); }}
                  placeholder={"{\n  \"bedenGruplari\": [\"S\", \"M\", \"L\"],\n  \"not\": \"Yerleşim bilgisi...\"\n}\n\nNot: PDF parse yok. Beden grupları bu JSON'dan türetilir."}
                />
                {placementParseError ? (
                  <div style={{ marginTop: 8, color: "#b00020", fontWeight: 800 }}>{placementParseError}</div>
                ) : placementParsed ? (
                  <div style={{ marginTop: 8, color: "#2e7d32", fontWeight: 900 }}>JSON OK</div>
                ) : (
                  <div style={{ marginTop: 8, color: "#888", fontWeight: 800 }}>JSON yok</div>
                )}
              </div>
              <div>
                <Label>Versiyonlar</Label>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Pill>Aktif: {placementSummary.activeVersion ? `v${placementSummary.activeVersion}` : "YOK"}</Pill>
                    {placementSummary.sourceName ? <Pill>{placementSummary.sourceName}</Pill> : <Pill>Kaynak: -</Pill>}
                  </div>
                  <div
                    style={{
                      border: "1px solid #e2e2e2",
                      borderRadius: 14,
                      padding: 10,
                      background: "#fafafa",
                      maxHeight: 240,
                      overflow: "auto",
                    }}
                  >
                    {(placementVersions || []).length === 0 ? (
                      <div style={{ color: "#777", fontWeight: 800 }}>Versiyon yok. JSON girip “v+ Kaydet”.</div>
                    ) : (
                      (placementVersions || []).map((v) => {
                        const isActive = v.version === activePlacementVersion;
                        return (
                          <div
                            key={v.version}
                            style={{
                              display: "flex",
                              gap: 8,
                              alignItems: "center",
                              padding: "8px 8px",
                              borderRadius: 12,
                              background: isActive ? "#fff" : "transparent",
                              border: isActive ? "1px solid #ddd" : "1px solid transparent",
                              marginBottom: 6,
                            }}
                          >
                            <div style={{ fontWeight: 950, width: 44 }}>{`v${v.version}`}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 900, fontSize: 12, color: "#222", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {v.sourceName || "Kaynak"}
                              </div>
                              <div style={{ fontSize: 11, color: "#666" }}>{(v.createdAt || "").slice(0, 19).replace("T", " ")}</div>
                            </div>
                            <Button variant="ghost" onClick={() => switchPlacementVersion(v.version)}>Aç</Button>
                            <Button variant="danger" onClick={() => removePlacementVersion(v.version)}>Sil</Button>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <Divider />
                  <Label>Beden Grupları (Yerleşimden)</Label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {(placementSummary.bedenGruplari || []).length === 0 ? (
                      <span style={{ color: "#777", fontWeight: 800 }}>JSON’dan beden grubu bulunamadı.</span>
                    ) : (
                      placementSummary.bedenGruplari.map((b) => <Pill key={b}>{b}</Pill>)
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Renk Kimliği (MASTER) */}
          <Card
            title="Renk Kimliği (MASTER)"
            right={
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Button variant="ghost" onClick={() => setNewColorBoyaTuru("Su Bazlı")}>
                  Default: Su Bazlı
                </Button>
                <Button onClick={addColor}>Ekle / Güncelle</Button>
              </div>
            }
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <Label>Pantone Kodu</Label>
                <Input value={newColorPantone} onChange={setNewColorPantone} placeholder="Örn: 18-1663" />
              </div>
              <div>
                <Label>Renk Adı</Label>
                <Input value={newColorName} onChange={setNewColorName} placeholder="Örn: Kırmızı" />
              </div>
              <div>
                <Label>Boya Türü (Default: Su Bazlı)</Label>
                <Input value={newColorBoyaTuru} onChange={setNewColorBoyaTuru} placeholder="Örn: Su Bazlı / Pigment / ..." />
              </div>
              <div>
                <Label>Efekt</Label>
                <Input value={newColorEfekt} onChange={setNewColorEfekt} placeholder="Örn: Sim / Kabaran / Normal" />
              </div>
              <div>
                <Label>Hex (opsiyonel)</Label>
                <Input value={newColorHex} onChange={setNewColorHex} placeholder="#ff0000" />
              </div>
              <div style={{ display: "flex", alignItems: "end", gap: 10 }}>
                <Pill>{formatPantoneDisplay(newColorPantone, newColorName)}</Pill>
              </div>
            </div>
            <Divider />
            <Label>Model Renk Listesi</Label>
            <div style={{ border: "1px solid #e2e2e2", borderRadius: 14, overflow: "hidden", background: "#fafafa" }}>
              {(colors || []).length === 0 ? (
                <div style={{ padding: 12, fontWeight: 800, color: "#777" }}>Henüz renk yok.</div>
              ) : (
                (colors || []).map((c) => (
                  <div
                    key={c.key}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 160px 120px 120px",
                      gap: 10,
                      padding: 12,
                      borderTop: "1px solid #ededed",
                      background: "#fff",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 950, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.display || c.key}
                      </div>
                      <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                        {c.boyaTuru ? `Boya: ${c.boyaTuru}` : "Boya: -"} {c.efekt ? `• Efekt: ${c.efekt}` : ""}
                        {c.hex ? ` • ${c.hex}` : ""}
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-start", gap: 8 }}>
                      <div
                        title="Renk kartı (hex varsa)"
                        style={{ width: 44, height: 44, borderRadius: 12, border: "2px solid #111", background: c.hex || "#f2f2f2" }}
                      />
                      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        <div style={{ fontWeight: 900, fontSize: 12 }}>{(c.pantone || "").trim() || "—"}</div>
                        <div style={{ fontSize: 11, color: "#666" }}>{(c.name || "").trim() || "—"}</div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setNewColorPantone(c.pantone || "");
                        setNewColorName(c.name || "");
                        setNewColorBoyaTuru(c.boyaTuru || "Su Bazlı");
                        setNewColorEfekt(c.efekt || "");
                        setNewColorHex(c.hex || "");
                        setToast("Renk editöre alındı.");
                      }}
                    >
                      Düzenle
                    </Button>
                    <Button variant="danger" onClick={() => removeColor(c.key)}>Sil</Button>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Bottom save */}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Button onClick={savePublish}>Kaydet (Yayın)</Button>
          </div>
        </div>

        {/* RIGHT: Ortak Panel (sticky) */}
        <div style={{ position: "sticky", top: 14, alignSelf: "start" }}>
          <Card title="Ortak Panel" style={{ minHeight: 520 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Pill>Model: {modelName || "—"}</Pill>
              <Pill>Yerleşim: {activePlacementVersion ? `v${activePlacementVersion}` : "—"}</Pill>
              <Pill>Beden Grubu: {(bedenGruplari || []).length ? bedenGruplari.join(", ") : "—"}</Pill>
              <Divider />
              <Label>Notlar (şimdilik serbest metin)</Label>
              <TextArea
                rows={10}
                value={loadedModel?.ortakPanel?.not || ""}
                onChange={(v) => {
                  const base = Store.getModelByName((modelName || "").trim()) || { name: (modelName || "").trim() };
                  const payload = {
                    ...base,
                    name: (modelName || "").trim(),
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
                placeholder={"Bu panel tüm modüllerden ortak kullanılacak.\nMali bilgiler burada gösterilmez.\n(REV-2'de alanlar admin'den yönetilecek)"}
              />
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <Button onClick={savePublish}>Kaydet</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Thumbnail Popup */}
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
