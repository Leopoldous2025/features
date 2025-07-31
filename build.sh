#!/bin/bash
set -e

echo "🔧 Starting Nuxt build process..."

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm ci

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npx prisma generate

# Prepare Nuxt (generates TypeScript configs)
echo "⚙️ Preparing Nuxt..."
npx nuxt prepare

# Build the application
echo "🚀 Building Nuxt application..."
npx nuxt build

echo "✅ Build completed successfully!" 