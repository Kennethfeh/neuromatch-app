# multi-stage build - reduces final image size 
# WHY: smaller images = faster deployments, less attack surface 


# Stage 1: Build stage
FROM node:18-alpine AS builder


WORKDIR /app


# copy package files first (docker layer caching)
# WHY: depencies don't change often, so this layer is cached

COPY package.json ./

# Install dependencies

RUN npm install --omit=dev


# Stage 2: Runtime stage
FROM node:18-alpine 


# create non-root user for security
# WHY: HIPAA requirement - don't run as root 
RUN addgroup -g 1001 -S nodedj && \
    adduser -S nodejs -u 1001

WORKDIR  /app

# Copy dependencies from builder image
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules


# Copy application code 
COPY --chown=nodejs:nodejs src  ./src 
COPY --chown=nodejs:nodejs package*.json  ./

# switch to non-root user

USER nodejs

# Expose port
EXPOSE 8080 

# Health check - Docker can check if container is healthy
# WHY: Container orchestration uses this 

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
     CMD node -e "require('http').get('http://localhost:8080/health', (r) =>  {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["npm", "start"]
