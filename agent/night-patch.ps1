$ErrorActionPreference="Stop"
[Console]::OutputEncoding=[System.Text.Encoding]::UTF8
$OutputEncoding=[System.Text.Encoding]::UTF8

$ROOT="C:\ERP"
$BACK="$ROOT\erp-backend"
$AG="$ROOT\agent"
$REP="$AG\reports"
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$report = Join-Path $REP "night_patch_$stamp.txt"

function R([string]$s){ $s | Add-Content -Encoding UTF8 $report; Write-Host $s }
function Backup([string]$p){
  if(Test-Path $p){
    $b = "$p.bak_$stamp"
    Copy-Item $p $b -Force
    R "BACKUP: $b"
  }
}

R "=== NIGHT PATCH START $stamp ==="
R "BACK: $BACK"
Set-Location $BACK

# 1) Prisma schema patch: kalip_yerlesim_desen -> isEmriId + relation, is_emri -> opposite relation
$schema = "prisma\schema.prisma"
if(!(Test-Path $schema)){ throw "schema yok: $schema" }
Backup $schema
$txt = Get-Content $schema -Raw -Encoding UTF8

# 1.a) kalip_yerlesim_desen içine isEmriId + relation ekle (yoksa)
if($txt -notmatch "model\s+kalip_yerlesim_desen\s*\{"){
  throw "kalip_yerlesim_desen modeli bulunamadı"
}

if($txt -notmatch "isEmriId\s+Int\?"){
  # model blok içinde modelId satırından sonra eklemeyi dener
  $txt = [regex]::Replace(
    $txt,
    "(model\s+kalip_yerlesim_desen\s*\{[\s\S]*?\bmodelId\s+Int\s*\r?\n)",
    "`$1  isEmriId Int?`r`n",
    "Singleline"
  )
  R "PRISMA: kalip_yerlesim_desen -> isEmriId eklendi"
} else {
  R "PRISMA: isEmriId zaten var"
}

if($txt -notmatch "is_emri\?\s+@relation\(fields:\s*\[isEmriId\]"){
  # relation satırını model relationlarının yanına ekle
  $txt = [regex]::Replace(
    $txt,
    "(model\s+kalip_yerlesim_desen\s*\{[\s\S]*?\bmodel\s+model_karti[\s\S]*?\r?\n)",
    "`$1  is_emri  is_emri?   @relation(fields: [isEmriId], references: [id])`r`n",
    "Singleline"
  )
  R "PRISMA: kalip_yerlesim_desen -> is_emri relation eklendi"
} else {
  R "PRISMA: relation zaten var"
}

# 1.b) is_emri modeline opposite relation ekle (yoksa)
if($txt -notmatch "model\s+is_emri\s*\{"){
  throw "is_emri modeli bulunamadı"
}
if($txt -notmatch "kalip_yerlesim_desen\s+kalip_yerlesim_desen\[\]"){
  $txt = [regex]::Replace(
    $txt,
    "(model\s+is_emri\s*\{[\s\S]*?\bsevkiyat\s+sevkiyat\[\]\s*\r?\n)",
    "`$0`r`n  kalip_yerlesim_desen kalip_yerlesim_desen[]`r`n",
    "Singleline"
  )
  R "PRISMA: is_emri -> kalip_yerlesim_desen[] eklendi"
} else {
  R "PRISMA: is_emri opposite relation zaten var"
}

Set-Content -Encoding UTF8 $schema $txt

# 2) Prisma: format + validate + db push (prompt yok) + generate
R "PRISMA: format"
npx prisma format --schema $schema | Out-String | Add-Content -Encoding UTF8 $report

R "PRISMA: validate"
npx prisma validate --schema $schema | Out-String | Add-Content -Encoding UTF8 $report

R "PRISMA: db push (accept data loss, no prompt)"
npx prisma db push --schema $schema --accept-data-loss | Out-String | Add-Content -Encoding UTF8 $report

R "PRISMA: generate"
npx prisma generate --schema $schema | Out-String | Add-Content -Encoding UTF8 $report

# 3) Agent restart (servisleri tazele)
R "AGENT: restart"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File C:\ERP\agent\agent.ps1 restart 2>&1 | Out-String | Add-Content -Encoding UTF8 $report

R "=== NIGHT PATCH END ==="
