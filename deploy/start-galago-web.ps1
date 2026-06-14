# =============================================================================
# Galago Web (galago-core) bring-up
# -----------------------------------------------------------------------------
# Waits for the Docker engine to be ready (Docker Desktop takes ~30-60s after
# login) and then ensures the production stack is up. With `restart: always`
# the container also self-starts when the engine comes up; this task is the
# belt-and-suspenders guarantee that recreates it if it was removed.
#
# It does NOT --build. Build the local image once, manually, when you pull new
# code:   docker compose up -d --build
# =============================================================================
$ErrorActionPreference = 'SilentlyContinue'

$repo = 'C:\Users\Bioteam\Desktop\galago-core'
$log  = Join-Path $env:USERPROFILE 'galago-web.log'

"[{0}] waiting for docker engine..." -f (Get-Date) | Out-File -Append -Encoding utf8 $log
for ($i = 0; $i -lt 60; $i++) {
    docker info *> $null
    if ($LASTEXITCODE -eq 0) { break }
    Start-Sleep -Seconds 5
}

Set-Location $repo
"[{0}] docker compose up -d" -f (Get-Date) | Out-File -Append -Encoding utf8 $log
docker compose -f docker-compose.yml up -d *>> $log
"[{0}] done (exit $LASTEXITCODE)" -f (Get-Date) | Out-File -Append -Encoding utf8 $log
