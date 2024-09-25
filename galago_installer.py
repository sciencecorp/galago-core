import os
import subprocess
import sys
import platform
import shutil

def run_command(command):
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
    output, error = process.communicate()
    return output.decode('utf-8'), error.decode('utf-8')

def check_command_exists(command):
    return shutil.which(command) is not None

def check_homebrew():
    return check_command_exists('brew')

def check_python():
    return check_command_exists('python3')

def check_node():
    return check_command_exists('node')

def check_mamba():
    return check_command_exists('mamba')

def check_conda_env(env_name):
    output, _ = run_command(f"conda env list | grep {env_name}")
    return env_name in output

def install_homebrew():
    if not check_homebrew():
        print("Installing Homebrew...")
        homebrew_install_cmd = '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
        run_command(homebrew_install_cmd)
        return True
    else:
        print("Homebrew is already installed.")
        return False

def install_python_mac():
    if not check_python():
        print("Installing Python...")
        run_command("brew install python@3.9")
        return True
    else:
        print("Python is already installed.")
        return False

def install_node_mac():
    if not check_node():
        print("Installing Node.js...")
        run_command("brew install node@18")
        return True
    else:
        print("Node.js is already installed.")
        return False

def install_mamba_mac():
    if not check_mamba():
        print("Installing Mamba...")
        run_command("brew install miniforge")
        run_command("conda init zsh")  # Assuming zsh is the default shell on macOS
        return True
    else:
        print("Mamba is already installed.")
        return False

def install_mamba_windows():
    if not check_mamba():
        print("Installing Mamba...")
        mamba_url = "https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-Windows-x86_64.exe"
        installer = "miniforge_installer.exe"
        run_command(f"curl -L {mamba_url} -o {installer}")
        run_command(f"{installer} /S /InstallationType=JustMe /AddToPath=1 /RegisterPython=0")
        os.remove(installer)
        return True
    else:
        print("Mamba is already installed.")
        return False

def setup_environment():
    print("Setting up Galago environment...")
    if not check_conda_env("galago-core"):
        run_command("mamba create --name galago-core python=3.9.12 nodejs=18.20.3 -y")
    else:
        print("galago-core environment already exists. Updating...")
        run_command("mamba update --name galago-core --all -y")
    
    run_command("mamba activate galago-core && pip install -r tools/requirements.txt")
    
    controller_dir = os.path.join(os.getcwd(), "controller")
    if os.path.exists(controller_dir):
        os.chdir(controller_dir)
        run_command("npm install")
        os.chdir("..")
    else:
        print("Warning: 'controller' directory not found. Skipping npm install.")
    return True

def run_with_progress(description, function):
    print(f"{description}...")
    result = function()
    if result:
        print(f"{description} completed.")
    return result

def main():
    system = platform.system()

    if system == "Darwin":
        run_with_progress("Installing Homebrew", install_homebrew)
        run_with_progress("Installing Python", install_python_mac)
        run_with_progress("Installing Node.js", install_node_mac)
        run_with_progress("Installing Mamba", install_mamba_mac)
    elif system == "Windows":
        run_with_progress("Installing Mamba", install_mamba_windows)
    else:
        print("Unsupported operating system")
        sys.exit(1)

    run_with_progress("Setting up Galago environment", setup_environment)
    print("Galago installation complete!")

if __name__ == "__main__":
    main()