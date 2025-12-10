# Galago

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Python Version](https://img.shields.io/badge/python-3.11-blue.svg)](https://www.python.org/downloads/)
[![GitHub Issues](https://img.shields.io/github/issues/sciencecorp/galago-core)](https://github.com/sciencecorp/galago-tools/issues)


**Galago** is a comprehensive laboratory automation platform that orchestrates and manages laboratory equipment through a unified interface. It provides protocol execution, device management, and real-time monitoring for automated laboratory workflows.

## Architecture

Galago consists of several distinct modules:

- **Controller**: A Next.js + tRPC web application that provides the user interface, manages device orchestration, protocol execution, and scheduling
- **Database API**: A FastAPI-based service that handles data persistence for inventory, protocols, and logs
- **Tool Drivers**: [Separate repository](https://github.com/sciencecorp/galago-tools) containing gRPC-based drivers for laboratory equipment
- **Queue System**: Redis-based task queue for managing protocol execution and device coordination

## Features

- 🔬 **Multi-device orchestration** - Coordinate multiple laboratory instruments.
- 📋 **Protocol management** - Create, edit, and execute complex laboratory protocols
- 📊 **Real-time monitoring** - Live status updates and logging of all device operations
- 🗄️ **Inventory tracking** - Manage labware, samples, and consumables
- 📈 **Run analytics** - Detailed execution reports
- 🔧 **Extensible architecture** - Easy integration of new laboratory equipment

## Getting Started

### Prerequisites

- **Node.js** 18
- **Python** 3.11
- **Docker** and **Docker Compose**
- **Redis** (for queue management)

## 📦 Installation

### Option 1: Fork the Repository (For contributors)

If you plan to contribute or customize Galago, start by forking the repository:

1. **Fork on GitHub**: Click the "Fork" button at the top right of the [repository page](https://github.com/sciencecorp/galago-core), or use this direct link:
   
   **[Fork Galago →](https://github.com/sciencecorp/galago-core/fork)**

2. **Clone your fork** (replace `your-username` with your GitHub username):
```bash
   git clone https://github.com/your-username/galago-core.git
   cd galago-core
```

3. **Add upstream remote** (to keep your fork updated):
```bash
   git remote add upstream https://github.com/your-org/galago-core.git
```

4.  **Install grpcio dependencies on a local environment (for proto files, testing, linting, etc)**

```bash 
   bin/make deps 
```

5. **Generate proto files**
```bash 
   bin/make proto
```

6. **Launch development environment**
```bash
   docker-compose -f docker-compose.dev.yml up --build
```

8. **Access the application**
   - Web Interface: http://localhost:3010
   - Database API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs


### Option 2: Manual Setup

If you prefer to run without Docker:

#### 1. Build dependencies and interfaces

```bash
bin/make deps
bin/make proto
```

#### 2. Start Redis (if not using Docker)

```bash
# macOS
bin/make redis

# Or install manually
redis-server
```

#### 3. Start the database service

```bash
cd db
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### 4. Start the web controller

```bash
cd controller
npm install
npm run dev
```

### Option 3: Production Deployment

If you just need to get started without making changes to the codebase you can launch the production images directly using docker compose. 

```bash 
docker-compose up -d
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

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. **[Fork Galago Core →](https://github.com/sciencecorp/galago-core/fork)**
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


### Code Style

- **TypeScript/JavaScript**: Follow existing patterns, use Prettier for formatting
- **Python**: Follow PEP 8, use type hints where possible
- **Commit messages**: Use conventional commit format

### Adding New Tools

To integrate a new laboratory instrument:

1. Implement the gRPC interface in the [galago-tools repository](https://github.com/sciencecorp/galago-tools)
2. Add the tool type to `interfaces/controller.proto`
3. Update the controller to recognize the new tool type
4. Add appropriate UI components for tool-specific operations


## Troubleshooting

### Common Issues

**Container fails to start:**

```bash
# Check logs
docker-compose logs galago-web-dev
docker-compose logs galago-db-dev

# Rebuild containers
docker-compose -f docker-compose.dev.yml down --rmi all
docker-compose -f docker-compose.dev.yml up --build
```

**Port conflicts:**
- Web interface (3010), Database API (8000), Redis (1203)
- Modify port mappings in docker-compose files if needed

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: Check the `/docs` endpoint when running the database API
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions and community support
