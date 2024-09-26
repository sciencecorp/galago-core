import os
import subprocess
import sys
import platform
import shutil
from typing import Callable

def run_command(command: str) -> tuple[str, str]:
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
    output, error = process.communicate()
    return output.decode('utf-8'), error.decode('utf-8')

def check_command_exists(command: str) -> bool:
    return shutil.which(command) is not None

def check_homebrew() -> bool:
    return check_command_exists('brew')

def check_python() -> bool:
    return check_command_exists('python3')

def check_node() -> bool:
    return check_command_exists('node')

def check_mamba() -> bool:
    return check_command_exists('mamba')

def check_conda_env(env_name: str) -> bool:
    output, _ = run_command(f"conda env list | grep {env_name}")
    return env_name in output

def install_homebrew() -> bool:
    if not check_homebrew():
        print("Installing Homebrew...")
        homebrew_install_cmd = '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
        run_command(homebrew_install_cmd)
        return True
    else:
        print("Homebrew is already installed.")
        return False

def install_python_mac() -> bool:
    if not check_python():
        print("Installing Python...")
        run_command("brew install python@3.9")
        return True
    else:
        print("Python is already installed.")
        return False

def install_node_mac() -> bool:
    if not check_node():
        print("Installing Node.js...")
        run_command("brew install node@18")
        return True
    else:
        print("Node.js is already installed.")
        return False

def install_mamba_mac() -> bool:
    if not check_mamba():
        print("Installing Mamba...")
        run_command("brew install miniforge")
        run_command("conda init zsh")  # Assuming zsh is the default shell on macOS
        return True
    else:
        print("Mamba is already installed.")
        return False

def install_mamba_windows() -> bool:
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

def setup_environment() -> bool:
    print("Setting up Galago environment...")
    if not check_conda_env("galago-core"):
        run_command("mamba create --name galago-core python=3.9.12 nodejs=18.20.3 -y")
    else:
        print("galago-core environment already exists. Updating...")
        run_command("mamba update --name galago-core --all -y")
    
    run_command("mamba activate galago-core && pip install -r tools/requirements.txt")
    
    script_dir = os.path.abspath(os.path.dirname(__file__))
    controller_dir = os.path.join(script_dir, "controller")
    if os.path.exists(controller_dir):
        os.chdir(controller_dir)
        run_command("npm install")
        os.chdir("..")
        print("Galago controller installed successfully.")
    else:
        print("Warning: 'controller' directory not found. Skipping npm install.")
    return True

def install_redis() -> bool:
    if platform.system() == "Darwin":
        eval_command = 'eval "$(/opt/homebrew/bin/brew shellenv)"'
        run_command(eval_command)
        if not check_command_exists('brew'):
            print("Homebrew not found. Installing Homebrew...")
            homebrew_install_cmd = '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
            run_command(homebrew_install_cmd)
        else:
            print("Homebrew is already installed.")
        
        if not check_command_exists('redis-server'):
            print("Installing Redis...")
            run_command("brew install redis")
            run_command("brew services start redis")
            print("Redis service is running.")
        else:
            print("Redis is already installed and running.")
        return True
    else:
        print("Redis installation is only supported on macOS.")
        return False

def setup_databases() -> bool:
    print("Setting up databases...")
    run_command("python -m tools.db.models.log_models")
    run_command("python -m tools.db.log_types_add")
    run_command("python -m tools.db.models.inventory_models")
    run_command("python -m tools.db.instantiate_db")
    print("Databases setup completed.")
    return True

def clean_proto() -> bool:
    print("Cleaning up generated proto files")
    run_command("rm -rf controller/gen-interfaces tools/*_pb2*.py*")
    run_command("mkdir -p controller/gen-interfaces/tools")
    print("Cleaned up generated proto files")
    return True

def proto_py() -> bool:
    print("Generating protobuf definitions for Python")
    proto_src = "./interfaces"
    run_command(f"python -m grpc_tools.protoc -I{proto_src}/ --python_out=. --pyi_out=. --grpc_python_out=. {proto_src}/tools/grpc_interfaces/*.proto")
    run_command(f"python -m grpc_tools.protoc -I{proto_src}/ --python_out=tools/grpc_interfaces/ --pyi_out=tools/grpc_interfaces --grpc_python_out=tools/grpc_interfaces/ {proto_src}/*.proto")
    print("Generated protobuf definitions for Python")
    return True

def proto_ts() -> bool:
    print("Generating protobuf definitions for TypeScript")
    proto_src = "./interfaces"
    controller_dir = "./controller"
    run_command(f"mkdir -p {controller_dir}/gen-interfaces")
    run_command(f"python -m grpc_tools.protoc -I={proto_src}/ --ts_proto_out={controller_dir}/gen-interfaces/ --ts_proto_opt=stringEnums=true --ts_proto_opt=esModuleInterop=true --ts_proto_opt=snakeToCamel=false --ts_proto_opt=outputServices=grpc-js {proto_src}/*.proto {proto_src}/tools/grpc_interfaces/*.proto")
    print("Generated protobuf definitions for TypeScript")
    return True

def proto() -> bool:
    clean_proto()
    proto_py()
    proto_ts()
    return True

def run_with_progress(description: str, function: Callable[[], bool]) -> bool:
    print(f"{description}...")
    result = function()
    if result:
        print(f"{description} completed.")
    return result

def main() -> None:
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
    run_with_progress("Installing Redis", install_redis)
    run_with_progress("Setting up databases", setup_databases)
    run_with_progress("Generating protobuf definitions", proto)
    print("Galago installation complete!")

if __name__ == "__main__":
    main()