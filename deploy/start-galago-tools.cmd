@echo off
REM ============================================================================
REM Galago Tools supervisor
REM ----------------------------------------------------------------------------
REM Runs the Galago Tools Manager (tools/web_server.py) inside the 32-bit
REM micromamba env and restarts it automatically if it ever exits/crashes.
REM Output is appended to %USERPROFILE%\galago-tools.log.
REM
REM These tools talk to real hardware via pywin32/comtypes/serial/vendor DLLs,
REM so this MUST run in an interactive desktop session (a logged-in user), NOT
REM as a Session-0 service. It is launched by the "Galago Tools" scheduled task
REM (see register-startup-tasks.ps1) which is configured "run only when logged on".
REM
REM Paths below are specific to this machine. Adjust if the layout changes.
REM ============================================================================
setlocal enabledelayedexpansion

set "MAMBA_EXE=C:\Users\Bioteam\AppData\Local\micromamba\micromamba.exe"
REM Root that CONTAINS the galago-tools-32bit2 env (env path resolved via -p below
REM because -n depends on a shell-specific MAMBA_ROOT_PREFIX).
set "MAMBA_ROOT_PREFIX=C:\Users\Bioteam\.local\share\mamba"
set "TOOLS_ENV=C:\Users\Bioteam\.local\share\mamba\envs\galago-tools-32bit2"
set "TOOLS_REPO=C:\Users\Bioteam\Desktop\galago-tools"
set "LOG=%USERPROFILE%\galago-tools.log"
REM Production galago-core runs on host port 3011 (see docker-compose.yml). The
REM Manager calls this REST API to learn which instrument tools to launch, so it
REM MUST match the prod port (the old default is 3010 = the dev stack).
set "GALAGO_API_URL=http://localhost:3011/api"

cd /d "%TOOLS_REPO%"

REM `galago` is the designated entry point (== tools.web_server.main). It's an
REM editable install in this env pointing at TOOLS_REPO, so it runs your branch
REM code. The manager chdir's to its own package dir, so launch cwd is irrelevant.
:loop
REM --- Wait for galago-core to be healthy BEFORE launching the Manager. ---
REM At logon Docker Desktop needs ~30-60s to start the engine and bring the
REM container up, but this task fires immediately. If the Manager starts while
REM the API is still down it finds no workcell and launches ZERO instrument
REM tools -- then runs happily forever (it does NOT crash), so the restart loop
REM below never kicks in. So poll /api/health until it answers, no matter how
REM long that takes. This also re-gates after a crash if core is restarting.
set /a _try=0
:waitcore
curl -fsS --noproxy localhost -o nul --max-time 5 "%GALAGO_API_URL%/health" && goto corehealthy
set /a _try+=1
set /a _beat=_try %% 6
if "!_beat!"=="1" echo [%date% %time%] waiting for galago-core at %GALAGO_API_URL%/health (attempt !_try!)...>> "%LOG%"
timeout /t 5 /nobreak >nul
goto waitcore

:corehealthy
echo [%date% %time%] galago-core healthy; starting Galago Tools Manager (32-bit env)>> "%LOG%"
"%MAMBA_EXE%" run -p "%TOOLS_ENV%" galago --api-url "%GALAGO_API_URL%" >> "%LOG%" 2>&1
echo [%date% %time%] tools manager exited (code %errorlevel%); restarting in 5s>> "%LOG%"
timeout /t 5 /nobreak >nul
goto loop
