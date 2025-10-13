# Galago

**Galago** is a comprehensive laboratory automation platform that orchestrates and manages laboratory equipment through a unified interface. It provides protocol execution, device management, and real-time monitoring for automated laboratory workflows.

## Architecture

Galago consists of several distinct modules:

- **Controller**: A Next.js + tRPC web application that provides the user interface, manages device orchestration, protocol execution, and scheduling
- **Database API**: A FastAPI-based service that handles data persistence for inventory, protocols, and logs
- **Tool Drivers**: [Separate repository](https://github.com/sciencecorp/galago-tools) containing gRPC-based drivers for laboratory equipment
- **Queue System**: Redis-based task queue for managing protocol execution and device coordination

## Features

- 🔬 **Multi-device orchestration** - Coordinate multiple laboratory instruments simultaneously
- 📋 **Protocol management** - Create, edit, and execute complex laboratory protocols
- 📊 **Real-time monitoring** - Live status updates and logging of all device operations
- 🗄️ **Inventory tracking** - Manage labware, samples, and consumables
- 📈 **Run analytics** - Detailed execution reports
- 🔧 **Extensible architecture** - Easy integration of new laboratory equipment

## Getting Started

### Prerequisites

- **Node.js** 18.13 or higher
- **Python** 3.11
- **Docker** and **Docker Compose** (recommended for development)
- **Redis** (for queue management)

### Quick Start with Docker (Recommended)

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/galago-core.git
   cd galago-core
   ```

2. **Launch development environment**

   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

3. **Access the application**
   - Web Interface: http://localhost:3010
   - Database API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Manual Setup

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
uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

#### 4. Start the web controller

```bash
cd controller
npm install
npm run dev
```

## Production Deployment

For production deployment:

```bash

# Launch production stack
docker-compose -f docker-compose.yml up -d --force-recreate
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

## Contributing

We welcome contributions to Galago! Please follow these guidelines:

### Development Workflow

1. **Fork the repository** and create a feature branch
2. **Set up development environment** using Docker Compose
3. **Make your changes** following the existing code style
4. **Test your changes** thoroughly
5. **Submit a pull request** with a clear description

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

## Security

- **Never commit sensitive information** (API keys, passwords, etc.)
- **Use environment variables** for configuration
- **Keep dependencies updated** regularly
- **Report security issues** privately to the maintainers

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

**Redis connection issues:**

```bash
# Verify Redis is running
redis-cli ping

# Check Redis logs
docker-compose logs queue
```

**Port conflicts:**

- Web interface (3010), Database API (8000), Redis (1203)
- Modify port mappings in docker-compose files if needed

## Architecture Details

### Data Flow

1. **User Interface** (Next.js) → tRPC calls → **Controller Server**
2. **Controller Server** → HTTP API calls → **Database Service**
3. **Controller Server** → gRPC calls → **Tool Drivers**
4. **Queue System** (Redis) manages asynchronous protocol execution

### Database Schema

- **Inventory**: Labware, samples, and consumables tracking
- **Protocols**: Stored procedures and execution templates
- **Runs**: Execution history and results
- **Logs**: System events and device communications

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: Check the `/docs` endpoint when running the database API
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions and community support
