#!/bin/bash

# Alkaline Quiz Full-Stack Deployment Script
# This script builds the frontend and integrates it with the backend for deployment

echo "🚀 Deploying Alkaline Quiz Full-Stack Application..."

# Navigate to project root
cd "$(dirname "$0")/.." || exit 1

echo "🏗️ Building frontend..."
cd frontend
pnpm install
pnpm run build

echo "📁 Copying frontend build to backend static directory..."
cd ..
rm -rf backend/src/static/*
cp -r frontend/dist/* backend/src/static/

echo "🔧 Setting up backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo "🗄️ Initializing database..."
python -c "
from src.main import app, db
with app.app_context():
    db.create_all()
    print('Database initialized!')
"

echo "✅ Full-stack deployment complete!"
echo ""
echo "To start the application:"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  python src/main.py"
echo ""
echo "The complete application will be available at: http://localhost:5000"
echo "This includes both the frontend and backend with data storage."

