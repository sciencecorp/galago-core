# =============================================================================
# Registers two "at logon" scheduled tasks so Galago starts when the lab user
# logs in (pair with auto-login for true start-on-boot — see deploy/README.md).
#
#   1. "Galago Tools" -> deploy\start-galago-tools.cmd  (native 32-bit Python)
#   2. "Galago Web"   -> deploy\start-galago-web.ps1     (docker compose up)
#
# Both run in the INTERACTIVE session (LogonType Interactive) at Highest run
# level. Interactive is required: Docker Desktop needs a user session, and the
# hardware drivers need a desktop session (COM / pywin32 / vendor DLLs).
#
# Run this ONCE from an elevated PowerShell:
#     powershell -ExecutionPolicy Bypass -File deploy\register-startup-tasks.ps1
# =============================================================================
$ErrorActionPreference = 'Stop'

$deployDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$toolsCmd  = Join-Path $deployDir 'start-galago-tools.cmd'
$webPs1    = Join-Path $deployDir 'start-galago-web.ps1'
$user      = "$env:USERDOMAIN\$env:USERNAME"

$commonSettings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1) `
    -ExecutionTimeLimit ([TimeSpan]::Zero) `
    -MultipleInstances IgnoreNew

$principal = New-ScheduledTaskPrincipal -UserId $user -LogonType Interactive -RunLevel Highest
$trigger   = New-ScheduledTaskTrigger -AtLogOn -User $user

# --- Galago Tools (native 32-bit Python) ---
$toolsAction = New-ScheduledTaskAction -Execute 'cmd.exe' -Argument "/c `"$toolsCmd`""
Register-ScheduledTask -TaskName 'Galago Tools' -Action $toolsAction -Trigger $trigger `
    -Principal $principal -Settings $commonSettings -Force | Out-Null
Write-Host "Registered scheduled task: Galago Tools"

# --- Galago Web (docker compose) ---
$webAction = New-ScheduledTaskAction -Execute 'powershell.exe' `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$webPs1`""
Register-ScheduledTask -TaskName 'Galago Web' -Action $webAction -Trigger $trigger `
    -Principal $principal -Settings $commonSettings -Force | Out-Null
Write-Host "Registered scheduled task: Galago Web"

Write-Host ""
Write-Host "Done. Verify with:  Get-ScheduledTask 'Galago *'"
Write-Host "Test now with:      Start-ScheduledTask -TaskName 'Galago Tools'"
