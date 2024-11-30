# Docker image names
FRONTEND_IMAGE=bayajid23/scalable-todo-client
BACKEND_IMAGE=bayajid23/scalable-todo-server

# Directories
FRONTEND_DIR=client
BACKEND_DIR=server

.PHONY: build-frontend build-backend push-frontend push-backend build-all push-all clean

# Build the frontend image
build-frontend:
	docker build -t $(FRONTEND_IMAGE):latest -f $(FRONTEND_DIR)/Dockerfile $(FRONTEND_DIR)

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
	docker rmi $(FRONTEND_IMAGE):latest $(BACKEND_IMAGE):latest || true
