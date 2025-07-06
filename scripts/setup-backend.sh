#!/bin/bash

# Alkaline Quiz Backend Setup Script
# This script sets up the Flask backend for the quiz application

echo "🚀 Setting up Alkaline Quiz Backend..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Navigate to backend directory
cd "$(dirname "$0")/../backend" || exit 1

echo "📦 Creating virtual environment..."
python3 -m venv venv

echo "🔧 Activating virtual environment..."
source venv/bin/activate

echo "📥 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "🗄️ Setting up database..."
python -c "
from src.main import app, db
with app.app_context():
    db.create_all()
    print('Database tables created successfully!')
"

echo "✅ Backend setup complete!"
echo ""
echo "To start the backend server:"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  python src/main.py"
echo ""
echo "The backend will be available at: http://localhost:5000"

