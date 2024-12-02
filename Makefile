# Docker image names
FRONTEND_IMAGE=bayajid23/simply-done-client
BACKEND_IMAGE=bayajid23/simply-done-server

# Directories
FRONTEND_DIR=client
BACKEND_DIR=server

.PHONY: build-frontend build-backend push-frontend push-backend build-all push-all clean clear up down logs

# Build the frontend image
build-frontend:
	docker build -t $(FRONTEND_IMAGE):latest -f $(FRONTEND_DIR)/Dockerfile $(FRONTEND_DIR)

#--no-cache

# Build the backend image
build-backend:
	docker build -t $(BACKEND_IMAGE):latest -f $(BACKEND_DIR)/Dockerfile $(BACKEND_DIR)

# Push the frontend image to Docker Hub
push-frontend: build-frontend
	docker push $(FRONTEND_IMAGE):latest

# Push the backend image to Docker Hub
push-backend: build-backend
	docker push $(BACKEND_IMAGE):latest

# Build both images
build-all: build-frontend build-backend

# Push both images
push-all: push-frontend push-backend

# Clean up local Docker images
clean:
	@echo "Cleaning up local Docker images..."
	docker rmi $(FRONTEND_IMAGE):latest $(BACKEND_IMAGE):latest || echo "No images to remove"

# Run both containers using docker-compose
up:
	docker-compose up -d

# Stop and remove containers, networks, and volumes created by docker-compose
down:
	docker-compose down -v --remove-orphans

# Tail logs from docker-compose
logs:
	docker-compose logs -f
