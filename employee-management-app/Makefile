# Employee Management System - Docker Makefile

.PHONY: help build up down restart logs clean test

# Default target
help:
	@echo "Employee Management System - Docker Commands"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  build       - Build Docker images"
	@echo "  up          - Start containers in detached mode"
	@echo "  down        - Stop and remove containers"
	@echo "  restart     - Restart all containers"
	@echo "  logs        - View container logs"
	@echo "  logs-f      - Follow container logs"
	@echo "  ps          - List running containers"
	@echo "  clean       - Remove containers, images, and volumes"
	@echo "  test        - Run health checks"
	@echo "  shell-be    - Open shell in backend container"
	@echo "  shell-fe    - Open shell in frontend container"
	@echo ""

# Build Docker images
build:
	@echo "Building Docker images..."
	docker-compose build

# Build without cache
build-nc:
	@echo "Building Docker images (no cache)..."
	docker-compose build --no-cache

# Start containers
up:
	@echo "Starting containers..."
	docker-compose up -d
	@echo "Waiting for services to be healthy..."
	@sleep 5
	@make test

# Stop containers
down:
	@echo "Stopping containers..."
	docker-compose down

# Restart containers
restart:
	@echo "Restarting containers..."
	docker-compose restart

# View logs
logs:
	docker-compose logs

# Follow logs
logs-f:
	docker-compose logs -f

# View backend logs
logs-be:
	docker-compose logs backend

# View frontend logs
logs-fe:
	docker-compose logs frontend

# List containers
ps:
	docker-compose ps

# Clean up everything
clean:
	@echo "Cleaning up Docker resources..."
	docker-compose down -v
	docker system prune -f

# Deep clean (remove images too)
clean-all:
	@echo "Deep cleaning Docker resources..."
	docker-compose down -v --rmi all
	docker system prune -af

# Run health checks
test:
	@echo "Running health checks..."
	@echo "Backend health check:"
	@curl -s http://localhost:5000/health || echo "Backend not responding"
	@echo ""
	@echo "Frontend health check:"
	@curl -s http://localhost/health || echo "Frontend not responding"
	@echo ""
	@echo "Container status:"
	@docker-compose ps

# Open shell in backend container
shell-be:
	docker-compose exec backend sh

# Open shell in frontend container
shell-fe:
	docker-compose exec frontend sh

# Rebuild and restart backend
rebuild-be:
	@echo "Rebuilding backend..."
	docker-compose build backend
	docker-compose up -d --no-deps backend

# Rebuild and restart frontend
rebuild-fe:
	@echo "Rebuilding frontend..."
	docker-compose build frontend
	docker-compose up -d --no-deps frontend

# Full deployment (build + up)
deploy:
	@echo "Deploying application..."
	@make build
	@make up
	@echo ""
	@echo "✅ Deployment complete!"
	@echo "Frontend: http://localhost"
	@echo "Backend: http://localhost:5000"

# Development mode (with logs)
dev:
	docker-compose up

# Production deployment
prod:
	@echo "Production deployment..."
	@cp .env.docker .env
	@echo "⚠️  Remember to update JWT_SECRET in .env file!"
	@make build-nc
	@make up
