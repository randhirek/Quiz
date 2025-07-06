#!/bin/bash

# Alkaline Quiz Frontend Setup Script
# This script sets up the React frontend for the quiz application

echo "🚀 Setting up Alkaline Quiz Frontend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

# Navigate to frontend directory
cd "$(dirname "$0")/../frontend" || exit 1

echo "📥 Installing dependencies..."
pnpm install

echo "✅ Frontend setup complete!"
echo ""
echo "To start the development server:"
echo "  cd frontend"
echo "  pnpm run dev"
echo ""
echo "To build for production:"
echo "  cd frontend"
echo "  pnpm run build"
echo ""
echo "The frontend will be available at: http://localhost:5173"

