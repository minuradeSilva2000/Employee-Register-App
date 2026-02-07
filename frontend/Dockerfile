# Multi-stage build for React app with optimization
FROM node:18-alpine AS base
WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY package*.json ./
RUN npm ci --silent && npm cache clean --force

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY . .

# Build arguments for environment variables
ARG VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_ENV

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_ENV=$VITE_ENV

# Build application with optimizations
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app from build stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Add nginx optimizations
RUN echo "server_tokens off;" >> /etc/nginx/conf.d/default.conf && \
    echo "gzip on;" >> /etc/nginx/conf.d/default.conf && \
    echo "gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;" >> /etc/nginx/conf.d/default.conf

# Create non-root user
RUN addgroup -g 1001 -S nginx && \
    adduser -S nginx -u 1001

# Change ownership
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Switch to non-root user
USER nginx

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]