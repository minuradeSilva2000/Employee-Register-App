#!/bin/bash

# Employee Management System - Docker Setup Script
# This script builds and runs the complete application using Docker

set -e

echo "🚀 Employee Management System - Docker Setup"
echo "============================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Stop and remove existing containers
echo "🧹 Cleaning up existing containers..."
docker-compose down --volumes --remove-orphans 2>/dev/null || true

# Remove existing images (optional - uncomment if you want to rebuild from scratch)
# echo "🗑️  Removing existing images..."
# docker-compose down --rmi all 2>/dev/null || true

# Build and start the application
echo "🔨 Building and starting the application..."
docker-compose up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

# Check MongoDB
if docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1; then
    echo "✅ MongoDB is running and healthy"
else
    echo "❌ MongoDB is not responding"
fi

# Check Application
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ Application is running and healthy"
else
    echo "❌ Application is not responding"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Application Information:"
echo "   🌐 Web Application: http://localhost:5000"
echo "   🔌 API Endpoint: http://localhost:5000/api"
echo "   🗄️  MongoDB: localhost:27017"
echo ""
echo "👤 Demo Login Credentials:"
echo "   Admin: admin@example.com / Admin@123"
echo "   HR: hr@example.com / Hr@123"
echo "   Viewer: viewer@example.com / Viewer@123"
echo ""
echo "🔧 Useful Commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop application: docker-compose down"
echo "   Restart application: docker-compose restart"
echo "   View running containers: docker-compose ps"
echo ""
echo "🎯 The application is now ready for testing!"

# Show running containers
echo "📊 Running Containers:"
docker-compose ps