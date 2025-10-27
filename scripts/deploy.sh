#!/bin/bash

# Production deployment script with cache-busting
set -e

echo "🚀 Starting clean production deployment..."

# Step 1: Pull latest images (force refresh)
echo "📥 Pulling latest images..."
docker-compose -f docker-compose.yml pull --quiet

# Step 2: Stop and remove containers
echo "🛑 Stopping containers..."
docker-compose -f docker-compose.yml down

# Step 3: Remove dangling images and build cache (optional but recommended)
echo "🧹 Cleaning up dangling images..."
docker image prune -f

# Step 4: Build with no cache and pull latest base images
echo "🔨 Building with fresh cache..."
docker-compose -f docker-compose.yml build --no-cache --pull

# Step 5: Start services
echo "🚀 Starting services..."



# Step 6: Verify deployment
echo "✅ Verifying deployment..."
sleep 5
docker-compose -f docker-compose.yml ps

echo "🎉 Deployment complete!"