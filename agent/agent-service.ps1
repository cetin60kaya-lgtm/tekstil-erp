$ErrorActionPreference = "Continue"
$log = "C:\ERP\agent\logs\service.log"
$agentPs1 = "C:\ERP\agent\agent.ps1"
$intervalSec = 45

function LogLine([string]$s){
  $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  "$ts | $s" | Add-Content $log -Encoding UTF8
}

function Run-Agent([string]$subcommand){
  LogLine "RUN agent $subcommand"
  $out = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $agentPs1 $subcommand 2>&1
  $out | Out-String | Add-Content $log -Encoding UTF8
}

LogLine "SERVICE START (SERIAL MODE)"

while($true){
  try{
    $status = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $agentPs1 status 2>&1 | Out-String
    $status | Add-Content $log -Encoding UTF8

    if($status -notmatch "backend=True" -or $status -notmatch "frontend=True"){
      Run-Agent "restart"
    } else {
      LogLine "OK"
    }
  } catch {
    LogLine ("ERROR: " + $_.Exception.Message)
  }
  Start-Sleep -Seconds $intervalSec
}
