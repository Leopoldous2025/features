# Stage 1: Build Stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (including devDependencies for the build)
RUN npm ci

# Copy the rest of the application source code
COPY . .

# [CRITICAL FIX] Run nuxt prepare to generate all necessary types and configs
# This is the step that was failing on all platforms
RUN npm run postinstall

# Build the Nuxt application for production
RUN npm run build

# Stage 2: Production Stage
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy production dependencies from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy the built Nuxt application output
COPY --from=builder /app/.output ./.output

# Copy Prisma schema for the production environment
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# The command to run the application
CMD [ "node", ".output/server/index.mjs" ] 