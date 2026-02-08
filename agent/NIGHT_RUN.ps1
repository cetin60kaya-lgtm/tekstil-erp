$ErrorActionPreference="Continue"
[Console]::InputEncoding  = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$LOG  = "C:\ERP\agent\logs\night-run.log"
$AIDER= "C:\Users\Çetin\AppData\Local\Programs\Python\Python311\Scripts\aider.exe"
$AGENT= "C:\ERP\agent\agent.ps1"

function LogLine([string]$s){
  $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  "$ts | $s" | Add-Content $LOG -Encoding UTF8
}

LogLine "NIGHT RUN START"

# servisleri bir kez kaldır
try { & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $AGENT restart 2>&1 | Out-String | Add-Content $LOG -Encoding UTF8 } catch {}

while($true){
  try {
    # ayakta mı?
    $st = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $AGENT status 2>&1 | Out-String
    $st | Add-Content $LOG -Encoding UTF8

    if($st -notmatch "backend=True" -or $st -notmatch "frontend=True"){
      LogLine "Agent restart (service down detected)"
      & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $AGENT restart 2>&1 | Out-String | Add-Content $LOG -Encoding UTF8
    } else {
      LogLine "OK services up"
    }

    # AIDER PASS
    LogLine "AIDER START"
    cd C:\ERP\erp-frontend
    & $AIDER --yes --auto-commits --git --model ollama/qwen2.5-coder:14b `
      --message "autonomous: frontend pass" `
      src/pages src/api src/components src/lib src/App.jsx src/main.jsx `
      2>&1 | Out-String | Add-Content $LOG -Encoding UTF8

    cd C:\ERP\erp-backend
    & $AIDER --yes --auto-commits --git --model ollama/qwen2.5-coder:14b `
      --message "autonomous: backend pass" `
      src prisma\schema.prisma `
      2>&1 | Out-String | Add-Content $LOG -Encoding UTF8

    LogLine "AIDER END"
  } catch {
    LogLine ("ERROR: " + $_.Exception.Message)
  }

  # 20 dk bekle
  Start-Sleep -Seconds 1200
}
