# Galago

Galago consists of several distinct modules:

- Controller, a NEXT.js app which governs a defined set of devices (execution management and scheduling)
- [Tool drivers](https://github.com/sciencecorp/galago-tools) which implement a gRPC interface and handle tool-specific control logic

To build the protobuf interfaces, simply run `bin/make proto`.

## Getting started

### Requirements

1. Node 18.13
2. Python 3.9
3. Docker and Docker compose

Docker and docker compose are recommended.

### Build and launch controller

```
docker-compose -f docker-compose.yml up --build #Prod Mode
docker-compose -f docker-compose.dev.yml up --build #Dev Mode
```

## Other docker commands

```
#Stop containters
docker-compose -f docker-compose.dev.yml down

#remove existing images
docker-compose -f docker-compose.dev.yml down --rmi all

#Remove orphans
docker compose -f docker-compose.dev.yml down --rmi all --remove-orphans

#rebuild a specific service
docker-compose up -d --force-recreate --no-deps --build service_name

#e.g
docker-compose -f docker-compose.dev.yml up --build db

#add npm deps to dev environment
docker exec -it galago-web-dev npm install <package name>
```

## Using conda

### Build the base environmnent

```
conda create -n galago
conda activate galago #mac
source activate galago #windows
```

### Build dependencies

```
bin/make deps
bin/make proto
```

## Redis

Local install (if not using docker)

### For Mac (zsh)

```zsh
#Install and start redis
bin/make redis

#Confirm that the server is up
redis-cli ping
```

### For Windows (using WSL)

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
