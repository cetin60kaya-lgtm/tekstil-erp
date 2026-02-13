$ErrorActionPreference = "Stop"

$BACKEND  = "C:\ERP\erp-backend"
$FRONTEND = "C:\ERP\erp-frontend"

function Ensure-Dir([string]$path) {
  if (!(Test-Path $path)) { New-Item -ItemType Directory -Force -Path $path | Out-Null }
}

function Backup-File([string]$path) {
  if (Test-Path $path) {
    $stamp = Get-Date -Format "yyyyMMdd_HHmmss"
    Copy-Item $path "$path.bak_$stamp" -Force
  }
}

function Write-File([string]$path, [string]$content) {
  $dir = Split-Path $path -Parent
  Ensure-Dir $dir
  Set-Content -Path $path -Value $content -Encoding UTF8
}

function Patch-AppModule([string]$appModulePath) {
  if (!(Test-Path $appModulePath)) { throw "app.module.ts yok: $appModulePath" }
  Backup-File $appModulePath

  $txt = Get-Content $appModulePath -Raw

  # import ekle
  if ($txt -notmatch "ModelRenkModule") {
    if ($txt -notmatch "import\s+\{\s*ModelRenkModule\s*\}\s+from") {
      # importları bozmayacak şekilde en üste ekle
      $txt = "import { ModelRenkModule } from `"./boyahane/model-renk/model-renk.module`";`r`n" + $txt
    }
  }

  # imports dizisine ekle (zaten varsa dokunma)
  if ($txt -notmatch "imports:\s*\[[^\]]*ModelRenkModule") {
    if ($txt -match "imports:\s*\[") {
      $txt = $txt -replace "imports:\s*\[", "imports: [ModelRenkModule, "
    } else {
      # nadir: imports bulunamazsa dosyanın sonuna not bırak
      $txt += "`r`n// TODO: AppModule imports içine ModelRenkModule ekle`r`n"
    }
  }

  Set-Content -Path $appModulePath -Value $txt -Encoding UTF8
}

Write-Host "=== BACKEND ==="

if (!(Test-Path $BACKEND)) { throw "BACKEND klasörü yok: $BACKEND" }

$schemaPath = Join-Path $BACKEND "prisma\schema.prisma"
if (!(Test-Path $schemaPath)) { throw "Prisma schema yok: $schemaPath" }
Backup-File $schemaPath

$schema = Get-Content $schemaPath -Raw

# Model ekle (yoksa)
if ($schema -notmatch "model\s+BoyahaneModelRenk") {
  $schema += "`r`n`r`nmodel BoyahaneModelRenk {`r`n  id        Int      @id @default(autoincrement())`r`n  modelKodu String`r`n  renkId    Int`r`n  createdAt DateTime @default(now())`r`n`r`n  @@index([modelKodu])`r`n  @@unique([modelKodu, renkId])`r`n}`r`n"
  Set-Content -Path $schemaPath -Value $schema -Encoding UTF8
  Write-Host "OK: Prisma schema BoyahaneModelRenk eklendi."
} else {
  Write-Host "SKIP: BoyahaneModelRenk zaten var."
}

# Backend dosyaları
$mrDir = Join-Path $BACKEND "src\boyahane\model-renk"
Ensure-Dir (Join-Path $mrDir "dto")

Write-File (Join-Path $mrDir "dto\create-model-renk.dto.ts") @'
import { IsInt, IsNotEmpty, IsString, Min } from "class-validator";

export class CreateModelRenkDto {
  @IsString()
  @IsNotEmpty()
  modelKodu: string;

  @IsInt()
  @Min(1)
  renkId: number;
}
'@

Write-File (Join-Path $mrDir "model-renk.service.ts") @'
import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateModelRenkDto } from "./dto/create-model-renk.dto";

@Injectable()
export class ModelRenkService {
  constructor(private readonly prisma: PrismaService) {}

  async list(modelKodu: string) {
    if (!modelKodu?.trim()) return [];
    const mk = modelKodu.trim();

    const rows = await this.prisma.boyahaneModelRenk.findMany({
      where: { modelKodu: mk },
      orderBy: { id: "desc" },
    });

    const renkIds = rows.map((r) => r.renkId);
    const renkler = await this.prisma.boyahaneRenk.findMany({
      where: { id: { in: renkIds } },
    });

    const renkMap = new Map(renkler.map((r) => [r.id, r]));
    return rows.map((m) => ({ ...m, renk: renkMap.get(m.renkId) ?? null }));
  }

  async add(dto: CreateModelRenkDto) {
    const modelKodu = dto.modelKodu?.trim();
    if (!modelKodu) throw new BadRequestException("modelKodu zorunlu");

    const renk = await this.prisma.boyahaneRenk.findUnique({ where: { id: dto.renkId } });
    if (!renk) throw new BadRequestException("renkId bulunamadı");

    try {
      return await this.prisma.boyahaneModelRenk.create({
        data: { modelKodu, renkId: dto.renkId } as any,
      });
    } catch {
      throw new BadRequestException("Bu renk zaten bu modele ekli.");
    }
  }

  async remove(id: number) {
    return this.prisma.boyahaneModelRenk.delete({ where: { id } });
  }
}
'@

Write-File (Join-Path $mrDir "model-renk.controller.ts") @'
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query } from "@nestjs/common";
import { ModelRenkService } from "./model-renk.service";
import { CreateModelRenkDto } from "./dto/create-model-renk.dto";

@Controller("boyahane/model-renk")
export class ModelRenkController {
  constructor(private readonly service: ModelRenkService) {}

  @Get()
  list(@Query("modelKodu") modelKodu: string) {
    return this.service.list(modelKodu);
  }

  @Post()
  add(@Body() dto: CreateModelRenkDto) {
    return this.service.add(dto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
'@

Write-File (Join-Path $mrDir "model-renk.module.ts") @'
import { Module } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ModelRenkController } from "./model-renk.controller";
import { ModelRenkService } from "./model-renk.service";

@Module({
  controllers: [ModelRenkController],
  providers: [ModelRenkService, PrismaService],
})
export class ModelRenkModule {}
'@

# AppModule patch
Patch-AppModule (Join-Path $BACKEND "src\app.module.ts")
Write-Host "OK: AppModule patch tamam."

# Prisma push + generate
Push-Location $BACKEND
try {
  Write-Host "Prisma db push..."
  npx prisma db push --schema prisma\schema.prisma
  Write-Host "Prisma generate..."
  npx prisma generate
} finally {
  Pop-Location
}

Write-Host "=== FRONTEND ==="
if (!(Test-Path $FRONTEND)) { throw "FRONTEND klasörü yok: $FRONTEND" }

Ensure-Dir (Join-Path $FRONTEND "src\lib")
Ensure-Dir (Join-Path $FRONTEND "src\components")

Write-File (Join-Path $FRONTEND "src\lib\api.js") @'
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3100";

async function http(method, path, body) {
  const res = await fetch(API_BASE + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || ("HTTP " + res.status));
  }
  return res.json();
}

export const BoyahaneAPI = {
  list: (params) => {
    const qs = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== "" && v !== undefined && v !== null) qs.set(k, String(v));
    });
    return http("GET", "/boyahane/renk?" + qs.toString());
  },
  create: (dto) => http("POST", "/boyahane/renk", dto),
  update: (id, dto) => http("PATCH", "/boyahane/renk/" + id, dto),
  clone: (id) => http("POST", "/boyahane/renk/" + id + "/clone"),

  // Model-Renk
  modelRenkList: (modelKodu) =>
    http("GET", "/boyahane/model-renk?modelKodu=" + encodeURIComponent(modelKodu || "")),
  modelRenkAdd: (modelKodu, renkId) =>
    http("POST", "/boyahane/model-renk", { modelKodu, renkId }),
  modelRenkDelete: (id) =>
    http("DELETE", "/boyahane/model-renk/" + id),
};
'@

Write-File (Join-Path $FRONTEND "src\components\RenkKart.jsx") @'
export default function RenkKart({
  item,
  onEdit,
  onClone,
  onToggle,
  onQuickHexOpen,
  onAddToModel,
}) {
  const hex = item.hexRenk || item.viewHex || "#888888";
  const isAktif = !!item.aktif;

  const badge = item.isImalat
    ? { text: "İmalat", cls: "bg-blue-100 text-blue-800 border-blue-300" }
    : item.isNumune
    ? { text: "Numune", cls: "bg-yellow-100 text-yellow-800 border-yellow-300" }
    : null;

  const tipLabel = item.tip === "MUSTERI" ? "Müşteri" : "Pantone";

  return (
    <div
      className={[
        "border rounded-2xl p-3 bg-white shadow-sm transition relative",
        "hover:shadow-md hover:-translate-y-0.5",
        isAktif ? "opacity-100" : "opacity-60 bg-gray-50",
      ].join(" ")}
    >
      {badge ? (
        <span
          className={[
            "absolute top-2 right-2 text-[11px] px-2 py-0.5 rounded-full border",
            badge.cls,
          ].join(" ")}
        >
          {badge.text}
        </span>
      ) : null}

      <button className="w-full text-left" onClick={() => onEdit(item)} title="Düzenle">
        <div
          className={[
            "w-full aspect-square rounded-xl border-2 border-black",
            "transition-transform hover:scale-[1.02]",
            !isAktif ? "grayscale" : "",
          ].join(" ")}
          style={{ background: hex }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onQuickHexOpen?.(item);
          }}
          role="button"
          aria-label="Renk hex hızlı düzenle"
        />

        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="text-sm font-bold truncate">{item.kod}</div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2 py-0.5 rounded-full border bg-gray-50">{tipLabel}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full border">{isAktif ? "Aktif" : "Pasif"}</span>
          </div>
        </div>

        <div className="text-xs opacity-80 mt-0.5">{item.boyaTuru} • {item.versiyon}</div>
        {item.not ? <div className="text-xs mt-1 opacity-70 line-clamp-2">{item.not}</div> : null}
      </button>

      <div className="flex gap-2 mt-3">
        <button className="flex-1 px-2 py-2 text-xs border rounded-xl hover:bg-gray-50" onClick={() => onClone(item)}>
          Versiyonla
        </button>
        <button className="flex-1 px-2 py-2 text-xs border rounded-xl hover:bg-gray-50" onClick={() => onToggle(item)}>
          {isAktif ? "Pasif Yap" : "Aktif Yap"}
        </button>
      </div>

      <div className="mt-2">
        <button
          className="w-full px-2 py-2 text-xs border rounded-xl hover:bg-gray-50"
          onClick={() => onAddToModel?.(item)}
          title="Bu rengi seçili modele ekle"
        >
          Modele Ekle
        </button>
      </div>
    </div>
  );
}
'@

Write-File (Join-Path $FRONTEND "src\App.jsx") @'
import { useEffect, useMemo, useState } from "react";
import { BoyahaneAPI } from "./lib/api";
import RenkKart from "./components/RenkKart";

function isValidHex(v) {
  if (!v) return false;
  return /^#([0-9a-fA-F]{6})$/.test(v.trim());
}

function parsePantoneLike(p) {
  // backend renk objesinde pantone alanı "TIP:KOD" olabilir
  if (!p) return { tip: "PANTONE", kod: "" };
  const idx = String(p).indexOf(":");
  if (idx > 0) return { tip: String(p).slice(0, idx), kod: String(p).slice(idx + 1) };
  return { tip: "PANTONE", kod: String(p) };
}

export default function App() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [items, setItems] = useState([]);

  // filters
  const [aktif, setAktif] = useState("true");
  const [boyaTuru, setBoyaTuru] = useState("");
  const [tip, setTip] = useState("");
  const [q, setQ] = useState("");

  // create form
  const [newTip, setNewTip] = useState("PANTONE");
  const [newKod, setNewKod] = useState("");
  const [newVersiyon, setNewVersiyon] = useState("v1");
  const [newBoyaTuru, setNewBoyaTuru] = useState("Pigment");
  const [newHex, setNewHex] = useState("");
  const [newNot, setNewNot] = useState("");

  // edit modal
  const [editing, setEditing] = useState(null);
  const [editHex, setEditHex] = useState("");
  const [editNot, setEditNot] = useState("");

  // QUICK HEX POPUP
  const [quick, setQuick] = useState(null);
  const [quickHex, setQuickHex] = useState("");
  const [quickErr, setQuickErr] = useState("");

  // MODEL-RENK
  const [modelKodu, setModelKodu] = useState("");
  const [modelRenkler, setModelRenkler] = useState([]);
  const [modelErr, setModelErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const data = await BoyahaneAPI.list({ aktif, boyaTuru, tip, q, limit: 300 });
      // backend zaten tip/kod döndürüyor; dönmezse pantone’dan çıkar
      const fixed = (data || []).map((r) => {
        if (r.tip && r.kod) return r;
        const x = parsePantoneLike(r.pantone);
        return { ...r, tip: x.tip, kod: x.kod };
      });
      setItems(fixed);
    } catch (e) {
      setErr(e?.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function loadModelRenk() {
    setModelErr("");
    const mk = modelKodu.trim();
    if (!mk) { setModelRenkler([]); return; }
    try {
      const data = await BoyahaneAPI.modelRenkList(mk);
      setModelRenkler(data || []);
    } catch (e) {
      setModelErr(e?.message || "Model renkleri alınamadı");
    }
  }

  useEffect(() => { load(); }, []);
  useEffect(() => { loadModelRenk(); }, [modelKodu]);

  const countText = useMemo(() => `${items.length} kayıt`, [items.length]);

  async function onCreate(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await BoyahaneAPI.create({
        tip: newTip,
        kod: newKod.trim(),
        versiyon: newVersiyon.trim(),
        boyaTuru: newBoyaTuru.trim(),
        hexRenk: newHex.trim() || undefined,
        aktif: "true",
        not: newNot || undefined,
      });
      setNewKod(""); setNewHex(""); setNewNot("");
      await load();
    } catch (e) {
      setErr(e?.message || "Create failed");
    } finally {
      setLoading(false);
    }
  }

  function openEdit(item) {
    setEditing(item);
    setEditHex(item.hexRenk || "");
    setEditNot(item.not || "");
  }

  async function saveEdit() {
    if (!editing) return;
    setLoading(true);
    setErr("");
    try {
      await BoyahaneAPI.update(editing.id, {
        hexRenk: editHex.trim() || undefined,
        not: editNot || undefined,
      });
      setEditing(null);
      await load();
    } catch (e) {
      setErr(e?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  }

  async function clone(item) {
    setLoading(true);
    setErr("");
    try {
      await BoyahaneAPI.clone(item.id);
      await load();
    } catch (e) {
      setErr(e?.message || "Clone failed");
    } finally {
      setLoading(false);
    }
  }

  async function toggle(item) {
    setLoading(true);
    setErr("");
    try {
      await BoyahaneAPI.update(item.id, { aktif: item.aktif ? "false" : "true" });
      await load();
    } catch (e) {
      setErr(e?.message || "Toggle failed");
    } finally {
      setLoading(false);
    }
  }

  function openQuickHex(item) {
    setQuick(item);
    setQuickHex(item.hexRenk || item.viewHex || "");
    setQuickErr("");
  }

  async function saveQuickHex() {
    if (!quick) return;
    const v = (quickHex || "").trim();
    if (!isValidHex(v)) {
      setQuickErr("Hex formatı: #RRGGBB olmalı");
      return;
    }

    setLoading(true);
    setQuickErr("");
    try {
      await BoyahaneAPI.update(quick.id, { hexRenk: v });
      setQuick(null);
      await load();
      await loadModelRenk();
    } catch (e) {
      setQuickErr(e?.message || "Kaydetme hatası");
    } finally {
      setLoading(false);
    }
  }

  async function addToModel(item) {
    const mk = modelKodu.trim();
    if (!mk) { setModelErr("Önce model kodu gir"); return; }
    try {
      await BoyahaneAPI.modelRenkAdd(mk, item.id);
      await loadModelRenk();
    } catch (e) {
      setModelErr(e?.message || "Modele eklenemedi");
    }
  }

  async function removeModelRenk(mapId) {
    try {
      await BoyahaneAPI.modelRenkDelete(mapId);
      await loadModelRenk();
    } catch (e) {
      setModelErr(e?.message || "Silinemedi");
    }
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Boyahane • Renk Havuzu</h1>
        <button className="px-3 py-2 border rounded-lg" onClick={load} disabled={loading}>Yenile</button>
      </div>

      {err ? <div className="mt-3 p-3 border rounded-lg bg-red-50 text-sm">{err}</div> : null}

      {/* MODEL - RENK */}
      <div className="mt-3 border rounded-2xl p-3 bg-white">
        <div className="font-semibold mb-2">Model – Renk Bağlama</div>

        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          <input
            className="border rounded-xl p-2 flex-1"
            value={modelKodu}
            onChange={(e) => setModelKodu(e.target.value)}
            placeholder="Model kodu yaz (örn: M-1020)"
          />
          <button className="px-3 py-2 border rounded-xl" onClick={loadModelRenk}>
            Listele
          </button>
        </div>

        {modelErr ? <div className="text-xs text-red-600 mt-2">{modelErr}</div> : null}

        <div className="mt-3 flex flex-wrap gap-2">
          {modelRenkler.map((mr) => {
            const r = mr.renk || {};
            const p = parsePantoneLike(r.pantone);
            const viewHex = r.hexRenk || r.viewHex || "#888";
            return (
              <div key={mr.id} className="border rounded-xl px-2 py-1 text-xs flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-black rounded" style={{ background: viewHex }} />
                <span className="font-semibold">{p.kod || (r.pantone || "RENK?")}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full border bg-gray-50">{p.tip === "MUSTERI" ? "Müşteri" : "Pantone"}</span>
                <button className="ml-1 px-2 py-0.5 border rounded-lg" onClick={() => removeModelRenk(mr.id)}>
                  Sil
                </button>
              </div>
            );
          })}
          {!modelKodu.trim() ? <div className="text-xs opacity-70">Model kodu girince burada renkler görünür.</div> : null}
          {modelKodu.trim() && modelRenkler.length === 0 ? <div className="text-xs opacity-70">Bu modele renk eklenmemiş.</div> : null}
        </div>

        <div className="text-xs opacity-70 mt-2">
          Modele renk eklemek için aşağıdaki kartlarda <b>Modele Ekle</b> butonunu kullan.
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="border rounded-2xl p-3 bg-white">
          <div className="font-semibold mb-2">Filtre</div>

          <label className="text-xs">Aktif</label>
          <select className="w-full border rounded-xl p-2 mb-2" value={aktif} onChange={(e) => setAktif(e.target.value)}>
            <option value="">Hepsi</option>
            <option value="true">Aktif</option>
            <option value="false">Pasif</option>
          </select>

          <label className="text-xs">Tip</label>
          <select className="w-full border rounded-xl p-2 mb-2" value={tip} onChange={(e) => setTip(e.target.value)}>
            <option value="">Hepsi</option>
            <option value="PANTONE">Pantone</option>
            <option value="MUSTERI">Müşteri</option>
          </select>

          <label className="text-xs">Boya Türü</label>
          <input className="w-full border rounded-xl p-2 mb-2" value={boyaTuru} onChange={(e) => setBoyaTuru(e.target.value)} placeholder="Pigment / Su Bazlı..." />

          <label className="text-xs">Arama</label>
          <input className="w-full border rounded-xl p-2" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Kod / not / versiyon..." />

          <button className="w-full mt-3 px-3 py-2 border rounded-xl" onClick={load} disabled={loading}>Filtrele</button>
        </div>

        <div className="md:col-span-3 border rounded-2xl p-3 bg-white">
          <div className="font-semibold mb-2">Yeni Renk Ekle</div>

          <form onSubmit={onCreate} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
            <div>
              <label className="text-xs">Tip</label>
              <select className="w-full border rounded-xl p-2" value={newTip} onChange={(e) => setNewTip(e.target.value)}>
                <option value="PANTONE">Pantone</option>
                <option value="MUSTERI">Müşteri</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs">Kod</label>
              <input className="w-full border rounded-xl p-2" value={newKod} onChange={(e) => setNewKod(e.target.value)} placeholder="18-1663 / KUMAS-2045" />
            </div>

            <div>
              <label className="text-xs">Versiyon</label>
              <input className="w-full border rounded-xl p-2" value={newVersiyon} onChange={(e) => setNewVersiyon(e.target.value)} />
            </div>

            <div>
              <label className="text-xs">Boya Türü</label>
              <input className="w-full border rounded-xl p-2" value={newBoyaTuru} onChange={(e) => setNewBoyaTuru(e.target.value)} />
            </div>

            <div>
              <label className="text-xs">Hex (ops.)</label>
              <input className="w-full border rounded-xl p-2" value={newHex} onChange={(e) => setNewHex(e.target.value)} placeholder="#RRGGBB" />
            </div>

            <div className="md:col-span-6">
              <label className="text-xs">Not</label>
              <input className="w-full border rounded-xl p-2" value={newNot} onChange={(e) => setNewNot(e.target.value)} placeholder="opsiyonel not" />
            </div>

            <div className="md:col-span-6">
              <button className="px-4 py-2 border rounded-xl" disabled={loading}>Ekle</button>
            </div>
          </form>

          <div className="mt-4 flex items-center justify-between">
            <div className="font-semibold">Renkler</div>
            <div className="text-xs opacity-70">{loading ? "Yükleniyor..." : countText}</div>
          </div>

          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {items.map((it) => (
              <RenkKart
                key={it.id}
                item={it}
                onEdit={openEdit}
                onClone={clone}
                onToggle={toggle}
                onQuickHexOpen={openQuickHex}
                onAddToModel={addToModel}
              />
            ))}
          </div>
        </div>
      </div>

      {/* QUICK HEX POPUP */}
      {quick ? (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4" onClick={() => setQuick(null)}>
          <div className="bg-white rounded-2xl p-4 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="font-bold">
              Hızlı Renk: {quick.kod} • {quick.boyaTuru} • {quick.versiyon}
            </div>

            <div className="mt-3 flex items-center gap-3">
              <div className="w-16 h-16 border-2 border-black rounded-xl" style={{ background: quickHex || quick.viewHex }} />
              <div className="flex-1">
                <label className="text-xs">Hex</label>
                <input className="w-full border rounded-xl p-2" value={quickHex} onChange={(e) => setQuickHex(e.target.value)} placeholder="#RRGGBB" />
                {quickErr ? <div className="text-xs text-red-600 mt-1">{quickErr}</div> : null}
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button className="flex-1 px-3 py-2 border rounded-xl hover:bg-gray-50" onClick={saveQuickHex} disabled={loading}>
                Kaydet
              </button>
              <button className="flex-1 px-3 py-2 border rounded-xl hover:bg-gray-50" onClick={() => setQuick(null)}>
                İptal
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Edit Modal */}
      {editing ? (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl p-4 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="font-bold">
              Düzenle: {editing.kod} • {editing.boyaTuru} • {editing.versiyon}
            </div>

            <div className="mt-3">
              <label className="text-xs">Hex</label>
              <input className="w-full border rounded-xl p-2" value={editHex} onChange={(e) => setEditHex(e.target.value)} placeholder="#RRGGBB" />
              <div className="mt-2 w-16 h-16 border-2 border-black rounded-xl" style={{ background: editHex || editing.viewHex }} />
            </div>

            <div className="mt-3">
              <label className="text-xs">Not</label>
              <input className="w-full border rounded-xl p-2" value={editNot} onChange={(e) => setEditNot(e.target.value)} />
            </div>

            <div className="flex gap-2 mt-4">
              <button className="px-3 py-2 border rounded-xl hover:bg-gray-50" onClick={saveEdit} disabled={loading}>
                Kaydet
              </button>
              <button className="px-3 py-2 border rounded-xl hover:bg-gray-50" onClick={() => setEditing(null)}>
                Kapat
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
'@

Write-Host ""
Write-Host "========================="
Write-Host "TEK DOSYA KURULUM TAMAM ✅"
Write-Host "========================="
Write-Host "Backend baslat:"
Write-Host "  cd $BACKEND"
Write-Host "  npm run start:dev"
Write-Host ""
Write-Host "Frontend baslat:"
Write-Host "  cd $FRONTEND"
Write-Host "  npm run dev"
Write-Host "========================="
