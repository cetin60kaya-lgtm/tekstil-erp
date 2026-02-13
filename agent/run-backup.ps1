$log="C:\ERP\agent\logs\backup-loop.log"
$agentPs1="C:\ERP\agent\agent.ps1"
$ts=Get-Date -Format "yyyy-MM-dd HH:mm:ss"
"$ts | BACKUP START" | Add-Content $log -Encoding UTF8
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $agentPs1 backup 2>&1 | Out-String | Add-Content $log -Encoding UTF8
"$ts | BACKUP END" | Add-Content $log -Encoding UTF8
