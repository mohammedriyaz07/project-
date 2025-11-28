#!/bin/bash

echo "🧪 Testing MEAN Stack Docker Setup"
echo "=================================="

# Test if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "✅ Docker is running"

# Test docker-compose configuration
echo "🔍 Validating docker-compose configuration..."
if docker-compose config --quiet 2>/dev/null; then
    echo "✅ Docker Compose configuration is valid"
else
    echo "❌ Docker Compose configuration has errors"
    exit 1
fi

# Check if required directories exist
echo "📁 Checking project structure..."
if [ ! -d "frontend" ]; then
    echo "⚠️  Warning: frontend/ directory not found"
fi

if [ ! -d "backend" ]; then
    echo "⚠️  Warning: backend/ directory not found"
fi

if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Copy from env.example"
fi

echo "🎯 To start the application:"
echo "   Production mode:  docker-compose up --build"
echo "   Development mode: docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build"
echo ""
echo "📍 Access URLs:"
echo "   Frontend (prod): http://localhost"
echo "   Backend API:     http://localhost:3000/api/"
echo "   MongoDB:         localhost:27017"
