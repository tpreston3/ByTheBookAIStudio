# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies (using npm ci for deterministic builds)
RUN npm ci

# Copy source code
COPY . .

# Build the application
# Accept the API key as a build argument
ARG GEMINI_API_KEY
# Set it as an environment variable so Vite can access it during build
ENV GEMINI_API_KEY=$GEMINI_API_KEY
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
