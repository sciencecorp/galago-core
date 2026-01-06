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
- **Queue System**: SQLite-based task queue for managing protocol execution and device coordination

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

### Setup

#### 1. Build dependencies and interfaces

```bash
bin/make deps
bin/make proto
```

#### 2. Start the database service

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

#### 4. Access the application
- Web Interface: http://localhost:3010
- Database API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

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
2. **Set up development environment** following the Setup instructions
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

**Port conflicts:**

- Web interface (3010), Database API (8000)
- Modify port numbers in your startup commands if needed

**Database connection issues:**

```bash
# Check if the database service is running
curl http://localhost:8000/health
```

## Architecture Details

### Data Flow

1. **User Interface** (Next.js) → tRPC calls → **Controller Server**
2. **Controller Server** → HTTP API calls → **Database Service**
3. **Controller Server** → gRPC calls → **Tool Drivers**
4. **Queue System** (SQLite) manages asynchronous protocol execution

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
