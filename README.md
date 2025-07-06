# 🌿 Alkaline Lifestyle Quiz - Complete Application

A comprehensive full-stack web application for testing knowledge of alkaline living principles with 120 professionally crafted questions, real-time analytics, and private hosting capabilities.

![Quiz Preview](https://img.shields.io/badge/React-18.x-blue) ![Flask](https://img.shields.io/badge/Flask-3.x-green) ![SQLite](https://img.shields.io/badge/SQLite-3.x-orange) ![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

### 🎯 **Quiz Experience**
- **120 Comprehensive Questions** across 12 categories
- **Real-time Progress Tracking** with visual indicators
- **Category-based Organization** (Detoxification, pH Science, Nutrition, etc.)
- **Interactive Timer** with completion analytics
- **Responsive Design** for desktop, tablet, and mobile
- **Review Mode** with answer filtering and explanations
- **Offline Support** with graceful degradation

### 🗄️ **Data Storage & Analytics**
- **Complete Database System** with SQLite backend
- **Session Management** with unique tracking IDs
- **Real-time Answer Saving** with automatic backup
- **Performance Analytics** by category and question
- **Export Functionality** for data analysis
- **Privacy-focused** with local data control

### 🚀 **Deployment Options**
- **6 Hosting Solutions** from home servers to enterprise cloud
- **Automated Setup Scripts** for quick deployment
- **Docker Support** (coming soon)
- **SSL/HTTPS Configuration** with Let's Encrypt
- **Scalable Architecture** for any organization size

## 📁 Project Structure

```
alkaline-quiz-complete/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── data/           # Quiz questions and categories
│   │   ├── services/       # API integration
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
├── backend/                 # Flask API server
│   ├── src/
│   │   ├── models/         # Database models
│   │   ├── routes/         # API endpoints
│   │   ├── static/         # Built frontend files
│   │   └── main.py         # Application entry point
│   └── requirements.txt
├── docs/                   # Documentation
│   ├── private_hosting_guide.md
│   ├── google_forms_script_documentation.md
│   └── remove_required_questions.js
├── scripts/                # Deployment scripts
│   ├── setup-backend.sh
│   ├── setup-frontend.sh
│   └── deploy-fullstack.sh
└── README.md
```

## 🚀 Quick Start

### Option 1: Full-Stack Deployment (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd alkaline-quiz-complete

# Run the automated deployment script
./scripts/deploy-fullstack.sh

# Start the application
cd backend
source venv/bin/activate
python src/main.py
```

**Access your quiz at**: `http://localhost:5000`

### Option 2: Development Setup

#### Backend Setup
```bash
# Set up the Flask backend
./scripts/setup-backend.sh

# Start backend server
cd backend
source venv/bin/activate
python src/main.py
```

#### Frontend Setup (separate terminal)
```bash
# Set up the React frontend
./scripts/setup-frontend.sh

# Start development server
cd frontend
pnpm run dev
```

**Frontend**: `http://localhost:5173` | **Backend**: `http://localhost:5000`

## 📊 Database Schema

### Quiz Sessions
- Session ID, user info, timestamps
- Total score and completion time
- IP address and browser tracking

### Individual Answers
- Question-by-question responses
- Correct/incorrect tracking
- Time spent per question
- Category performance

### Analytics
- Daily completion statistics
- Question difficulty analysis
- Category performance trends
- Export capabilities

## 🔧 API Endpoints

### Quiz Operations
```http
POST /api/quiz/start-session     # Start new quiz session
POST /api/quiz/save-answer       # Save individual answer
POST /api/quiz/complete-session  # Complete quiz
GET  /api/quiz/session/{id}      # Get session results
```

### Analytics & Export
```http
GET  /api/quiz/analytics         # Get performance analytics
GET  /api/quiz/export-data       # Export quiz data
GET  /api/health                 # Health check
```

## 🏠 Private Hosting Options

### 🚀 **Quick Deploy (Beginner-Friendly)**
- **Heroku**: $7-25/month - Zero server management
- **Railway**: $0-20/month - Modern platform
- **Render**: $7-25/month - Full-stack friendly

### 💻 **Professional Control**
- **VPS (DigitalOcean/Linode)**: $5-50/month
- **AWS/Google Cloud**: $20-200+/month
- **Home Server**: $0-15/month - Maximum privacy

### 🏢 **Enterprise Solutions**
- **On-premises**: Complete control
- **Private cloud**: Hybrid approach
- **High-security**: Government/healthcare grade

*See `docs/private_hosting_guide.md` for detailed instructions.*


## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```bash
# Backend Configuration
SECRET_KEY=your-super-secret-key-here
DATABASE_URL=sqlite:///app.db
FLASK_ENV=production

# Optional: Email notifications
ADMIN_EMAIL=admin@yourcompany.com

# Optional: External database
# DATABASE_URL=postgresql://user:password@localhost/quizdb
```

### Frontend Configuration

Update `frontend/src/services/api.js` for production:

```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // Same domain as backend
  : 'http://localhost:5000/api';  // Development
```

## 🔒 Security Features

### Data Protection
- **Input Validation**: SQL injection prevention
- **CORS Protection**: Configured for secure cross-origin requests
- **Session Management**: Unique session IDs with expiration
- **Environment Variables**: Sensitive data protection

### Privacy Compliance
- **GDPR Ready**: Complete data control and export
- **HIPAA Compatible**: With proper server configuration
- **Local Storage**: No third-party data sharing
- **Audit Trails**: Complete activity logging

### Recommended Security Measures
- Use HTTPS/SSL in production
- Regular database backups
- Strong secret keys
- Firewall configuration
- Regular security updates

## 📈 Analytics & Monitoring

### Built-in Analytics
- **Completion Rates**: Track quiz success rates
- **Question Difficulty**: Identify challenging questions
- **Category Performance**: Subject-wise analysis
- **Time Analytics**: Average completion times
- **User Patterns**: Peak usage times

### Custom Analytics
```python
# Example: Get monthly completion rates
from backend.src.models.quiz import QuizSession
from sqlalchemy import func

monthly_stats = db.session.query(
    func.date_trunc('month', QuizSession.created_at).label('month'),
    func.count(QuizSession.id).label('total'),
    func.sum(QuizSession.is_completed.cast(db.Integer)).label('completed')
).group_by('month').all()
```

### Data Export
```bash
# Export all quiz data
curl http://localhost:5000/api/quiz/export-data

# Export specific session
curl http://localhost:5000/api/quiz/export-data?session_id=SESSION_ID
```

## 🛠️ Development

### Prerequisites
- **Python 3.8+** with pip
- **Node.js 18+** with npm/pnpm
- **Git** for version control

### Development Workflow

1. **Fork and Clone**
```bash
git clone <your-fork-url>
cd alkaline-quiz-complete
```

2. **Set up Development Environment**
```bash
# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend (new terminal)
cd frontend
pnpm install
```

3. **Start Development Servers**
```bash
# Backend (terminal 1)
cd backend && source venv/bin/activate && python src/main.py

# Frontend (terminal 2)
cd frontend && pnpm run dev
```

4. **Make Changes and Test**
- Backend changes: Restart Flask server
- Frontend changes: Hot reload automatically
- Database changes: Update models and restart

### Code Style
- **Python**: Follow PEP 8 guidelines
- **JavaScript**: ESLint configuration included
- **Commits**: Use conventional commit messages
- **Documentation**: Update README for new features

## 🧪 Testing

### Backend Testing
```bash
cd backend
source venv/bin/activate

# Test database connection
python -c "from src.main import app, db; app.app_context().push(); print('Database OK')"

# Test API endpoints
curl http://localhost:5000/api/health
```

### Frontend Testing
```bash
cd frontend

# Build test
pnpm run build

# Development server test
pnpm run dev
```

### Integration Testing
```bash
# Full-stack test
./scripts/deploy-fullstack.sh
cd backend && source venv/bin/activate && python src/main.py

# Test complete flow
curl http://localhost:5000/api/health
curl -X POST http://localhost:5000/api/quiz/start-session
```

## 📦 Production Deployment

### Heroku Deployment
```bash
# Prepare for Heroku
cd backend
git init
git add .
git commit -m "Initial commit"

# Deploy to Heroku
heroku create your-quiz-app
git push heroku main
heroku open
```

### VPS Deployment
```bash
# Upload to your server
scp -r alkaline-quiz-complete user@your-server:/home/user/

# SSH into server
ssh user@your-server
cd alkaline-quiz-complete

# Run deployment script
./scripts/deploy-fullstack.sh

# Set up as system service (optional)
sudo systemctl enable quiz-app
sudo systemctl start quiz-app
```

### Docker Deployment (Coming Soon)
```bash
# Build and run with Docker
docker-compose up -d

# Access at http://localhost:5000
```

## 🔧 Customization

### Adding New Questions
1. Edit `frontend/src/data/quizData.js`
2. Add questions following the existing format:
```javascript
{
  id: 121,
  question: "Your question here?",
  options: ["Option A", "Option B", "Option C", "Option D"],
  correctAnswer: 2, // Index of correct answer (0-3)
  category: "Your Category"
}
```

### Modifying Categories
1. Update `categories` array in `frontend/src/data/quizData.js`
2. Ensure all questions use valid category names
3. Update category colors in CSS if desired

### Custom Branding
1. Replace logo in `frontend/public/favicon.ico`
2. Update title in `frontend/index.html`
3. Modify colors in `frontend/src/App.css`
4. Update application name in `backend/src/main.py`

### Database Migration
```python
# Upgrade to PostgreSQL
pip install psycopg2-binary

# Update DATABASE_URL in .env
DATABASE_URL=postgresql://user:password@localhost/quizdb

# Run migration
python -c "from src.main import app, db; app.app_context().push(); db.create_all()"
```

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### How to Contribute
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Contribution Areas
- 🐛 **Bug Fixes**: Report and fix issues
- ✨ **New Features**: Quiz enhancements, analytics
- 📚 **Documentation**: Improve guides and examples
- 🎨 **UI/UX**: Design improvements
- 🔒 **Security**: Security enhancements
- 🌐 **Internationalization**: Multi-language support

### Code Review Process
1. All submissions require review
2. Automated tests must pass
3. Documentation must be updated
4. Follow existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Quiz Content**: Based on alkaline lifestyle principles
- **UI Components**: Built with Tailwind CSS and shadcn/ui
- **Icons**: Lucide React icon library
- **Backend**: Flask web framework
- **Database**: SQLAlchemy ORM

## 📞 Support

### Getting Help
- 📖 **Documentation**: Check `docs/` folder for detailed guides
- 🐛 **Issues**: Report bugs via GitHub Issues
- 💬 **Discussions**: Use GitHub Discussions for questions
- 📧 **Email**: Contact maintainers for urgent issues

### Common Issues
- **Database locked**: Stop application, backup database, restart
- **Port already in use**: Change port in configuration
- **Permission denied**: Check file permissions and user access
- **Module not found**: Ensure virtual environment is activated

### Performance Optimization
- **Large datasets**: Consider PostgreSQL migration
- **High traffic**: Implement caching and load balancing
- **Slow queries**: Add database indexes
- **Memory usage**: Monitor and optimize as needed

---

**Built with ❤️ for alkaline lifestyle education and assessment**

*For detailed deployment instructions, see `docs/private_hosting_guide.md`*

