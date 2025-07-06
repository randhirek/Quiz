from flask import Blueprint, request, jsonify
from src.models.quiz import db, QuizSession, QuizAnswer, CategoryScore, QuizAnalytics
from datetime import datetime, date
import uuid
import json
from collections import defaultdict
from sqlalchemy import func

quiz_bp = Blueprint('quiz', __name__)

@quiz_bp.route('/start-session', methods=['POST'])
def start_quiz_session():
    """Start a new quiz session"""
    try:
        data = request.get_json() or {}
        
        # Generate unique session ID
        session_id = str(uuid.uuid4())
        
        # Get client info
        ip_address = request.environ.get('HTTP_X_FORWARDED_FOR', request.environ.get('REMOTE_ADDR'))
        user_agent = request.headers.get('User-Agent', '')
        
        # Create new session
        session = QuizSession(
            session_id=session_id,
            user_name=data.get('user_name'),
            user_email=data.get('user_email'),
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        db.session.add(session)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'message': 'Quiz session started successfully'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@quiz_bp.route('/save-answer', methods=['POST'])
def save_answer():
    """Save an individual question answer"""
    try:
        data = request.get_json()
        
        if not data or 'session_id' not in data:
            return jsonify({
                'success': False,
                'error': 'Session ID is required'
            }), 400
        
        # Verify session exists
        session = QuizSession.query.filter_by(session_id=data['session_id']).first()
        if not session:
            return jsonify({
                'success': False,
                'error': 'Invalid session ID'
            }), 404
        
        # Check if answer already exists for this question
        existing_answer = QuizAnswer.query.filter_by(
            session_id=data['session_id'],
            question_id=data['question_id']
        ).first()
        
        if existing_answer:
            # Update existing answer
            existing_answer.user_answer = data['user_answer']
            existing_answer.is_correct = data['user_answer'] == data['correct_answer']
            existing_answer.time_spent_seconds = data.get('time_spent_seconds')
            existing_answer.answered_at = datetime.utcnow()
        else:
            # Create new answer
            answer = QuizAnswer(
                session_id=data['session_id'],
                question_id=data['question_id'],
                question_text=data['question_text'],
                question_category=data['question_category'],
                user_answer=data['user_answer'],
                correct_answer=data['correct_answer'],
                is_correct=data['user_answer'] == data['correct_answer'],
                answer_options=json.dumps(data.get('answer_options', [])),
                time_spent_seconds=data.get('time_spent_seconds')
            )
            db.session.add(answer)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Answer saved successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@quiz_bp.route('/complete-session', methods=['POST'])
def complete_session():
    """Complete a quiz session and calculate final scores"""
    try:
        data = request.get_json()
        
        if not data or 'session_id' not in data:
            return jsonify({
                'success': False,
                'error': 'Session ID is required'
            }), 400
        
        session = QuizSession.query.filter_by(session_id=data['session_id']).first()
        if not session:
            return jsonify({
                'success': False,
                'error': 'Invalid session ID'
            }), 404
        
        # Get all answers for this session
        answers = QuizAnswer.query.filter_by(session_id=data['session_id']).all()
        
        # Calculate scores
        total_questions = len(answers)
        correct_answers = sum(1 for answer in answers if answer.is_correct)
        score_percentage = (correct_answers / total_questions * 100) if total_questions > 0 else 0
        
        # Calculate category scores
        category_stats = defaultdict(lambda: {'total': 0, 'correct': 0})
        for answer in answers:
            category_stats[answer.question_category]['total'] += 1
            if answer.is_correct:
                category_stats[answer.question_category]['correct'] += 1
        
        # Save category scores
        for category, stats in category_stats.items():
            category_percentage = (stats['correct'] / stats['total'] * 100) if stats['total'] > 0 else 0
            
            category_score = CategoryScore(
                session_id=data['session_id'],
                category_name=category,
                total_questions=stats['total'],
                correct_answers=stats['correct'],
                score_percentage=category_percentage
            )
            db.session.add(category_score)
        
        # Update session
        session.end_time = datetime.utcnow()
        session.questions_answered = total_questions
        session.correct_answers = correct_answers
        session.score_percentage = score_percentage
        session.time_taken_seconds = data.get('time_taken_seconds')
        session.is_completed = True
        session.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        # Update daily analytics
        update_daily_analytics()
        
        return jsonify({
            'success': True,
            'results': {
                'total_questions': total_questions,
                'correct_answers': correct_answers,
                'score_percentage': score_percentage,
                'time_taken_seconds': session.time_taken_seconds,
                'category_scores': {cat: stats for cat, stats in category_stats.items()}
            },
            'message': 'Quiz completed successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@quiz_bp.route('/session/<session_id>', methods=['GET'])
def get_session_results(session_id):
    """Get detailed results for a specific session"""
    try:
        session = QuizSession.query.filter_by(session_id=session_id).first()
        if not session:
            return jsonify({
                'success': False,
                'error': 'Session not found'
            }), 404
        
        # Get answers
        answers = QuizAnswer.query.filter_by(session_id=session_id).all()
        
        # Get category scores
        category_scores = CategoryScore.query.filter_by(session_id=session_id).all()
        
        return jsonify({
            'success': True,
            'session': session.to_dict(),
            'answers': [answer.to_dict() for answer in answers],
            'category_scores': [score.to_dict() for score in category_scores]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@quiz_bp.route('/analytics', methods=['GET'])
def get_analytics():
    """Get quiz analytics and statistics"""
    try:
        # Get query parameters
        days = request.args.get('days', 30, type=int)
        
        # Calculate date range
        end_date = date.today()
        start_date = date.fromordinal(end_date.toordinal() - days)
        
        # Get sessions in date range
        sessions = QuizSession.query.filter(
            QuizSession.created_at >= start_date,
            QuizSession.created_at <= end_date
        ).all()
        
        completed_sessions = [s for s in sessions if s.is_completed]
        
        # Calculate statistics
        total_sessions = len(sessions)
        completed_count = len(completed_sessions)
        completion_rate = (completed_count / total_sessions * 100) if total_sessions > 0 else 0
        
        if completed_sessions:
            avg_score = sum(s.score_percentage for s in completed_sessions) / len(completed_sessions)
            avg_time = sum(s.time_taken_seconds for s in completed_sessions if s.time_taken_seconds) / len([s for s in completed_sessions if s.time_taken_seconds])
            avg_time_minutes = avg_time / 60 if avg_time else 0
        else:
            avg_score = 0
            avg_time_minutes = 0
        
        # Get question difficulty analysis
        question_stats = db.session.query(
            QuizAnswer.question_id,
            QuizAnswer.question_text,
            func.count(QuizAnswer.id).label('total_attempts'),
            func.sum(QuizAnswer.is_correct.cast(db.Integer)).label('correct_attempts')
        ).group_by(QuizAnswer.question_id, QuizAnswer.question_text).all()
        
        question_difficulty = []
        for stat in question_stats:
            if stat.total_attempts > 0:
                success_rate = (stat.correct_attempts / stat.total_attempts) * 100
                question_difficulty.append({
                    'question_id': stat.question_id,
                    'question_text': stat.question_text,
                    'total_attempts': stat.total_attempts,
                    'success_rate': success_rate
                })
        
        # Sort by difficulty (lowest success rate = most difficult)
        question_difficulty.sort(key=lambda x: x['success_rate'])
        
        # Category performance
        category_stats = db.session.query(
            CategoryScore.category_name,
            func.avg(CategoryScore.score_percentage).label('avg_score'),
            func.count(CategoryScore.id).label('attempts')
        ).group_by(CategoryScore.category_name).all()
        
        category_performance = [
            {
                'category': stat.category_name,
                'average_score': round(stat.avg_score, 2),
                'attempts': stat.attempts
            }
            for stat in category_stats
        ]
        
        return jsonify({
            'success': True,
            'analytics': {
                'date_range': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat(),
                    'days': days
                },
                'overview': {
                    'total_sessions': total_sessions,
                    'completed_sessions': completed_count,
                    'completion_rate': round(completion_rate, 2),
                    'average_score': round(avg_score, 2),
                    'average_time_minutes': round(avg_time_minutes, 2)
                },
                'question_difficulty': question_difficulty[:10],  # Top 10 most difficult
                'category_performance': category_performance
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@quiz_bp.route('/export-data', methods=['GET'])
def export_data():
    """Export quiz data for analysis"""
    try:
        # Get query parameters
        format_type = request.args.get('format', 'json')
        session_id = request.args.get('session_id')
        
        if session_id:
            # Export specific session
            session = QuizSession.query.filter_by(session_id=session_id).first()
            if not session:
                return jsonify({'success': False, 'error': 'Session not found'}), 404
            
            answers = QuizAnswer.query.filter_by(session_id=session_id).all()
            category_scores = CategoryScore.query.filter_by(session_id=session_id).all()
            
            data = {
                'session': session.to_dict(),
                'answers': [answer.to_dict() for answer in answers],
                'category_scores': [score.to_dict() for score in category_scores]
            }
        else:
            # Export all data
            sessions = QuizSession.query.all()
            answers = QuizAnswer.query.all()
            category_scores = CategoryScore.query.all()
            
            data = {
                'sessions': [session.to_dict() for session in sessions],
                'answers': [answer.to_dict() for answer in answers],
                'category_scores': [score.to_dict() for score in category_scores]
            }
        
        if format_type == 'csv':
            # TODO: Implement CSV export
            return jsonify({'success': False, 'error': 'CSV export not implemented yet'}), 501
        
        return jsonify({
            'success': True,
            'data': data
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def update_daily_analytics():
    """Update daily analytics (called after each completed session)"""
    try:
        today = date.today()
        
        # Get or create today's analytics record
        analytics = QuizAnalytics.query.filter_by(date=today).first()
        if not analytics:
            analytics = QuizAnalytics(date=today)
            db.session.add(analytics)
        
        # Calculate today's stats
        today_sessions = QuizSession.query.filter(
            func.date(QuizSession.created_at) == today
        ).all()
        
        completed_today = [s for s in today_sessions if s.is_completed]
        
        analytics.total_sessions = len(today_sessions)
        analytics.completed_sessions = len(completed_today)
        
        if completed_today:
            analytics.average_score = sum(s.score_percentage for s in completed_today) / len(completed_today)
            valid_times = [s.time_taken_seconds for s in completed_today if s.time_taken_seconds]
            if valid_times:
                analytics.average_time_minutes = sum(valid_times) / len(valid_times) / 60
        
        db.session.commit()
        
    except Exception as e:
        print(f"Error updating daily analytics: {e}")
        db.session.rollback()

