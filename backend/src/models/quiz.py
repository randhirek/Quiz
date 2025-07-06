from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class QuizSession(db.Model):
    """Model for storing quiz session data"""
    __tablename__ = 'quiz_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(100), unique=True, nullable=False)
    user_name = db.Column(db.String(100), nullable=True)
    user_email = db.Column(db.String(120), nullable=True)
    start_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    end_time = db.Column(db.DateTime, nullable=True)
    total_questions = db.Column(db.Integer, nullable=False, default=120)
    questions_answered = db.Column(db.Integer, nullable=False, default=0)
    correct_answers = db.Column(db.Integer, nullable=False, default=0)
    score_percentage = db.Column(db.Float, nullable=True)
    time_taken_seconds = db.Column(db.Integer, nullable=True)
    is_completed = db.Column(db.Boolean, nullable=False, default=False)
    ip_address = db.Column(db.String(45), nullable=True)
    user_agent = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship to answers
    answers = db.relationship('QuizAnswer', backref='session', lazy=True, cascade='all, delete-orphan')
    category_scores = db.relationship('CategoryScore', backref='session', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'user_name': self.user_name,
            'user_email': self.user_email,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'total_questions': self.total_questions,
            'questions_answered': self.questions_answered,
            'correct_answers': self.correct_answers,
            'score_percentage': self.score_percentage,
            'time_taken_seconds': self.time_taken_seconds,
            'is_completed': self.is_completed,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class QuizAnswer(db.Model):
    """Model for storing individual question answers"""
    __tablename__ = 'quiz_answers'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(100), db.ForeignKey('quiz_sessions.session_id'), nullable=False)
    question_id = db.Column(db.Integer, nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    question_category = db.Column(db.String(100), nullable=False)
    user_answer = db.Column(db.Integer, nullable=False)  # 0-3 for A-D
    correct_answer = db.Column(db.Integer, nullable=False)  # 0-3 for A-D
    is_correct = db.Column(db.Boolean, nullable=False)
    answer_options = db.Column(db.Text, nullable=False)  # JSON string of options
    time_spent_seconds = db.Column(db.Integer, nullable=True)
    answered_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'question_id': self.question_id,
            'question_text': self.question_text,
            'question_category': self.question_category,
            'user_answer': self.user_answer,
            'correct_answer': self.correct_answer,
            'is_correct': self.is_correct,
            'answer_options': json.loads(self.answer_options) if self.answer_options else [],
            'time_spent_seconds': self.time_spent_seconds,
            'answered_at': self.answered_at.isoformat() if self.answered_at else None
        }

class CategoryScore(db.Model):
    """Model for storing category-wise scores"""
    __tablename__ = 'category_scores'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(100), db.ForeignKey('quiz_sessions.session_id'), nullable=False)
    category_name = db.Column(db.String(100), nullable=False)
    total_questions = db.Column(db.Integer, nullable=False, default=0)
    correct_answers = db.Column(db.Integer, nullable=False, default=0)
    score_percentage = db.Column(db.Float, nullable=False, default=0.0)
    
    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'category_name': self.category_name,
            'total_questions': self.total_questions,
            'correct_answers': self.correct_answers,
            'score_percentage': self.score_percentage
        }

class QuizAnalytics(db.Model):
    """Model for storing quiz analytics and statistics"""
    __tablename__ = 'quiz_analytics'
    
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow().date())
    total_sessions = db.Column(db.Integer, nullable=False, default=0)
    completed_sessions = db.Column(db.Integer, nullable=False, default=0)
    average_score = db.Column(db.Float, nullable=True)
    average_time_minutes = db.Column(db.Float, nullable=True)
    most_difficult_question = db.Column(db.Integer, nullable=True)
    easiest_question = db.Column(db.Integer, nullable=True)
    popular_categories = db.Column(db.Text, nullable=True)  # JSON string
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.isoformat() if self.date else None,
            'total_sessions': self.total_sessions,
            'completed_sessions': self.completed_sessions,
            'average_score': self.average_score,
            'average_time_minutes': self.average_time_minutes,
            'most_difficult_question': self.most_difficult_question,
            'easiest_question': self.easiest_question,
            'popular_categories': json.loads(self.popular_categories) if self.popular_categories else {},
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

