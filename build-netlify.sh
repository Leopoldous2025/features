#!/bin/bash
set -e

echo "🔧 Starting SIMPLIFIED Netlify build (no TypeScript prep)..."

# Ensure we're in the right directory
cd "$(dirname "$0")"

echo "📦 Installing dependencies..."
npm ci

echo "🗄️ Generating Prisma client..."
npx prisma generate

echo "🚀 Building Nuxt directly (skipping TypeScript prep)..."
NODE_OPTIONS="--max-old-space-size=4096" npx nuxt build

echo "✅ Build completed successfully!" 