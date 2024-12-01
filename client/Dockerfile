# Stage 1: Build the frontend
FROM node:18 AS builder 
WORKDIR /app

# Copy package.json (without yarn.lock) and install dependencies
COPY package.json ./
RUN yarn install

# Debugging step: Check Firebase installation
RUN yarn list --pattern firebase

# Copy all other files into the container
COPY . .

# Build the frontend application
RUN yarn build

# Stage 2: Serve the frontend
FROM nginx:1.25-alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder /app/dist .
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
