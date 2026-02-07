# Multi-stage build for Node.js backend
FROM node:18-alpine AS base

# Install dependencies for building
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM base AS builder
WORKDIR /app
COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

# Copy only production dependencies and built app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app . .

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Add healthcheck utility
COPY --from=builder /app/healthcheck.js ./healthcheck.js

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start application
CMD ["npm", "start"]