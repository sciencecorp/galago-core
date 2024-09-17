# Galago

Galago consists of several distinct modules:

- Controller, which governs a defined set of devices (execution management and scheduling)
- Tool drivers which implement a standard gRPC interface and handle tool-specific control logic

To build the protobuf interfaces, simply run `bin/make proto`.

## Controller

The controller app boots with a config file that specifies a specific set of tools and their network configurations. The config file is specific to each workcell (or related group of tools). These config files live in the `config` directory.

## Tools

Every tool runs a gRPC server that exposes a standard interface; Commands are sent to tools for execution, and correspond to the lowest level idea in the "workflow-protocol-instruction-command" family of concepts. Tool servers are typically written in Python but this is just a convention; there is no reason a given tool server couldn't be written if any other gRPC-supported language.

## Usage

Right now this repo doesn't really do anything. For a minimal demo, run a tool server with `python -m tools.liconic.server` in one shell and then run the controller app (see the README in `controller/`) in another.

User Guide
https://sciencecorp.atlassian.net/wiki/spaces/BIO/pages/239206417/Foundry+Runtime+FRT+User+Guide


## Getting started 

```bash
git clone https://github.com/sciencecorp/foundry-runtime.git
cd foundry-runtime
```

## Create an environment. We use miniconda, use environment.yml as a base. Some tools require to run in python 32 bits. This doesn't apply if you are doing dev on your local machine.

Note:
- Make sure to add conda to path when installing conda for the fiest time (eventhough warn agaisnt.)  
- On the workcell computer, we are moving towards using a 32 bits python environment all together. This reduces complexity around using multiple environments based on the physical tool.  
- On your local computer (dev) this is not a requirement. Unless you are on Windows and connecting to physical hardware. 


32 Bits Set up

```cmd 
set CONDA_FORCE_32BIT=1

#Optional check CONDA_FORCE_32BIT=1
set 

conda create -n galago
activate galago  
conda install python=3.9

#Install npm
conda install -c conda-forge nodejs=16

#If you run into a WinError the filename or extension is too long ERROR do the following 
Go to regedit  
Go to Computer\HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\FileSystem  
Set LongPathsEnabled from 0 to 1 
Try to install npm again .
```


```bash
conda env create -f environment.yml # only specifies python version and a nodejs install
#Activate the environment
conda activate galago
#or
source C:/Users/Bioteam/miniconda3/Scripts/activate galago-core #Windows example if conda is not in path
#Install deps
bin/make deps #installs tools' and controller's dependencies.
bin/make proto #build protobuf scripts.
```

**Local Redis Db Setup**
Each workcell uses a local instance of a redis db. This is used for queueing runs and commands 

### Mac Setup
```zsh
#Builds and launches local redis db
bin/make redis_db_local
#Test that database is running.
ping
```

### Windows Setup (Install Ubuntu via WSL) 
Install Linux on Windows [Instruction](https://learn.microsoft.com/en-us/windows/wsl/install)
```wsl
#First time setup
curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list
sudo apt-get update
sudo apt-get install redis
sudo service redis-server start

#To restart the server
sudo service redis-server start

#Build inventory and logs db
bin/make log_db
bin/make inventory_db
```


## launching Galago

### Tools
You can modify Procfile.tools as needed. 
```bash 
cp bin/Procfile.<workcell_name> Procfile.tools
#example 
cp bin/ProcfileMac.baymax Procfile.tools
bin/make run_tools
```

### Controller
```bash
WORKCELL='<workcell_name>' bin/make run_controller 
#example 
WORKCELL='Baymax' bin/make run_controller 
```

### Basic redis commands**
```zsh

#Restart the server 
brew services restart redis

#Enter the redis cli 
redis-cli 

#Switch db
SELECT <index>

#Get keys 
KEYS *

#Get key type
type <key>

#get string
get <key>

#get hash 
hgetall <key>

#get all items in a list
lrange <key> 0 -1

#get set
smembers <key>

#get zset
zrange <key> 0 -1 withscores

#clear all in selected db
flushdb
```


## Known errors and issues
If you run into ```The authenticity of host 'github.com ()' can't be established.``` error on windows
run the following command:

```bash
ssh-keyscan github.com >> ~/.ssh/known_hosts
```

Note that the `cytation` tool requires a `pywin32` install, which will fail on non-Windows machines.

Also, note that if you get this error when trying to start the tool servers:

```
ImportError: dlopen(/Users/albertonava/miniconda3/envs/foundry-runtime2/lib/python3.10/site-packages/grpc/_cython/cygrpc.cpython-310-darwin.so, 0x0002): symbol not found in flat namespace '_CFRelease'
```

You may be able to fix it by running in your conda environment:

```
pip uninstall -y grpcio && conda install -y grpcio
```

or try

```
conda remove absl-py
conda install -c conda-forge absl-py
```

or try

```
pip uninstall grpcio
export GRPC_PYTHON_LDFLAGS=" -framework CoreFoundation"
pip install grpcio --no-binary :all:
```



If you modify the inventory DB, Delete the inventory.db file and then run models.py and instantiate_db.py before running the tools

Also, not if you are getting this error on mac:

```
Error: Cannot find module './build/plugin'
Require stack:
- /Users/albertonava/mambaforge/envs/foundry-runtime/lib/node_modules/ts-proto/protoc-gen-ts_proto
    at Function.Module._resolveFilename (node:internal/modules/cjs/loader:933:15)
    at Function.Module._load (node:internal/modules/cjs/loader:778:27)
    at Module.require (node:internal/modules/cjs/loader:1005:19)
    at require (node:internal/modules/cjs/helpers:102:18)
    at Object.<anonymous> (/Users/albertonava/mambaforge/envs/foundry-runtime/lib/node_modules/ts-proto/protoc-gen-ts_proto:2:1)
    at Module._compile (node:internal/modules/cjs/loader:1101:14)
    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1153:10)
    at Module.load (node:internal/modules/cjs/loader:981:32)
    at Function.Module._load (node:internal/modules/cjs/loader:822:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:81:12) {
  code: 'MODULE_NOT_FOUND',
  requireStack: [
    '/Users/albertonava/mambaforge/envs/foundry-runtime/lib/node_modules/ts-proto/protoc-gen-ts_proto'
  ]
}
--ts_proto_out: protoc-gen-ts_proto: Plugin failed with status code 1.
```

You can maybe fix it by changing your bin/make proto_ts to:

```
python -m grpc_tools.protoc \
    -I${PROTO_SRC}/ \
    --ts_proto_out=./controller/gen-interfaces/ \
    --ts_proto_opt=stringEnums=true \
    --ts_proto_opt=esModuleInterop=true \
    --ts_proto_opt=snakeToCamel=false \
    --ts_proto_opt=outputServices=grpc-js \
    --plugin=protoc-gen-ts_proto=${PROTOC_GEN_TS_PATH} \
    ${PROTO_SRC}/*.proto ${PROTO_SRC}/tools/*.proto
```

However, this causes error on windows which is why we don't commit it.

Or try

https://github.com/stephenh/ts-proto/issues/13

```
make_proto_ts() {
  mkdir -p ./controller/gen-interfaces
  python -m grpc_tools.protoc \
    -I=${PROTO_SRC}/ \
    --plugin=protoc-gen-ts_proto="${PROTOC_GEN_TS_PATH}.cmd" \
    --ts_proto_out=./controller/gen-interfaces/ \
    --ts_proto_opt=stringEnums=true \
    --ts_proto_opt=esModuleInterop=true \
    --ts_proto_opt=snakeToCamel=false \
    --ts_proto_opt=outputServices=grpc-js \
    ${PROTO_SRC}/*.proto ${PROTO_SRC}/tools/*.proto
}

PROTOC_GEN_TS_PATH=".\\controller\\node_modules\\.bin\\protoc-gen-ts_proto"


```

if a tools is initializing on the wrong port, check the order they're placed in the Procfile. This impacts the port assigned. TODO

**Change Log Generation** 
We are using a markdown change log to keep track of changes we make to the software. To create a pdf copy from the markdown file run change_log_to_pdf.py

### Mac
```zsh
pip install markdown
pip install pdfkit
brew install wkhtmltopdf 

python changelog_to_pdf.py
```

**Debugging exe** 
If the exe isn't working and crashing without any error messages. Try this: 
  & Start-Process -FilePath "C:\FRT\Development\foundry-runtime\Galago.exe" -NoNewWindow -RedirectStandardError "error_log.txt"