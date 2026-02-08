$log="C:\ERP\agent\logs\health-loop.log"
$agentPs1="C:\ERP\agent\agent.ps1"
$ts=Get-Date -Format "yyyy-MM-dd HH:mm:ss"
"$ts | HEALTH START" | Add-Content $log -Encoding UTF8
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $agentPs1 health 2>&1 | Out-String | Add-Content $log -Encoding UTF8
