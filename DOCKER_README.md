# Docker Setup for MEAN Stack Application

This setup provides complete containerization for your MEAN stack application using Docker and Docker Compose.

## Project Structure

```
.
├── frontend/              # Angular application
│   ├── Dockerfile         # Production build
│   ├── Dockerfile.dev     # Development build
│   └── nginx.conf         # Nginx configuration
├── backend/               # Node.js/Express API
│   └── Dockerfile         # Backend container
├── docker-compose.yml     # Production orchestration
├── docker-compose.override.yml  # Development overrides
├── env.example            # Environment variables template
└── DOCKER_README.md       # This file
```

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 4GB RAM available
- Git (optional, for cloning)

## Quick Start (Production)

1. **Clone/Setup your project** (if not already done):
   ```bash
   # Assuming your project is already extracted
   cd your-project-directory
   ```

2. **Create environment file**:
   ```bash
   cp env.example .env
   # Edit .env with your actual values
   ```

3. **Build and start the application**:
   ```bash
   docker-compose up --build
   ```

4. **Access the application**:
   - Frontend: http://localhost
   - Backend API: http://localhost:3000/api/
   - MongoDB: localhost:27017 (from host machine)

## Development Mode

For development with hot reload and debugging:

```bash
# Use override file for development features
docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build
```

In development mode:
- Frontend: http://localhost:4200 (Angular dev server with hot reload)
- Backend: http://localhost:3000 (with nodemon)
- MongoDB: localhost:27017

## Environment Variables

Copy `env.example` to `.env` and configure:

```bash
# Required
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your_secure_password
MONGO_DATABASE=crudapp
JWT_SECRET=your-jwt-secret-key

# Optional
NODE_ENV=production  # or development
```

## Docker Commands

### Build and Run
```bash
# Build all services
docker-compose build

# Start all services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
```

### Stop and Cleanup
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes database data)
docker-compose down -v

# Remove all containers and images
docker-compose down --rmi all

# Clean up unused Docker resources
docker system prune -a --volumes
```

### Service Management
```bash
# Restart a specific service
docker-compose restart backend

# Scale services (if needed)
docker-compose up -d --scale backend=2

# Execute commands in running containers
docker-compose exec backend sh
docker-compose exec mongodb mongo -u admin -p
```

## Deployment Options

### 1. Local Production Deployment
```bash
# Build for production
docker-compose up --build -d

# Check health
curl http://localhost/health
```

### 2. Deploy to Cloud Platforms

#### Render.com
1. Connect your GitHub repository
2. Create a new Web Service
3. Set build command: `docker-compose build`
4. Set start command: `docker-compose up`
5. Add environment variables from `.env`
6. Set health check path: `/health`

#### Railway
1. Connect repository
2. Railway auto-detects docker-compose.yml
3. Add environment variables
4. Deploy

#### DigitalOcean App Platform
1. Create new app from GitHub
2. Select Docker as runtime
3. Add environment variables
4. Deploy

#### AWS ECS/Fargate
```bash
# Build and push images to ECR
aws ecr get-login-password --region your-region | docker login --username AWS --password-stdin your-account.dkr.ecr.your-region.amazonaws.com

# Tag images
docker tag mean_frontend:latest your-account.dkr.ecr.your-region.amazonaws.com/mean-frontend:latest
docker tag mean_backend:latest your-account.dkr.ecr.your-region.amazonaws.com/mean-backend:latest

# Push images
docker push your-account.dkr.ecr.your-region.amazonaws.com/mean-frontend:latest
docker push your-account.dkr.ecr.your-region.amazonaws.com/mean-backend:latest

# Use AWS Copilot or ECS CLI to deploy
```

### 3. Docker Swarm/Kubernetes
```bash
# Docker Swarm
docker stack deploy -c docker-compose.yml mean-stack

# Kubernetes
kubectl apply -f k8s-manifests/
```

## Troubleshooting

### Common Issues

1. **Port already in use**:
   ```bash
   # Find process using port
   lsof -i :3000
   # Kill process or change port in docker-compose.yml
   ```

2. **MongoDB connection failed**:
   - Check MONGO_ROOT_PASSWORD in .env
   - Ensure MongoDB container is healthy: `docker-compose ps`
   - Check logs: `docker-compose logs mongodb`

3. **Frontend not loading**:
   - Verify backend is running: `curl http://localhost:3000/health`
   - Check nginx config in frontend container
   - Clear browser cache

4. **Build failures**:
   ```bash
   # Clean rebuild
   docker-compose build --no-cache
   # Check disk space
   docker system df
   ```

### Health Checks
```bash
# Check all services health
docker-compose ps

# Check specific service logs
docker-compose logs backend

# Test API endpoints
curl http://localhost:3000/api/health
curl http://localhost/api/
```

## Security Considerations

1. **Change default passwords** in `.env`
2. **Use strong JWT secrets**
3. **Don't expose MongoDB port in production** (remove from docker-compose.yml)
4. **Use HTTPS in production**
5. **Regular security updates**: `docker-compose pull`

## Performance Optimization

1. **Use multi-stage builds** (already implemented)
2. **Enable Docker layer caching**
3. **Use .dockerignore files**
4. **Optimize nginx configuration**
5. **Monitor resource usage**: `docker stats`

## Backup and Restore

### Database Backup
```bash
# Backup MongoDB
docker-compose exec mongodb mongodump --db crudapp --out /backup

# Copy backup to host
docker cp $(docker-compose ps -q mongodb):/backup ./mongodb_backup

# Restore
docker-compose exec -T mongodb mongorestore --db crudapp ./backup/crudapp
```

## Monitoring

```bash
# View resource usage
docker stats

# Monitor logs
docker-compose logs -f --tail=100

# Health check endpoints
curl http://localhost/health  # Frontend
curl http://localhost:3000/health  # Backend
```

## Support

If you encounter issues:
1. Check the logs: `docker-compose logs`
2. Verify environment variables
3. Ensure all required ports are available
4. Test individual services before full deployment
