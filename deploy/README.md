# Galago production deployment on Windows

This folder turns the two-VS-Code-windows dev workflow into a production setup
that starts automatically when the lab user logs in.

## Architecture (why it's split)

| Piece | Runs as | Started by |
|---|---|---|
| **galago-core** (web app) | Docker Desktop container, port 3010 | Docker `restart: always` + the *Galago Web* task |
| **galago-tools** (`web_server.py` + per-tool gRPC servers) | **Native** 32-bit Python (needs pywin32/comtypes/serial/vendor DLLs) | the *Galago Tools* task |

The container reaches the native tool servers on the Windows host via
`host.docker.internal` (set as `GRPC_HOST` in `docker-compose.yml`).

Prod is fully isolated from dev: project name `galago-prod`, web on **port 3011**
(dev stays on 3010), and its own named volume `galago_prod_data` for the database.
The two stacks can run at the same time.

> **The hard constraint:** Docker Desktop and the hardware drivers both require an
> **interactive, logged-in user session**. Neither can run as a boot-time Windows
> service. So "start on boot" = **auto-login → start on logon**.

---

## One-time setup

### 1. galago-core (the web app)

You're on the `clariostar-and-lcus1` feature branch, so build the image locally
(the published `ghcr.io` image does **not** contain your branch).

```powershell
cd C:\Users\Bioteam\Desktop\galago-core
# uncomment the `build:` block in docker-compose.yml first, then:
docker compose up -d --build
```

- The database lives in a dedicated named volume `galago_prod_data`, separate from
  dev. It starts empty — bring config over by exporting the workcell JSON from dev
  and re-importing it into prod.
- Optional Secrets encryption: create `C:\Users\Bioteam\Desktop\galago-core\.env`
  with `GALAGO_SECRETS_KEY=<64 hex chars>` (`openssl rand -hex 32`).
- Set Docker Desktop → Settings → General → **"Start Docker Desktop when you log in"**.

App is at **http://localhost:3011** (dev remains on 3010).

### 2. galago-tools (the hardware side)

The `start-galago-tools.cmd` supervisor runs the `galago` command (the designated
entry point — it's an editable install pointing at your branch) in the 32-bit env
and auto-restarts it on crash. **Validate it once before wiring to logon:**

```powershell
# Stop any tools manager you have running in git-bash first (avoid port clashes),
# then:
C:\Users\Bioteam\Desktop\galago-core\deploy\start-galago-tools.cmd
```

Watch `%USERPROFILE%\galago-tools.log` and confirm the manager + tool servers come
up. (Known risk: `import win32api` shows a DLL error when the env is launched
outside your git-bash; the Manager itself doesn't need it at startup, but verify
the specific tools you use — CLARIOstar etc. — actually connect.)

> **Order matters — handled automatically.** The Manager calls galago-core's REST
> API to learn which tools to launch, and at logon Docker takes ~30-60s to bring
> the container up. If the Manager starts first it finds the API down, logs
> `No instrument tools will be launched`, and then *runs forever with zero tools*
> (it does not crash, so the supervisor never restarts it). To prevent this the
> supervisor polls `http://localhost:3011/api/health` and waits — indefinitely —
> until galago-core answers before launching the Manager. The launcher passes
> `--api-url http://localhost:3011/api` so the Manager targets prod (not the dev
> stack on 3010).
>
> One thing the health gate can't fix: galago-core can be healthy but its DB empty.
> The workcell config must be imported into the **prod** volume (`galago_prod_data`)
> or you'll still get `No instrument tools will be launched`.

### 3. Auto-start on logon

```powershell
# elevated PowerShell:
powershell -ExecutionPolicy Bypass -File C:\Users\Bioteam\Desktop\galago-core\deploy\register-startup-tasks.ps1
```

This registers two "at logon", interactive, highest-privilege tasks: **Galago Tools**
and **Galago Web**.

### 4. (Optional) true start-on-boot = auto-login

If the machine must come back up unattended after a Windows reboot, configure
auto-login for the dedicated lab account with Sysinternals **Autologon**
(https://learn.microsoft.com/sysinternals/downloads/autologon) — safer than
editing the registry by hand. Mitigate the security trade-off with BitLocker +
physical access control. Without this, Galago starts the moment someone logs in.

---

## Day-to-day

```powershell
# update to new code (core):
cd C:\Users\Bioteam\Desktop\galago-core; git pull; docker compose up -d --build

# update tools: git pull in C:\Users\Bioteam\Desktop\galago-tools (supervisor
#   restarts into new code on its next loop, or restart the task)

# logs
docker compose logs -f galago-web          # web
Get-Content $env:USERPROFILE\galago-tools.log -Tail 50 -Wait   # tools
Get-Content $env:USERPROFILE\galago-web.log  -Tail 50 -Wait    # web bring-up

# task control
Get-ScheduledTask 'Galago *'
Start-ScheduledTask -TaskName 'Galago Tools'
Stop-ScheduledTask  -TaskName 'Galago Tools'
```

## Gotchas

- **Windows Firewall** may prompt the first time the container connects to a tool
  port; allow `python.exe` (Private networks) so `host.docker.internal` reaches it.
- The *Galago Tools* task runs **hidden** (via `wscript.exe` + `start-galago-tools-hidden.vbs`),
  so there's no console window for a lab user to accidentally close. Output still
  goes to `%USERPROFILE%\galago-tools.log`. To debug interactively, run
  `start-galago-tools.cmd` directly — it opens a normal visible window.
- If `docker compose up` runs before the engine is ready, `start-galago-web.ps1`
  already waits up to ~5 min for `docker info` to succeed.
