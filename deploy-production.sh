#!/bin/bash

# TruSanity Analytics - Production Deployment Script
# Usage: ./deploy-production.sh

set -e  # Exit on any error

echo "🚀 Starting TruSanity Analytics Production Deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/path/to/TruSanity_Analytics"  # Update this path
COMPOSE_FILE="infra/docker-compose.yml"

echo -e "${YELLOW}📦 Pulling latest code...${NC}"
git pull origin main

echo -e "${YELLOW}🛑 Stopping existing services...${NC}"
docker compose -f $COMPOSE_FILE down

echo -e "${YELLOW}🔨 Building Docker images...${NC}"
docker compose -f $COMPOSE_FILE build --no-cache

echo -e "${YELLOW}🚀 Starting services...${NC}"
docker compose -f $COMPOSE_FILE up -d

echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 10

echo -e "${YELLOW}📊 Checking service status...${NC}"
docker compose -f $COMPOSE_FILE ps

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"

echo -e "${YELLOW}📝 Checking logs for errors...${NC}"
docker compose -f $COMPOSE_FILE logs --tail=50 api
docker compose -f $COMPOSE_FILE logs --tail=50 consumer

echo -e "${GREEN}🎉 TruSanity Analytics is now running!${NC}"
echo -e "${YELLOW}Monitor logs with: docker compose -f $COMPOSE_FILE logs -f${NC}"
