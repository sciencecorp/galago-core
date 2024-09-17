@echo off
setlocal

set PROTOC_GEN_TS_PATH=.\controller\node_modules\.bin\protoc-gen-ts_proto
set PROTO_SRC=./interfaces
for /f %%i in ('git symbolic-ref --short HEAD') do set WORKING_BRANCH=%%i

:deps
    call :activate_env
    call :python_deps
    call :npm_deps
    npm install -g grpc-tools@1.12.4 ts-proto@1.151.1
    goto :eof

:build_env
    echo Creating conda environment '%ENV_NAME%'...
    conda create --name %ENV_NAME% python=3.9.12 nodejs=16.13.1 -y
    echo Conda environment '%ENV_NAME%' created.
    goto :eof

:activate_env
    echo Activating environment '%ENV_NAME%'...
    conda activate %ENV_NAME%
    goto :eof

:python_deps
    python -m pip install -r tools\requirements.txt
    for %%F in (tools\*\requirements.txt) do (
        python -m pip install -r %%F --no-cache-dir || (
            echo Failed to install %%F >&2
        )
    )
    goto :eof

:npm_deps
    pushd controller
    npm install
    popd
    goto :eof

:db
    call :logs_db
    call :inventory_db
    goto :eof

:logs_db
    python -m tools.db.models.log_models
    python -m tools.db.log_types_add
    goto :eof

:inventory_db
    python -m tools.db.models.inventory_models
    python -m tools.db.instantiate_db
    goto :eof

:test
    call :test_ts
    call :test_py
    goto :eof

:test_ts
    echo Running Node Tests
    pushd controller
    npm run test
    popd
    goto :eof

:test_py
    echo Running Python Tests
    ruff check .
    mypy . --install-types --non-interactive
    goto :eof

:pytest
    pytest tools/tests/ -vv
    goto :eof

:unittest_py
    python -m unittest discover -s tools/tests/ -p "*_test.py"
    goto :eof

:proto_py
    python -m grpc_tools.protoc -I%PROTO_SRC%/ --python_out=. --pyi_out=. --grpc_python_out=. %PROTO_SRC%/tools/grpc_interfaces/*.proto
    python -m grpc_tools.protoc -I%PROTO_SRC%/ --python_out=tools/grpc_interfaces/ --pyi_out=tools/grpc_interfaces --grpc_python_out=tools/grpc_interfaces/ %PROTO_SRC%/*.proto
    goto :eof

:clean_proto
    rmdir /S /Q controller\gen-interfaces
    del tools\*_pb2*.py* /F /Q
    mkdir controller\gen-interfaces\tools
    goto :eof

:proto_ts
    mkdir controller\gen-interfaces
    python -m grpc_tools.protoc -I=%PROTO_SRC%/ --ts_proto_out=./controller/gen-interfaces/ --ts_proto_opt=stringEnums=true --ts_proto_opt=esModuleInterop=true --ts_proto_opt=snakeToCamel=false --ts_proto_opt=outputServices=grpc-js %PROTO_SRC%/*.proto %PROTO_SRC%/tools/grpc_interfaces/*.proto
    goto :eof

:proto_ts_v2
    mkdir controller\gen-interfaces
    python -m grpc_tools.protoc -I=%PROTO_SRC%/ --plugin=protoc-gen-ts_proto="%PROTOC_GEN_TS_PATH%.cmd" --ts_proto_out=./controller/gen-interfaces/ --ts_proto_opt=stringEnums=true --ts_proto_opt=esModuleInterop=true --ts_proto_opt=snakeToCamel=false --ts_proto_opt=outputServices=grpc-js %PROTO_SRC%/*.proto %PROTO_SRC%/tools/grpc_interfaces/*.proto
    goto :eof

:run
    echo Launching Tools
    python -m tools.launch_tools
    goto :eof

:proto
    call :clean_proto
    call :proto_py
    call :proto_ts
    goto :eof

:default
    echo No command specified, available commands:
    echo - deps
    echo - build_env
    echo - activate_env
    echo - python_deps
    echo - npm_deps
    echo - db
    echo - logs_db
    echo - inventory_db
    echo - test
    echo - test_ts
    echo - test_py
    echo - pytest
    echo - unittest_py
    echo - proto_py
    echo - clean_proto
    echo - proto_ts
    echo - proto_ts_v2
    echo - run
    echo - proto
    goto :eof

:: Process command line arguments
if "%1"=="" (
    call :default
) else (
    for %%A in (%*) do call :%%A
)

endlocal
