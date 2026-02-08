$ErrorActionPreference = "Stop"

$ROOT="C:\ERP\agent"
$JOBS=Join-Path $ROOT "jobs"
$OUT =Join-Path $ROOT "out"
$LOG =Join-Path $ROOT "service.log"

if(!(Test-Path $JOBS)){ New-Item -ItemType Directory -Force -Path $JOBS | Out-Null }
if(!(Test-Path $OUT )){ New-Item -ItemType Directory -Force -Path $OUT  | Out-Null }

function log($m){
  $t = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  "$t | $m" | Out-File -Append -Encoding UTF8 $LOG
}

function IsPortOpen($port){
  return @(Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue).Count -gt 0
}

$LASTJOBFILE = Join-Path $OUT "last_jobfile.txt"
$LASTJOBJSON = Join-Path $OUT "last_job.json"
$LASTRESULT  = Join-Path $OUT "last_result.txt"
$LASTERROR   = Join-Path $OUT "last_error.txt"

log "SERVICE STARTED"

while ($true) {
  try {
    $jobFiles = Get-ChildItem $JOBS -Filter "*.job.json" -ErrorAction SilentlyContinue
    foreach($jf in $jobFiles){
      $jobFile = $jf.FullName
      $workDir = "C:\ERP"

      try {
        $jobFile | Out-File $LASTJOBFILE -Encoding UTF8
        log "JOB FOUND: $jobFile"

        $raw = Get-Content $jobFile -Raw -ErrorAction Stop
        $job = $raw | ConvertFrom-Json -ErrorAction Stop

        if($null -eq $job.commands -or $job.commands.Count -eq 0){
          throw "Job içinde commands yok veya boş."
        }

        foreach($cmd in $job.commands){

          # cd komutunu gerçek working dir olarak uygula
          if($cmd -match '^\s*cd\s+') {
            $p = ($cmd -replace '^\s*cd\s+', '').Trim().Trim('"')
            if(!(Test-Path $p)){ throw "cd hedefi yok: $p" }
            $workDir = $p
            log "CWD => $workDir"
            continue
          }

          # Port guard
          if ($cmd -match "npm run start:dev" -and (IsPortOpen 3100)) {
            log "SKIP backend start (3100 already in use)"
            continue
          }
          if ($cmd -match "npm run dev" -and (IsPortOpen 5173)) {
            log "SKIP frontend start (5173 already in use)"
            continue
          }

          log "RUN ($workDir): $cmd"

          $pinfo = New-Object System.Diagnostics.ProcessStartInfo
          $pinfo.FileName = "powershell.exe"
          $pinfo.Arguments = "-NoProfile -ExecutionPolicy Bypass -Command `"$cmd`""
          $pinfo.WorkingDirectory = $workDir
          $pinfo.RedirectStandardOutput = $true
          $pinfo.RedirectStandardError  = $true
          $pinfo.UseShellExecute = $false
          $pinfo.CreateNoWindow = $true

          $p = New-Object System.Diagnostics.Process
          $p.StartInfo = $pinfo
          [void]$p.Start()

          $stdout = $p.StandardOutput.ReadToEnd()
          $stderr = $p.StandardError.ReadToEnd()
          $p.WaitForExit()

          if($stdout){ $stdout | Out-File -Append -Encoding UTF8 $LOG }
          if($stderr){ $stderr | Out-File -Append -Encoding UTF8 $LOG }

          if($p.ExitCode -ne 0){
            # cleanup gibi komutlarda exitcode hata sayılmasın
            if($cmd -match '^\s*Remove-Item\b'){
              log "WARN: ignoring exitCode=$($p.ExitCode) for Remove-Item"
            } else {
              throw "Komut exitCode=$($p.ExitCode): $cmd"
            }
          }
        }

        $job | ConvertTo-Json -Depth 10 | Out-File $LASTJOBJSON -Encoding UTF8
        "OK $(Get-Date -Format s)" | Out-File $LASTRESULT -Encoding UTF8

        Remove-Item $jobFile -Force
        log "JOB DONE"

      } catch {
        ("JOBFILE: " + $jobFile) | Out-File $LASTERROR -Encoding UTF8
        ("WHEN: " + (Get-Date -Format s)) | Add-Content $LASTERROR -Encoding UTF8
        ("MESSAGE: " + $_.Exception.Message) | Add-Content $LASTERROR -Encoding UTF8
        "" | Add-Content $LASTERROR -Encoding UTF8
        ($_ | Out-String) | Add-Content $LASTERROR -Encoding UTF8

        log "JOB ERROR (kept file): $jobFile"
        # hata varsa job dosyası kalsın
      }
    }
  } catch {
    log ("SERVICE LOOP ERROR: " + $_.Exception.Message)
  }

  Start-Sleep -Seconds 3
}
