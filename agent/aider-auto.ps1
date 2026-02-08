$ErrorActionPreference="Continue"
[Console]::OutputEncoding=[System.Text.Encoding]::UTF8
$OutputEncoding=[System.Text.Encoding]::UTF8

$AIDER="C:\Users\Çetin\AppData\Local\Programs\Python\Python311\Scripts\aider.exe"
$LOG="C:\ERP\agent\logs\aider-autonomous.log"
$ts=Get-Date -Format "yyyy-MM-dd HH:mm:ss"
"$ts | AIDER AUTONOMOUS START" | Add-Content $LOG -Encoding UTF8

# FRONTEND PASS
cd C:\ERP\erp-frontend
& $AIDER --yes --auto-commits --git --model ollama/qwen2.5-coder:14b `
  --message "autonomous: frontend pass" `
  src/pages src/api src/components src/lib src/App.jsx src/main.jsx `
  2>&1 | Out-String | Add-Content $LOG -Encoding UTF8

# BACKEND PASS
cd C:\ERP\erp-backend
& $AIDER --yes --auto-commits --git --model ollama/qwen2.5-coder:14b `
  --message "autonomous: backend pass" `
  src prisma\schema.prisma `
  2>&1 | Out-String | Add-Content $LOG -Encoding UTF8

"$ts | AIDER AUTONOMOUS END" | Add-Content $LOG -Encoding UTF8
