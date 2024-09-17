Start-Process powershell -Verb runAs

$install_path = "$env:USERPROFILE\Miniconda3"
$conda_executable = "$install_path\Scripts\conda.exe"

function AddCondaToPath {
    Write-Host "Adding Miniconda to PATH..."
    [System.Environment]::SetEnvironmentVariable("PATH", $env:PATH + ";$install_path;$install_path\Scripts;$install_path\Library\bin", [System.EnvironmentVariableTarget]::Machine)

    # Reload the PATH in the current session
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", [System.EnvironmentVariableTarget]::Machine)
}

Write-Host "Installing Miniconda..."
if (Test-Path $conda_executable) {
    Write-Host "Miniconda is already installed."

    $conda_in_path = $env:PATH -like "*$install_path\Scripts*"
    if (-not $conda_in_path) {
        AddCondaToPath
    } else {
        Write-Host "Conda is already in the PATH."
    }
}
else {
    $miniconda_url = "https://repo.anaconda.com/miniconda/Miniconda3-latest-Windows-x86_64.exe"

    $installer_path = "$env:TEMP\MinicondaInstaller.exe"

    Write-Host "Downloading Miniconda installer..."
    Invoke-WebRequest -Uri $miniconda_url -OutFile $installer_path

    Write-Host "Installing Miniconda..."
    Start-Process -Wait -FilePath $installer_path -ArgumentList "/InstallationType=JustMe", "/RegisterPython=0", "/AddToPath=1", "/S", "/D=$install_path"

    AddCondaToPath
}

Write-Host "Testing conda installation..."
Start-Process -FilePath "cmd.exe" -ArgumentList "/c conda --version" -Wait

# Create the new conda environment
Write-Host "Creating a new conda environment 'galago-core'..."
Start-Process -Wait -FilePath "cmd.exe" -ArgumentList "/c conda create -y --name galago-core python=3.9.12 nodejs=16.13.1"

Write-Host "Conda environment 'foundry-runtime' created."

Write-Host "Activating the conda environment..."
Start-Process -Wait -FilePath "cmd.exe" -ArgumentList "/c conda activate galago-core && conda env list"

# Create the second conda environment with 32-bit Python
Write-Host "Creating a 32-bit conda environment 'galago-core32'"

# Set CONDA_FORCE_32BIT environment variable
$env:CONDA_FORCE_32BIT = "1"
Start-Process -Wait -FilePath "cmd.exe" -ArgumentList "/c conda create -y --name galago-core32 python=3.9.12"

Write-Host "Conda environment 'galago-core32' created."

Write-Host "Activating the 'galago-core32' environment..."
Start-Process -Wait -FilePath "cmd.exe" -ArgumentList "/c conda activate galago-core32 && conda env list"

Write-Host "Miniconda installation and environment setup complete."
PAUSE
