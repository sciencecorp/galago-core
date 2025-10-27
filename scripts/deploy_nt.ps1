# Production deployment script with cache-busting (PowerShell)
param(
    [string]$ComposeFile = "docker-compose.yml",
    [switch]$SkipCleanup,
    [switch]$Verbose
)

# Error handling
$ErrorActionPreference = "Stop"

function Write-Status {
    param([string]$Message, [string]$Icon = "🔄")
    Write-Host "$Icon $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

try {
    Write-Status "Starting clean production deployment..." "🚀"
    
    # Check if docker-compose file exists
    if (!(Test-Path $ComposeFile)) {
        throw "Docker compose file '$ComposeFile' not found!"
    }

    # Step 1: Pull latest images (force refresh)
    Write-Status "Pulling latest images..." "📥"
    & docker-compose -f $ComposeFile pull --quiet
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to pull images"
    }

    # Step 2: Stop and remove containers
    Write-Status "Stopping containers..." "🛑"
    & docker-compose -f $ComposeFile down
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Docker compose down had issues, continuing..."
    }

    # Step 3: Remove dangling images and build cache (optional but recommended)
    if (!$SkipCleanup) {
        Write-Status "Cleaning up dangling images..." "🧹"
        & docker image prune -f
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Image cleanup had issues, continuing..."
        }
    }

    # Step 4: Build with no cache and pull latest base images
    Write-Status "Building with fresh cache..." "🔨"
    & docker-compose -f $ComposeFile build --no-cache --pull
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to build images"
    }

    # Step 5: Start services
    Write-Status "Starting services..." "🚀"
    & docker-compose -f $ComposeFile up -d
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to start services"
    }

    # Step 6: Verify deployment
    Write-Status "Verifying deployment..." "🔍"
    Start-Sleep -Seconds 5
    & docker-compose -f $ComposeFile ps
    
    if ($Verbose) {
        Write-Status "Container logs (last 10 lines):" "📋"
        & docker-compose -f $ComposeFile logs --tail=10
    }

    Write-Success "Deployment complete!"
    
    # Optional health check
    Write-Status "Running health checks..." "🏥"
    $healthCheckPassed = $true
    
    # Check if containers are running
    $runningContainers = & docker-compose -f $ComposeFile ps --services --filter "status=running"
    $allServices = & docker-compose -f $ComposeFile config --services
    
    foreach ($service in $allServices) {
        if ($runningContainers -contains $service) {
            Write-Success "$service is running"
        } else {
            Write-Error "$service is not running"
            $healthCheckPassed = $false
        }
    }
    
    if ($healthCheckPassed) {
        Write-Success "All services are healthy!"
    } else {
        Write-Warning "Some services may have issues. Check logs with: docker-compose -f $ComposeFile logs"
    }

} catch {
    Write-Error "Deployment failed: $($_.Exception.Message)"
    
    # Show recent logs for debugging
    Write-Status "Recent logs for debugging:" "🔍"
    & docker-compose -f $ComposeFile logs --tail=20
    
    exit 1
}

# Optional: Display useful post-deployment commands
Write-Host ""
Write-Host "📋 Useful commands:" -ForegroundColor Yellow
Write-Host "  View logs:     docker-compose -f $ComposeFile logs -f" -ForegroundColor Gray
Write-Host "  Stop services: docker-compose -f $ComposeFile down" -ForegroundColor Gray
Write-Host "  Restart:       docker-compose -f $ComposeFile restart" -ForegroundColor Gray
Write-Host "  Status:        docker-compose -f $ComposeFile ps" -ForegroundColor Gray