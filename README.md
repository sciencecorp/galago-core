# Galago

Galago consists of several distinct modules:

- Controller, a NEXT.js app which governs a defined set of devices (execution management and scheduling)
- Tool drivers which implement a gRPC interface and handle tool-specific control logic

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

## Requirements 
1. Bash (Can use git bash)
2. Mamba preferred. 
3. WSL (Windows only)


## Install Mamba (miniforge3)

### On Mac 
```zsh
brew install miniforge
mamba init 
#Restart shell
```

### On Windows. 
Run the mamba_installer.ps1 file on the root folder or [Download here](https://github.com/conda-forge/miniforge?tab=readme-ov-file). Make sure to add mamba to path when prompted.

### Clone the repo:
```bash
git clone git@github.com:sciencecorp/galago-core.git
cd galago-core
```

### Build the base environmnent. 
Note: On windows you will need to make sure mamba is added to path and will need to run this on command prompt.
(Alternatively run the powershell script in admin mode, this installs mamba and creates the environments)
```
mamba create --name galago-core python=3.9.12 nodejs=18.20.3 -y
```

Build dependencies 
```
mamba activate galago-core
bin/make deps
bin/make proto
```

## Redis
Redis is used for queueing commands and runs by the controller. We recommend having a local instance running but a remote connection would also work. 


### For Mac:(zsh)
```zsh
#Install and start redis
bin/make redis
#Confirm that the server is up
redis-cli ping
```

### For Windows (using WSL):
1. Install Ubuntu via WSL following [these instructions](https://learn.microsoft.com/en-us/windows/wsl/install).
2. Inside WSL:
```
   curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
   echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list
   sudo apt-get update
   sudo apt-get install redis
   sudo service redis-server start
```

## Launching Galago

### On Windows. 
Launch Galago.exe in the root folder of the repo. You can pin a shortcut to your taskbar or desktop. 

Alternatively you can run it via python on command prompt. 
```
mamba activate galago-core
python -m tools.launch_tools
```

### Mac 
```bash
mamba activate galago-core 
python -m tools.launch_tools 
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

**Change Log Generation** 
We are using a markdown change log to keep track of changes we make to the software. To create a pdf copy from the markdown file run change_log_to_pdf.py

### Mac
```zsh
pip install markdown
pip install pdfkit
brew install wkhtmltopdf 

python changelog_to_pdf.py
```

**Force Kill**
```
pkill -9 python
lsof -t -i tcp:3000 | xargs kill
```

**Debugging windows exe** 
If the exe isn't working and crashing without any error messages. Try this: 
  & Start-Process -FilePath "C:\FRT\Development\foundry-runtime\Galago.exe" -NoNewWindow -RedirectStandardError "error_log.txt"