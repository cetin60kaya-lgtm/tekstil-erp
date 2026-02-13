$ErrorActionPreference="SilentlyContinue"
function PortOpen($p){
  try { return (Test-NetConnection 127.0.0.1 -Port $p -WarningAction SilentlyContinue).TcpTestSucceeded } catch { return $false }
}
$ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$ok3100 = PortOpen 3100
$ok5173 = PortOpen 5173

if(-not $ok3100 -or -not $ok5173){
  "$ts | WATCHDOG restart (3100=$ok3100 5173=$ok5173)" | Add-Content "C:\ERP\agent\logs\watchdog.log" -Encoding UTF8
  & agent restart | Out-String | Add-Content "C:\ERP\agent\logs\watchdog.log" -Encoding UTF8
}else{
  "$ts | WATCHDOG ok (3100=$ok3100 5173=$ok5173)" | Add-Content "C:\ERP\agent\logs\watchdog.log" -Encoding UTF8
}
