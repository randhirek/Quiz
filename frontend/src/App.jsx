import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { CheckCircle, XCircle, RotateCcw, Trophy, BookOpen, Clock, FileText, Award, TrendingUp, Save, Database } from 'lucide-react'
import { quizData, categories } from './data/quizData.js'
import { QuizReview } from './components/QuizReview.jsx'
import quizAPI from './services/api.js'
import './App.css'

function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [backendConnected, setBackendConnected] = useState(false)
  const [savingData, setSavingData] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [backendResults, setBackendResults] = useState(null)

  // Timer effect
  useEffect(() => {
    let interval = null
    if (quizStarted && !showResults && startTime) {
      interval = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [quizStarted, showResults, startTime])

  // Backend connection check
  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        await quizAPI.healthCheck()
        setBackendConnected(true)
        
        // Restore session if exists
        if (quizAPI.hasActiveSession()) {
          setSessionId(quizAPI.getSessionId())
        }
      } catch (error) {
        console.warn('Backend not available, running in offline mode:', error)
        setBackendConnected(false)
      }
    }
    
    checkBackendConnection()
  }, [])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerSelect = async (answerIndex) => {
    const newAnswers = {
      ...selectedAnswers,
      [currentQuestion]: answerIndex
    }
    setSelectedAnswers(newAnswers)

    // Save to backend if connected
    if (backendConnected && sessionId) {
      try {
        setSavingData(true)
        const question = quizData[currentQuestion]
        
        await quizAPI.saveAnswer({
          question_id: question.id,
          question_text: question.question,
          question_category: question.category,
          user_answer: answerIndex,
          correct_answer: question.correctAnswer,
          answer_options: question.options,
          time_spent_seconds: Math.floor((Date.now() - startTime) / 1000)
        })
      } catch (error) {
        console.error('Failed to save answer to backend:', error)
      } finally {
        setSavingData(false)
      }
    }
  }

  const handleNext = async () => {
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Complete the quiz
      if (backendConnected && sessionId) {
        try {
          setSavingData(true)
          const response = await quizAPI.completeSession(timeElapsed)
          setBackendResults(response.results)
        } catch (error) {
          console.error('Failed to complete session on backend:', error)
        } finally {
          setSavingData(false)
        }
      }
      setShowResults(true)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const calculateResults = () => {
    let correct = 0
    let categoryScores = {}
    
    categories.forEach(cat => {
      categoryScores[cat] = { correct: 0, total: 0 }
    })

    quizData.forEach((question, index) => {
      const userAnswer = selectedAnswers[index]
      const isCorrect = userAnswer === question.correctAnswer
      
      if (isCorrect) correct++
      
      categoryScores[question.category].total++
      if (isCorrect) {
        categoryScores[question.category].correct++
      }
    })

    return {
      totalCorrect: correct,
      totalQuestions: quizData.length,
      percentage: Math.round((correct / quizData.length) * 100),
      categoryScores
    }
  }

  const restartQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswers({})
    setShowResults(false)
    setShowReview(false)
    setQuizStarted(false)
    setTimeElapsed(0)
    setStartTime(null)
    setBackendResults(null)
    
    // Clear backend session
    if (backendConnected) {
      quizAPI.clearSession()
      setSessionId(null)
    }
  }

  const startQuiz = async () => {
    setQuizStarted(true)
    setStartTime(Date.now())
    
    // Start backend session if connected
    if (backendConnected) {
      try {
        const response = await quizAPI.startSession({
          user_name: 'Anonymous User', // Could be made configurable
          user_email: null
        })
        
        if (response.success) {
          setSessionId(response.session_id)
        }
      } catch (error) {
        console.error('Failed to start backend session:', error)
      }
    }
  }

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 80) return 'text-blue-600'
    if (percentage >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLevel = (percentage) => {
    if (percentage >= 90) return 'Expert Level'
    if (percentage >= 80) return 'Advanced'
    if (percentage >= 70) return 'Proficient'
    if (percentage >= 60) return 'Basic'
    return 'Needs Improvement'
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-800">
              Alkaline Lifestyle Quiz
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Test your knowledge of alkaline living principles with 120 comprehensive questions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">120</div>
                <div className="text-sm text-gray-600">Questions</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">12</div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">45-60</div>
                <div className="text-sm text-gray-600">Minutes</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">Quiz Categories:</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Instructions:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Choose the best answer for each question</li>
                <li>• You can navigate back and forth between questions</li>
                <li>• Your progress is automatically saved</li>
                <li>• Take your time - there's no time limit</li>
              </ul>
            </div>

            {/* Backend Status */}
            <div className={`p-4 rounded-lg border ${backendConnected ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Database className={`w-5 h-5 ${backendConnected ? 'text-green-600' : 'text-orange-600'}`} />
                <h3 className={`font-semibold ${backendConnected ? 'text-green-800' : 'text-orange-800'}`}>
                  Data Storage: {backendConnected ? 'Connected' : 'Offline Mode'}
                </h3>
              </div>
              <p className={`text-sm ${backendConnected ? 'text-green-700' : 'text-orange-700'}`}>
                {backendConnected 
                  ? '✅ Your answers will be saved to the database for analytics and review.'
                  : '⚠️ Running in offline mode. Answers will only be stored locally in your browser.'
                }
              </p>
            </div>

            <Button 
              onClick={startQuiz} 
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
            >
              Start Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showReview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <QuizReview 
            selectedAnswers={selectedAnswers} 
            onClose={() => setShowReview(false)} 
          />
        </div>
      </div>
    )
  }

  if (showResults) {
    const results = calculateResults()
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Trophy className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-3xl font-bold">Quiz Complete!</CardTitle>
              <CardDescription>Here are your results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className={`text-3xl font-bold ${getScoreColor(results.percentage)}`}>
                    {results.percentage}%
                  </div>
                  <div className="text-sm text-gray-600">Overall Score</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {results.totalCorrect}/{results.totalQuestions}
                  </div>
                  <div className="text-sm text-gray-600">Correct Answers</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">
                    {getScoreLevel(results.percentage)}
                  </div>
                  <div className="text-sm text-gray-600">Performance Level</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600">
                    {formatTime(timeElapsed)}
                  </div>
                  <div className="text-sm text-gray-600">Time Taken</div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">Category Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(results.categoryScores).map(([category, scores]) => {
                    const percentage = scores.total > 0 ? Math.round((scores.correct / scores.total) * 100) : 0
                    return (
                      <div key={category} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{category}</span>
                          <span className={`font-bold ${getScoreColor(percentage)}`}>
                            {percentage}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>{scores.correct}/{scores.total} correct</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button onClick={() => setShowReview(true)} variant="outline" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Review Answers
                </Button>
                <Button onClick={restartQuiz} variant="outline" className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Retake Quiz
                </Button>
              </div>

              {/* Performance Insights */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance Insights
                </h3>
                <div className="text-sm text-blue-700 space-y-1">
                  {results.percentage >= 90 && (
                    <p>🎉 Excellent! You have expert-level knowledge of alkaline lifestyle principles.</p>
                  )}
                  {results.percentage >= 80 && results.percentage < 90 && (
                    <p>👏 Great job! You have advanced understanding with room for minor improvements.</p>
                  )}
                  {results.percentage >= 70 && results.percentage < 80 && (
                    <p>✅ Good work! You have proficient knowledge. Review the areas where you missed questions.</p>
                  )}
                  {results.percentage >= 60 && results.percentage < 70 && (
                    <p>📚 You have basic understanding. Consider studying the fundamental concepts more deeply.</p>
                  )}
                  {results.percentage < 60 && (
                    <p>🎯 This is a great learning opportunity! Review the material and retake the quiz to improve.</p>
                  )}
                  <p>💡 Use the "Review Answers" button to see detailed explanations and identify areas for improvement.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const question = quizData[currentQuestion]
  const progress = ((currentQuestion + 1) / quizData.length) * 100
  const selectedAnswer = selectedAnswers[currentQuestion]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Alkaline Lifestyle Quiz</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTime(timeElapsed)}
              </div>
              {backendConnected && (
                <div className="flex items-center gap-1">
                  <Database className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">Connected</span>
                </div>
              )}
              {savingData && (
                <div className="flex items-center gap-1">
                  <Save className="w-4 h-4 text-blue-600 animate-pulse" />
                  <span className="text-blue-600">Saving...</span>
                </div>
              )}
              <Badge variant="outline">
                Question {currentQuestion + 1} of {quizData.length}
              </Badge>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start mb-2">
              <Badge variant="secondary">{question.category}</Badge>
              <span className="text-sm text-gray-500">
                Question {currentQuestion + 1}
              </span>
            </div>
            <CardTitle className="text-xl leading-relaxed">
              {question.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-4 text-left border rounded-lg transition-all hover:border-blue-300 ${
                    selectedAnswer === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedAnswer === index
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedAnswer === index && (
                        <div className="w-3 h-3 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="font-medium text-gray-700">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className="text-gray-800">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            variant="outline"
          >
            Previous
          </Button>
          
          <div className="text-sm text-gray-600">
            {Object.keys(selectedAnswers).length} of {quizData.length} answered
          </div>

          <Button
            onClick={handleNext}
            disabled={selectedAnswer === undefined}
            className="bg-green-600 hover:bg-green-700"
          >
            {currentQuestion === quizData.length - 1 ? 'Finish Quiz' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default App

