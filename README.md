# Galago

Galago consists of several distinct modules:

- Controller, a NEXT.js app which governs a defined set of devices (execution management and scheduling)
- [Tool drivers](https://github.com/sciencecorp/galago-tools) which implement a gRPC interface and handle tool-specific control logic

To build the protobuf interfaces, simply run `bin/make proto`.

## Controller

The controller app boots with a config file that specifies a specific set of tools and their network configurations. The config file is specific to each workcell (or related group of tools). These config files live in the `config` directory.

## Getting started
## Requirements

1. Node 18.20.3
2. Python 3.9
3. WSL (Windows only)

## Docker and docker compose are recommended. 

### Build and launch controller. 
```
docker-compose -f docker-compose.yml up --build #Prod Mode 
docker-compose -f docker-compose.dev.yml up --build #Dev Mode 

```

## Other docker commands.
```
#Stop containters
docker-compose -f docker-compose.dev.yml down

#remove existing images
docker-compose -f docker-compose.dev.yml down --rmi all

#rebuild and restart
docker-compose -f docker-compose.dev.yml up --build

#add npm deps to dev environment
docker exec -it galago-web-dev npm install <package name>
```


## If not using docker it is recommended to use a virtual environment. Eg. miniconda, mamba. and follow the steps below

### On Mac

```zsh
brew install miniforge
mamba init
```

### On Windows.
[Download here](https://github.com/conda-forge/miniforge?tab=readme-ov-file). Make sure to add mamba to path when prompted.

### Clone the repo:

```bash
git clone git@github.com:sciencecorp/galago-core.git
cd galago-core
```

### Build the base environmnent.
```
mamba create --name galago-core python=3.9.12 nodejs=18.20.3 -y
```

### Activate environment
```
mamba activate galago-core #mac bash
source C:/Users/<User>/mamba/Scripts/activate galago-core #windows bash
```

### Build dependencies

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

```bash
bin/make run
```

