<<<<<<<< HEAD:conda_installer.ps1
Start-Process powershell -Verb runAs

$install_path = "$env:USERPROFILE\Miniconda3"
========
$install_path = "$env:USERPROFILE\Miniforge3"
>>>>>>>> fix-start-up:mamba_installer.ps1
$conda_executable = "$install_path\Scripts\conda.exe"

function AddCondaToPath {
    Write-Host "Adding Miniforge to PATH..."
    [System.Environment]::SetEnvironmentVariable("PATH", $env:PATH + ";$install_path;$install_path\Scripts;$install_path\Library\bin", [System.EnvironmentVariableTarget]::Machine)

    # Reload the PATH in the current session
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", [System.EnvironmentVariableTarget]::Machine)
}

Write-Host "Installing Miniforge..."
if (Test-Path $conda_executable) {
    Write-Host "Miniforge is already installed."

    $conda_in_path = $env:PATH -like "*$install_path\Scripts*"
    if (-not $conda_in_path) {
        AddCondaToPath
    } else {
        Write-Host "Conda is already in the PATH."
    }
}
else {
    $miniforge_url = "https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-Windows-x86_64.exe"

    $installer_path = "$env:TEMP\MiniforgeInstaller.exe"

    Write-Host "Downloading Miniforge installer..."
    Invoke-WebRequest -Uri $miniforge_url -OutFile $installer_path

    Write-Host "Installing Miniforge..."
    Start-Process -Wait -FilePath $installer_path -ArgumentList "/InstallationType=JustMe", "/RegisterPython=0", "/AddToPath=1", "/S", "/D=$install_path"
}

Write-Host "Testing conda installation..."
Start-Process -FilePath "cmd.exe" -ArgumentList "/c conda --version" -Wait

# Create the new conda environment
Write-Host "Creating a new conda environment 'galago-core'..."
Start-Process -Wait -FilePath "cmd.exe" -ArgumentList "/c conda create -y --name galago-core python=3.9.12 nodejs=16.13.1"

Write-Host "Conda environment 'galago-core' created."

Write-Host "Activating the conda environment..."

# Create the second conda environment with 32-bit Python
Write-Host "Creating a 32-bit mamba environment 'galago-core32'"

# Set CONDA_FORCE_32BIT environment variable
$env:CONDA_FORCE_32BIT = "1"
$env:CONDA_SUBDIR="win-32"
Start-Process -Wait -FilePath "cmd.exe" -ArgumentList "/c conda create -y --name galago-core32 python=3.9.12"

Write-Host "Conda environment 'galago-core32' created."

Write-Host "Activating the 'galago-core32' environment..."

<<<<<<<< HEAD:conda_installer.ps1
Write-Host "Miniconda installation and environment setup complete."
PAUSE
========
Write-Host "Miniforge installation and environment setup complete."
>>>>>>>> fix-start-up:mamba_installer.ps1
