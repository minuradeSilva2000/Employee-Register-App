# Docker Setup Guide

This guide explains how to run the Employee Management System using Docker and Docker Compose.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)
- At least 4GB of available RAM
- At least 2GB of available disk space

## Quick Start

### 1. Clone and Setup

```bash
# Navigate to the project directory
cd employee-management-system

# Copy environment template
cp .env.docker .env

# Edit .env file with your actual values (especially Google OAuth credentials)
```

### 2. Build and Run (Production Mode)

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **MongoDB**: localhost:27017

## Development Mode

For development with hot reloading:

```bash
# Start in development mode
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

## Management Scripts

### Linux/Mac

```bash
# Make script executable
chmod +x docker-scripts.sh

# Use the script
./docker-scripts.sh build
./docker-scripts.sh up
./docker-scripts.sh logs
./docker-scripts.sh down
```

### Windows

```cmd
# Use the batch script
docker-scripts.bat build
docker-scripts.bat up
docker-scripts.bat logs
docker-scripts.bat down
```

## Available Commands

| Command | Description |
|---------|-------------|
| `build` | Build Docker images |
| `up` | Start services (production) |
| `dev` | Start services (development) |
| `down` | Stop all services |
| `logs [service]` | Show logs |
| `restart` | Restart services |
| `clean` | Clean up resources |
| `status` | Show service status |
| `shell <service>` | Open shell in container |
| `backup` | Create MongoDB backup |

## Services Overview

### MongoDB
- **Image**: mongo:7.0
- **Port**: 27017
- **Username**: admin
- **Password**: password123
- **Database**: employee_management

### Backend API
- **Port**: 5000
- **Environment**: Node.js with Express
- **Features**: REST API, Socket.io, Google OAuth

### Frontend
- **Port**: 3000
- **Environment**: React with Nginx
- **Features**: SPA, Google OAuth, Real-time updates

## Environment Variables

### Required Variables (.env file)

```env
# JWT Secrets (Generate strong random strings)
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here

# Session Secret
SESSION_SECRET=your_session_secret_key_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### Generating Secure Secrets

```bash
# Generate JWT secret
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Docker Compose Files

### docker-compose.yml (Production)
- Optimized builds
- Security hardening
- Health checks
- Resource limits

### docker-compose.dev.yml (Development)
- Volume mounts for hot reloading
- Development dependencies
- Debug configurations
- Relaxed security for development

## Networking

All services run on a custom bridge network (`employee-network`) for:
- Service discovery by name
- Isolated communication
- Security

## Volumes

### Persistent Data
- `mongodb_data`: MongoDB data persistence
- `./backend/logs`: Application logs

### Development Volumes
- `./backend:/app`: Backend code hot reloading
- `./frontend:/app`: Frontend code hot reloading

## Health Checks

All services include health checks:
- **MongoDB**: Database ping
- **Backend**: HTTP health endpoint
- **Frontend**: HTTP availability check

## Security Features

### Production Security
- Non-root users in containers
- Security headers in Nginx
- Environment variable isolation
- Network segmentation

### Development Security
- Isolated development environment
- Separate secrets for development
- Volume mount restrictions

## Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Check what's using the ports
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :5000
   netstat -tulpn | grep :27017
   ```

2. **Permission errors**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

3. **Out of disk space**
   ```bash
   # Clean up Docker resources
   docker system prune -a
   docker volume prune
   ```

4. **Memory issues**
   ```bash
   # Check Docker memory usage
   docker stats
   ```

### Debugging

```bash
# View service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Execute commands in containers
docker-compose exec backend sh
docker-compose exec mongodb mongosh

# Check service health
docker-compose ps
```

## Backup and Restore

### Create Backup
```bash
# Using management script
./docker-scripts.sh backup

# Manual backup
docker-compose exec mongodb mongodump --host localhost --port 27017 --username admin --password password123 --authenticationDatabase admin --db employee_management --out /data/backup/$(date +%Y%m%d_%H%M%S)
```

### Restore Backup
```bash
# Restore from backup
docker-compose exec mongodb mongorestore --host localhost --port 27017 --username admin --password password123 --authenticationDatabase admin --db employee_management /data/backup/BACKUP_FOLDER
```

## Production Deployment

### Preparation
1. Update environment variables with production values
2. Configure proper domain names
3. Set up SSL certificates
4. Configure firewall rules
5. Set up monitoring and logging

### Docker Swarm (Optional)
```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml employee-management
```

### Kubernetes (Optional)
Convert Docker Compose to Kubernetes manifests using tools like Kompose.

## Monitoring

### Container Monitoring
```bash
# Resource usage
docker stats

# Container inspection
docker inspect employee-backend
```

### Application Monitoring
- Backend health: http://localhost:5000/api/health
- Frontend availability: http://localhost:3000
- MongoDB status: Connect via MongoDB client

## Performance Optimization

### Production Optimizations
- Multi-stage builds for smaller images
- Nginx gzip compression
- Static asset caching
- Database indexing

### Development Optimizations
- Volume mounts for faster rebuilds
- Hot reloading enabled
- Development dependencies included

## Scaling

### Horizontal Scaling
```bash
# Scale backend service
docker-compose up -d --scale backend=3

# Load balancer configuration needed for multiple instances
```

### Vertical Scaling
Update resource limits in docker-compose.yml:
```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
```

## Maintenance

### Regular Tasks
1. Update base images regularly
2. Monitor disk usage
3. Backup database regularly
4. Review logs for errors
5. Update dependencies

### Updates
```bash
# Pull latest images
docker-compose pull

# Rebuild with updates
docker-compose build --no-cache

# Rolling update
docker-compose up -d
```