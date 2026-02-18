$root = "C:\ERP\erp-frontend"
$out  = Join-Path $root "docs\_STATUS_BUNDLE.txt"

$impl = Join-Path $root "docs\IMPLEMENTATION_LOG.md"
$arch = Join-Path $root "docs\ARCHITECT_NOTES.md"

"=== ARCHITECT_NOTES.md ===" | Out-File -FilePath $out -Encoding utf8
if (Test-Path $arch) { Get-Content $arch -Raw | Out-File $out -Append -Encoding utf8 }

"`n=== IMPLEMENTATION_LOG.md ===" | Out-File $out -Append -Encoding utf8
if (Test-Path $impl) { Get-Content $impl -Raw | Out-File $out -Append -Encoding utf8 }

"`n=== GIT STATUS ===" | Out-File $out -Append -Encoding utf8
Push-Location $root
try {
  git status --porcelain | Out-File $out -Append -Encoding utf8
  "`n=== LAST 10 COMMITS ===" | Out-File $out -Append -Encoding utf8
  git --no-pager log -10 --oneline | Out-File $out -Append -Encoding utf8
} catch {
  "`nGit bulunamadı veya repo değil." | Out-File $out -Append -Encoding utf8
}
Pop-Location

Write-Host "OK -> $out"
