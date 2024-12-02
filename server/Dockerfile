# Stage 1: Install dependencies
FROM node:18 AS dependencies
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Stage 2: Copy application code
FROM node:18 AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN yarn add nodemon --dev || echo "Nodemon already installed" && yarn build || echo "No build step for backend"

# Stage 3: Production runtime
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 5000
CMD ["yarn", "start"]