// API service for quiz backend communication
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';

class QuizAPI {
  constructor() {
    this.sessionId = null;
    this.baseURL = API_BASE_URL;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Start a new quiz session
  async startSession(userData = {}) {
    try {
      const response = await this.makeRequest('/quiz/start-session', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      
      if (response.success) {
        this.sessionId = response.session_id;
        localStorage.setItem('quiz_session_id', this.sessionId);
      }
      
      return response;
    } catch (error) {
      console.error('Failed to start session:', error);
      throw error;
    }
  }

  // Save an individual answer
  async saveAnswer(questionData) {
    if (!this.sessionId) {
      throw new Error('No active session. Please start a new quiz session.');
    }

    try {
      const response = await this.makeRequest('/quiz/save-answer', {
        method: 'POST',
        body: JSON.stringify({
          session_id: this.sessionId,
          ...questionData,
        }),
      });
      
      return response;
    } catch (error) {
      console.error('Failed to save answer:', error);
      throw error;
    }
  }

  // Complete the quiz session
  async completeSession(timeTakenSeconds) {
    if (!this.sessionId) {
      throw new Error('No active session to complete.');
    }

    try {
      const response = await this.makeRequest('/quiz/complete-session', {
        method: 'POST',
        body: JSON.stringify({
          session_id: this.sessionId,
          time_taken_seconds: timeTakenSeconds,
        }),
      });
      
      return response;
    } catch (error) {
      console.error('Failed to complete session:', error);
      throw error;
    }
  }

  // Get session results
  async getSessionResults(sessionId = null) {
    const targetSessionId = sessionId || this.sessionId;
    
    if (!targetSessionId) {
      throw new Error('No session ID provided.');
    }

    try {
      const response = await this.makeRequest(`/quiz/session/${targetSessionId}`);
      return response;
    } catch (error) {
      console.error('Failed to get session results:', error);
      throw error;
    }
  }

  // Get analytics data
  async getAnalytics(days = 30) {
    try {
      const response = await this.makeRequest(`/quiz/analytics?days=${days}`);
      return response;
    } catch (error) {
      console.error('Failed to get analytics:', error);
      throw error;
    }
  }

  // Export data
  async exportData(sessionId = null, format = 'json') {
    try {
      const params = new URLSearchParams({ format });
      if (sessionId) {
        params.append('session_id', sessionId);
      }
      
      const response = await this.makeRequest(`/quiz/export-data?${params}`);
      return response;
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.makeRequest('/health');
      return response;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  // Restore session from localStorage
  restoreSession() {
    const savedSessionId = localStorage.getItem('quiz_session_id');
    if (savedSessionId) {
      this.sessionId = savedSessionId;
      return true;
    }
    return false;
  }

  // Clear session
  clearSession() {
    this.sessionId = null;
    localStorage.removeItem('quiz_session_id');
  }

  // Get current session ID
  getSessionId() {
    return this.sessionId;
  }

  // Check if session is active
  hasActiveSession() {
    return !!this.sessionId;
  }
}

// Create and export a singleton instance
const quizAPI = new QuizAPI();

// Try to restore session on load
quizAPI.restoreSession();

export default quizAPI;

