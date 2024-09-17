Start-Process powershell -Verb runAs

$PROTOC_GEN_TS_PATH = ".\controller\node_modules\.bin\protoc-gen-ts_proto"
$PROTO_SRC = "./interfaces"
$WORKING_BRANCH = git symbolic-ref --short HEAD
$ENV_NAME = "galago-core"

function deps {
  activate_env
  python_deps
  npm_deps
  # On Windows, global installs for ts-proto and grpc-tools are needed
  npm install -g grpc-tools@1.12.4 ts-proto@1.151.1
}

function build_env {
    Write-Host "Creating conda environment '$ENV_NAME'..."
    conda create --name $ENV_NAME python=3.9.12 nodejs=16.13.1 -y
    Write-Host "Conda environment '$ENV_NAME' created."
}

function activate_env {
    Write-Host "Activating environment '$ENV_NAME'..."
    conda activate $ENV_NAME
}

function python_deps {
  python -m pip install -r ../tools/requirements.txt
  foreach ($req in Get-ChildItem ../tools/*/requirements.txt) {
    try {
      python -m pip install -r $req --no-cache-dir
    } catch {
      Write-Error "Failed to install $req"
    }
  }
}

function npm_deps {
  cd ../controller
  activate_env
  npm install
  cd ..
}

function db {
  logs_db
  inventory_db
}

function logs_db {
  python -m tools.db.models.log_models
  python -m tools.db.log_types_add
}

function inventory_db {
  python -m tools.db.models.inventory_models
  python -m tools.db.instantiate_db
}

function redis {
  Write-Host "Installing Redis (This is macOS-specific)"
  Invoke-Expression "/bin/bash -c `$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh`)"
  Invoke-Expression "$(/opt/homebrew/bin/brew shellenv)"
  brew install redis
  brew install redis-cli
  brew services start redis
  Start-Process redis-server
  Write-Host "Redis service is running"
}

function test {
  test_ts
  test_py
}

function test_ts {
  Write-Host "Running Node Tests"
  Set-Location controller
  npm run test
  Set-Location ..
}

function test_py {
  Write-Host "Running Python Tests"
  ruff check .
  mypy . --install-types --non-interactive
}

function pytest {
  pytest tools/tests/ -vv
}

function unittest_py {
  python -m unittest discover -s tools/tests/ -p "*_test.py"
}

function proto_py {
  python -m grpc_tools.protoc -I$PROTO_SRC/ --python_out=. --pyi_out=. --grpc_python_out=. $PROTO_SRC/tools/grpc_interfaces/*.proto
  python -m grpc_tools.protoc -I$PROTO_SRC/ --python_out=tools/grpc_interfaces/ --pyi_out=tools/grpc_interfaces --grpc_python_out=tools/grpc_interfaces/ $PROTO_SRC/*.proto
}

function clean_proto {
  Remove-Item -Recurse -Force controller/gen-interfaces, tools/*_pb2*.py*
  New-Item -ItemType Directory -Force -Path controller/gen-interfaces/tools
}

function proto_ts {
  New-Item -ItemType Directory -Force -Path ./controller/gen-interfaces
  python -m grpc_tools.protoc -I=$PROTO_SRC/ --ts_proto_out=./controller/gen-interfaces/ --ts_proto_opt=stringEnums=true --ts_proto_opt=esModuleInterop=true --ts_proto_opt=snakeToCamel=false --ts_proto_opt=outputServices=grpc-js $PROTO_SRC/*.proto $PROTO_SRC/tools/grpc_interfaces/*.proto
}

function proto_ts_v2 {
  New-Item -ItemType Directory -Force -Path ./controller/gen-interfaces
  python -m grpc_tools.protoc -I=$PROTO_SRC/ --plugin=protoc-gen-ts_proto="$PROTOC_GEN_TS_PATH.cmd" --ts_proto_out=./controller/gen-interfaces/ --ts_proto_opt=stringEnums=true --ts_proto_opt=esModuleInterop=true --ts_proto_opt=snakeToCamel=false --ts_proto_opt=outputServices=grpc-js $PROTO_SRC/*.proto $PROTO_SRC/tools/grpc_interfaces/*.proto
}

function run {
  Write-Host "Launching Tools"
  python -m tools.launch_tools
}

function proto {
  clean_proto
  proto_py
  proto_ts
}


deps

PAUSE