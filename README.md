# Galago

Galago consists of several distinct modules:

- Controller, a NEXT.js app which governs a defined set of devices (execution management and scheduling)
- Tool drivers which implement a gRPC interface and handle tool-specific control logic

To build the protobuf interfaces, simply run `bin/make proto`.

## Controller

The controller app boots with a config file that specifies a specific set of tools and their network configurations. The config file is specific to each workcell (or related group of tools). These config files live in the `config` directory.

## Tools

Every tool runs a gRPC server that exposes a standard interface; Commands are sent to tools for execution, and correspond to the lowest level idea in the "workflow-protocol-instruction-command" family of concepts. Tool servers are typically written in Python but this is just a convention; there is no reason a given tool server couldn't be written if any other gRPC-supported language.


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

Activate galago-core environment
```
mamba activate galago-core #mac bash
source C:/Users/<User>/mamba/Scripts/activate galago-core #windows bash
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

```bash
mamba activate galago-core #mac 
source C:/Users/<User>/mamba/Scripts/activate galago-core #windows bash
bin/make run
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

**Force Kill**
```
pkill -9 python
lsof -t -i tcp:3010 | xargs kill
```
