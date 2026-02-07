#!/bin/bash

# Docker management scripts for Employee Management System

case "$1" in
  "build")
    echo "Building Docker images..."
    docker-compose build --no-cache
    ;;
  
  "up")
    echo "Starting services in production mode..."
    docker-compose up -d
    ;;
  
  "dev")
    echo "Starting services in development mode..."
    docker-compose -f docker-compose.dev.yml up -d
    ;;
  
  "down")
    echo "Stopping all services..."
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    ;;
  
  "logs")
    if [ -z "$2" ]; then
      echo "Showing logs for all services..."
      docker-compose logs -f
    else
      echo "Showing logs for $2..."
      docker-compose logs -f "$2"
    fi
    ;;
  
  "restart")
    echo "Restarting services..."
    docker-compose restart
    ;;
  
  "clean")
    echo "Cleaning up Docker resources..."
    docker-compose down -v
    docker-compose -f docker-compose.dev.yml down -v
    docker system prune -f
    docker volume prune -f
    ;;
  
  "status")
    echo "Service status:"
    docker-compose ps
    ;;
  
  "shell")
    if [ -z "$2" ]; then
      echo "Usage: $0 shell <service-name>"
      echo "Available services: backend, frontend, mongodb"
    else
      docker-compose exec "$2" sh
    fi
    ;;
  
  "backup")
    echo "Creating MongoDB backup..."
    docker-compose exec mongodb mongodump --host localhost --port 27017 --username admin --password password123 --authenticationDatabase admin --db employee_management --out /data/backup/$(date +%Y%m%d_%H%M%S)
    ;;
  
  *)
    echo "Employee Management System - Docker Management"
    echo "Usage: $0 {build|up|dev|down|logs|restart|clean|status|shell|backup}"
    echo ""
    echo "Commands:"
    echo "  build   - Build Docker images"
    echo "  up      - Start services in production mode"
    echo "  dev     - Start services in development mode"
    echo "  down    - Stop all services"
    echo "  logs    - Show logs (optionally specify service name)"
    echo "  restart - Restart services"
    echo "  clean   - Clean up Docker resources"
    echo "  status  - Show service status"
    echo "  shell   - Open shell in service container"
    echo "  backup  - Create MongoDB backup"
    echo ""
    echo "Examples:"
    echo "  $0 build"
    echo "  $0 up"
    echo "  $0 logs backend"
    echo "  $0 shell mongodb"
    ;;
esac