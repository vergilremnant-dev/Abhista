# ========================================================
# Stage 1: Dependency Installation & Application Build
# ========================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install standard build packages (Alpine compatibility)
RUN apk add --no-cache libc6-compat

# Copy package config and lock files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including devDependencies for building)
RUN npm ci

# Copy full application codebase
COPY . .

# Generate Prisma client and build frontend assets
RUN npx prisma generate
RUN npm run build

# Prune devDependencies to keep container size minimal
RUN npm prune --production

# ========================================================
# Stage 2: Runtime Production Image
# ========================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment
ENV NODE_ENV=production

# Install curl for docker healthcheck checks
RUN apk add --no-cache curl

# Run as non-privileged system user for security hardening
USER node

# Copy build artifacts and dependencies from stage 1
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/api ./api
COPY --chown=node:node --from=builder /app/prisma ./prisma
COPY --chown=node:node --from=builder /app/api-dev-server.js ./api-dev-server.js

# Expose server port
EXPOSE 5174

# Configure periodic container health checking
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5174/api/health || exit 1

# Start production API / dev-server
CMD ["node", "api-dev-server.js"]
