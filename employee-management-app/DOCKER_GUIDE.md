# 🐳 Docker Deployment Guide

**Employee Management System - Containerized Deployment**

---

## 📋 Overview

This guide covers deploying the Employee Management System using Docker and Docker Compose.

### What's Included

- ✅ **Backend Container**: Node.js + Express + TypeScript
- ✅ **Frontend Container**: React + Nginx (production build)
- ✅ **Docker Compose**: Orchestrates both services
- ✅ **Health Checks**: Automatic container health monitoring
- ✅ **Networking**: Isolated Docker network
- ✅ **Auto-restart**: Containers restart on failure

---

## 🚀 Quick Start

### Prerequisites

- Docker installed (version 20.10+)
- Docker Compose installed (version 2.0+)

### 1. Build and Start

```bash
cd employee-management-app
docker-compose up -d
```

### 2. Access Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

### 3. Stop Application

```bash
docker-compose down
```

---

## 📦 Docker Architecture

### Container Structure

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Host                          │
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Frontend Container (Nginx)                      │ │
│  │  - Port: 80                                      │ │
│  │  - Image: nginx:alpine                           │ │
│  │  - Serves: React production build                │ │
│  │  - Health check: /health endpoint                │ │
│  └────────────────┬─────────────────────────────────┘ │
│                   │                                     │
│                   │ HTTP Requests                       │
│                   │                                     │
│  ┌────────────────▼─────────────────────────────────┐ │
│  │  Backend Container (Node.js)                     │ │
│  │  - Port: 5000                                    │ │
│  │  - Image: node:20-alpine                         │ │
│  │  - Runs: Express + TypeScript                    │ │
│  │  - Health check: /health endpoint                │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Docker Network: employee-management-network     │ │
│  │  - Type: Bridge                                  │ │
│  │  - Isolation: Container-to-container             │ │
│  └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Configuration Files

### 1. Backend Dockerfile

**Location**: `backend/Dockerfile`

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci --only=production
COPY src ./src
RUN npm install -g tsx typescript
RUN npm run build
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
CMD ["npm", "start"]
```

**Features**:
- ✅ Multi-stage build for optimization
- ✅ Alpine Linux (smaller image size)
- ✅ Production dependencies only
- ✅ Health check endpoint
- ✅ TypeScript compilation

---

### 2. Frontend Dockerfile

**Location**: `frontend/Dockerfile`

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Features**:
- ✅ Multi-stage build (smaller final image)
- ✅ Nginx for serving static files
- ✅ Custom nginx configuration
- ✅ Gzip compression
- ✅ Security headers

---

### 3. Docker Compose

**Location**: `docker-compose.yml`

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    container_name: employee-management-backend
    ports:
      - "5000:5000"
    environment:
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
    restart: unless-stopped
    networks:
      - employee-management-network
    healthcheck:
      test: ["CMD", "node", "-e", "..."]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build: ./frontend
    container_name: employee-management-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - employee-management-network

networks:
  employee-management-network:
    driver: bridge
```

---

## 🛠️ Docker Commands

### Build Images

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend

# Build without cache
docker-compose build --no-cache
```

### Start Services

```bash
# Start in detached mode
docker-compose up -d

# Start with logs
docker-compose up

# Start specific service
docker-compose up -d backend
```

### Stop Services

```bash
# Stop all services
docker-compose stop

# Stop specific service
docker-compose stop backend

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes
docker-compose down -v
```

### View Logs

```bash
# View all logs
docker-compose logs

# Follow logs
docker-compose logs -f

# View specific service logs
docker-compose logs backend
docker-compose logs frontend

# Last 100 lines
docker-compose logs --tail=100
```

### Container Management

```bash
# List running containers
docker-compose ps

# Execute command in container
docker-compose exec backend sh
docker-compose exec frontend sh

# Restart services
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Health Checks

```bash
# Check container health
docker ps

# View health check logs
docker inspect employee-management-backend | grep Health -A 10
docker inspect employee-management-frontend | grep Health -A 10
```

---

## 🔐 Environment Variables

### Production Configuration

**File**: `.env` (create from `.env.docker`)

```bash
# Copy template
cp .env.docker .env

# Edit values
nano .env
```

**Required Variables**:
```bash
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=24h
NODE_ENV=production
PORT=5000
```

**Security Best Practices**:
- ✅ Use strong, random JWT secret (32+ characters)
- ✅ Never commit `.env` to version control
- ✅ Use different secrets for each environment
- ✅ Rotate secrets regularly

---

## 🌐 Nginx Configuration

**Location**: `frontend/nginx.conf`

**Features**:
- ✅ Gzip compression for faster loading
- ✅ Security headers (XSS, Clickjacking protection)
- ✅ React Router support (SPA routing)
- ✅ Static asset caching (1 year)
- ✅ No cache for index.html
- ✅ Health check endpoint

**Custom Configuration**:
```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    
    # React Router support
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 📊 Image Sizes

### Optimized Builds

**Backend**:
- Base image: `node:20-alpine` (~180 MB)
- Final image: ~250 MB
- Optimization: Production dependencies only

**Frontend**:
- Builder stage: `node:20-alpine` (~180 MB)
- Final image: `nginx:alpine` (~40 MB)
- Final size: ~45 MB
- Optimization: Multi-stage build, only dist files

**Total**: ~295 MB for both containers

---

## 🔍 Troubleshooting

### Issue: Container won't start

**Check logs**:
```bash
docker-compose logs backend
docker-compose logs frontend
```

**Common causes**:
- Port already in use
- Missing environment variables
- Build errors

**Solution**:
```bash
# Stop conflicting services
docker-compose down

# Rebuild
docker-compose build --no-cache

# Start again
docker-compose up -d
```

---

### Issue: Cannot connect to backend

**Check network**:
```bash
docker network inspect employee-management-network
```

**Check backend health**:
```bash
curl http://localhost:5000/health
```

**Solution**:
```bash
# Restart backend
docker-compose restart backend

# Check logs
docker-compose logs backend
```

---

### Issue: Frontend shows blank page

**Check nginx logs**:
```bash
docker-compose logs frontend
```

**Check build output**:
```bash
docker-compose exec frontend ls -la /usr/share/nginx/html
```

**Solution**:
```bash
# Rebuild frontend
docker-compose build frontend
docker-compose up -d frontend
```

---

### Issue: Health check failing

**Check health status**:
```bash
docker ps
```

**Manual health check**:
```bash
# Backend
curl http://localhost:5000/health

# Frontend
curl http://localhost/health
```

**Solution**:
```bash
# Increase health check timeout
# Edit docker-compose.yml:
healthcheck:
  timeout: 30s
  start_period: 60s
```

---

## 🚀 Production Deployment

### 1. Prepare Environment

```bash
# Create production .env
cp .env.docker .env

# Update JWT_SECRET with strong random value
openssl rand -base64 32

# Edit .env
nano .env
```

### 2. Build Production Images

```bash
# Build with production settings
docker-compose build --no-cache

# Tag images for registry
docker tag employee-management-backend:latest your-registry/employee-management-backend:v1.0.0
docker tag employee-management-frontend:latest your-registry/employee-management-frontend:v1.0.0
```

### 3. Push to Registry

```bash
# Login to registry
docker login your-registry

# Push images
docker push your-registry/employee-management-backend:v1.0.0
docker push your-registry/employee-management-frontend:v1.0.0
```

### 4. Deploy to Server

```bash
# On production server
docker-compose pull
docker-compose up -d

# Verify deployment
docker-compose ps
curl http://localhost:5000/health
```

---

## 🔄 Updates and Rollbacks

### Update Application

```bash
# Pull latest code
git pull

# Rebuild images
docker-compose build

# Restart services (zero-downtime)
docker-compose up -d --no-deps --build backend
docker-compose up -d --no-deps --build frontend
```

### Rollback

```bash
# Stop current version
docker-compose down

# Checkout previous version
git checkout v1.0.0

# Rebuild and start
docker-compose build
docker-compose up -d
```

---

## 📈 Monitoring

### Container Stats

```bash
# Real-time stats
docker stats

# Specific container
docker stats employee-management-backend
```

### Resource Usage

```bash
# Disk usage
docker system df

# Container details
docker inspect employee-management-backend
```

### Logs Management

```bash
# Limit log size in docker-compose.yml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

## 🧪 Testing Docker Setup

### 1. Build Test

```bash
docker-compose build
# Should complete without errors
```

### 2. Start Test

```bash
docker-compose up -d
docker-compose ps
# Both containers should be "Up" and "healthy"
```

### 3. Health Check Test

```bash
curl http://localhost:5000/health
# Should return: {"success":true,"message":"Server is running"}

curl http://localhost/health
# Should return: healthy
```

### 4. Application Test

```bash
# Open browser
open http://localhost

# Login with test account
# Email: admin@example.com
# Password: Admin@123
```

### 5. Cleanup Test

```bash
docker-compose down
docker system prune -f
```

---

## 📚 Best Practices

### Security

- ✅ Use Alpine Linux for smaller attack surface
- ✅ Run containers as non-root user (production)
- ✅ Use secrets management for sensitive data
- ✅ Scan images for vulnerabilities
- ✅ Keep base images updated

### Performance

- ✅ Use multi-stage builds
- ✅ Minimize layer count
- ✅ Use .dockerignore files
- ✅ Cache dependencies
- ✅ Optimize image size

### Reliability

- ✅ Implement health checks
- ✅ Use restart policies
- ✅ Set resource limits
- ✅ Monitor container logs
- ✅ Regular backups

---

## 🎯 Quick Reference

### Common Commands

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Logs
docker-compose logs -f

# Rebuild
docker-compose build --no-cache

# Restart
docker-compose restart

# Status
docker-compose ps

# Clean up
docker system prune -a
```

### URLs

- Frontend: http://localhost
- Backend: http://localhost:5000
- Health: http://localhost:5000/health

### Test Accounts

- Admin: admin@example.com / Admin@123
- User: user@example.com / User@123

---

## ✅ Deployment Checklist

- [ ] Docker and Docker Compose installed
- [ ] `.env` file created with production values
- [ ] JWT_SECRET changed to strong random value
- [ ] Images built successfully
- [ ] Containers start without errors
- [ ] Health checks passing
- [ ] Application accessible via browser
- [ ] Login functionality working
- [ ] CRUD operations working
- [ ] Reports generating correctly
- [ ] Logs being captured
- [ ] Monitoring configured

---

## 🎉 Success!

Your Employee Management System is now containerized and ready for deployment!

**Benefits**:
- ✅ Consistent environment across dev/staging/prod
- ✅ Easy deployment and scaling
- ✅ Isolated dependencies
- ✅ Simple rollback process
- ✅ Portable across platforms

---

**Last Updated**: February 10, 2026  
**Docker Version**: 20.10+  
**Docker Compose Version**: 2.0+
