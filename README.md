# Galago

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node Version](https://img.shields.io/badge/node-22.11-purple.svg)](https://nodejs.org/)
[![GitHub Issues](https://img.shields.io/github/issues/sciencecorp/galago-core)](https://github.com/sciencecorp/galago-tools/issues)

**Galago** is a comprehensive laboratory automation platform that orchestrates and manages laboratory equipment through a unified interface. It provides protocol execution, device management, and real-time monitoring for automated laboratory workflows.

## Architecture

Galago consists of several distinct modules:

- **Controller**: A Next.js + tRPC web application that provides the user interface, manages device orchestration, protocol execution, and scheduling
- **Tool Drivers**: [Separate repository](https://github.com/sciencecorp/galago-tools) containing gRPC-based drivers for laboratory equipment

## Features

- 🔬 **Multi-device orchestration** - Coordinate multiple laboratory instruments simultaneously
- 📋 **Protocol management** - Create, edit, and execute complex laboratory protocols
- 📊 **Real-time monitoring** - Live status updates and logging of all device operations
- 🗄️ **Inventory tracking** - Manage labware, samples, and consumables
- 📈 **Run analytics** - Detailed execution reports
- 🔧 **Extensible architecture** - Easy integration of new laboratory equipment

## Getting Started

### Prerequisites

- **Node.js** 22.11
- **Docker** and **Docker Compose** (recommended for development)
- **Redis** (for queue management)

### Fork the Repository (Recommended)

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

4. **Launch development environment**

```bash
docker-compose -f docker-compose.dev.yml up --build
```

5. **Access the application**
   - Web Interface: http://localhost:3010

### Other useful development commands.

2. **Install grpcio dependencies on a local environment (for proto files, testing, linting, etc)**

```bash
bin/make deps
```

4. **Initialize and update submodules** (pulls the latest proto definitions from galago-tools):

```bash
git submodule update --init --recursive
```

> **Note:** Run `git submodule update --remote vendor/galago-tools` anytime you need to pull the latest proto updates.

5. **Generate proto files**

```bash
bin/make proto
```

## Production Deployment

For production deployment:

```bash

# Launch production stack
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

## SQlite commands

```
#See all tables
sqlite3 data/app.db ".tables"

#See schema for a specific table
sqlite3 data/app.db ".schema workcells"

#See all table schemas
sqlite3 data/app.db ".schema"

#Interactive mode.
sqlite3 data/app.db

  #Query a table
  SELECT * FROM logs LIMIT 5;
```

## Drizzle

We are starting to move all CRUD operations to Drizzle ORM. After updating the schemas files,
run `npx drizzle-kit generate` to generate the migration files.

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

**Port conflicts:**
- App runs at http://localhost:3010 by default.
- Modify port mappings in docker-compose files if needed

## Architecture Details

### Data Flow

1. **User Interface** (Next.js) → tRPC calls → **Database Service**
3. **User Interface** ->  tRPC calls → gRPC calls → **Tool Drivers**

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: See the [Galago Documentation](https://galago.bio/)
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions and community support
