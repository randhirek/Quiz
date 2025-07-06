import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { quizData } from '../data/quizData.js'

export function QuizReview({ selectedAnswers, onClose }) {
  const [expandedQuestions, setExpandedQuestions] = useState(new Set())
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterResult, setFilterResult] = useState('all') // all, correct, incorrect

  const toggleQuestion = (questionId) => {
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId)
    } else {
      newExpanded.add(questionId)
    }
    setExpandedQuestions(newExpanded)
  }

  const getFilteredQuestions = () => {
    return quizData.filter((question, index) => {
      const userAnswer = selectedAnswers[index]
      const isCorrect = userAnswer === question.correctAnswer
      
      // Category filter
      if (filterCategory !== 'all' && question.category !== filterCategory) {
        return false
      }
      
      // Result filter
      if (filterResult === 'correct' && !isCorrect) return false
      if (filterResult === 'incorrect' && isCorrect) return false
      
      return true
    })
  }

  const categories = [...new Set(quizData.map(q => q.category))]
  const filteredQuestions = getFilteredQuestions()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quiz Review</h2>
        <Button onClick={onClose} variant="outline">
          Back to Results
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Result</label>
              <select
                value={filterResult}
                onChange={(e) => setFilterResult(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="all">All Questions</option>
                <option value="correct">Correct Only</option>
                <option value="incorrect">Incorrect Only</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <div className="space-y-4">
        <p className="text-gray-600">
          Showing {filteredQuestions.length} of {quizData.length} questions
        </p>
        
        {filteredQuestions.map((question, originalIndex) => {
          const questionIndex = quizData.findIndex(q => q.id === question.id)
          const userAnswer = selectedAnswers[questionIndex]
          const isCorrect = userAnswer === question.correctAnswer
          const isExpanded = expandedQuestions.has(question.id)
          
          return (
            <Card key={question.id} className={`border-l-4 ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <Badge variant="secondary">{question.category}</Badge>
                      <span className="text-sm text-gray-500">Question {questionIndex + 1}</span>
                    </div>
                    <h3 className="font-medium text-gray-900 leading-relaxed">
                      {question.question}
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleQuestion(question.id)}
                    className="ml-4"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {question.options.map((option, optionIndex) => {
                      const isUserAnswer = userAnswer === optionIndex
                      const isCorrectAnswer = question.correctAnswer === optionIndex
                      
                      let bgColor = 'bg-gray-50'
                      let textColor = 'text-gray-700'
                      let borderColor = 'border-gray-200'
                      
                      if (isCorrectAnswer) {
                        bgColor = 'bg-green-50'
                        textColor = 'text-green-800'
                        borderColor = 'border-green-200'
                      } else if (isUserAnswer && !isCorrect) {
                        bgColor = 'bg-red-50'
                        textColor = 'text-red-800'
                        borderColor = 'border-red-200'
                      }
                      
                      return (
                        <div
                          key={optionIndex}
                          className={`p-3 border rounded-lg ${bgColor} ${borderColor}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-medium">
                              {String.fromCharCode(65 + optionIndex)}.
                            </span>
                            <span className={textColor}>{option}</span>
                            <div className="ml-auto flex gap-2">
                              {isCorrectAnswer && (
                                <Badge variant="default" className="bg-green-600">
                                  Correct
                                </Badge>
                              )}
                              {isUserAnswer && (
                                <Badge variant="outline">
                                  Your Answer
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

