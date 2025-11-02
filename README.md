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

We recommend the use docker for both development and production.

- **Docker** and **Docker Compose**

Optional

- **Node.js** 18.13 or higher
- **Python** 3.11
- **Redis** (for queue management)

## Quick Start with Docker (Recommended)

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

## Production Deployment

For production deployment:

```bash

# Launch production stack
docker-compose -f docker-compose.yml up -d --force-recreate
```

## Helpful docker commands

```
#Stop containters
docker-compose -f docker-compose.dev.yml down

#remove existing images
docker-compose -f docker-compose.dev.yml down --rmi all

#Remove orphans
docker compose -f docker-compose.dev.yml down --rmi all --remove-orphans

#rebuild a specific service
docker-compose up -d --force-recreate --no-deps --build service_name

#e.g: rebuild db
docker-compose -f docker-compose.dev.yml up --build db

#add npm deps to dev environment
docker exec -it galago-web-dev npm install <package name>
```

## Database Migrations

```
# Migrations run automatically on startup
docker-compose -f docker-compose.dev.yml up --build db #development

docker-compose up -d db #production
```

### Creating new migrations
For consistency, migrations are generated directly in Docker. 

```

# Generate migration template for manual changes
docker compose -f docker-compose.dev.yml exec db bash -c "cd /app/db && python -m alembic revision --autogenerate -m 'Add protocol processes and command groups'"

```

### Check current migration version

```
# In development
docker-compose -f docker-compose.dev.yml exec db bash -c "cd /app/db && python -m alembic current"

# In production
docker-compose exec db bash -c "cd /app/db && python -m alembic current"
```

### Running migrations manually

```
# Upgrade to latest
docker-compose exec db bash -c "cd /app/db && python -m alembic upgrade head"

# Rollback one migration
docker-compose exec db bash -c "cd /app/db && python -m alembic downgrade -1"

# Rollback to specific version
docker-compose exec db bash -c "cd /app/db && python -m alembic downgrade <revision_id>"
```

## Automatic BAKCUPS

Database backups are created automatically before each migration. We set a 7 days (development) and 30 days (production) rentention policy, these can be adjusted.

In Development the backups are under `db/data/backups`  
In Production you should create a backups directory where your compose directory is located. Or update the docker-compose.yml mount directory.

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