// Global game state management for real-time data
interface GameState {
  totalXP: number;
  totalQuizzes: number;
  totalCorrectAnswers: number;
  totalQuestions: number;
  studyTime: number; // in minutes
  streak: number;
  level: number;
  achievements: string[];
  quizHistory: QuizResult[];
  lastUpdated: Date;
}

interface QuizResult {
  id: string;
  title: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timestamp: Date;
  answers: QuizAnswer[];
}

interface QuizAnswer {
  questionId: string;
  question: string;
  selectedAnswer: number;
  correctAnswer: number;
  options: string[];
  isCorrect: boolean;
  timeSpent: number;
}

class GameStateManager {
  private static instance: GameStateManager;
  private state: GameState;
  private listeners: Array<(state: GameState) => void> = [];

  constructor() {
    // Initialize with zero data - fresh start for all users
    this.state = {
      totalXP: 0,
      totalQuizzes: 0,
      totalCorrectAnswers: 0,
      totalQuestions: 0,
      studyTime: 0,
      streak: 0,
      level: 1,
      achievements: [],
      quizHistory: [],
      lastUpdated: new Date()
    };
    
    // Load from localStorage if available, but start fresh if no data
    this.loadState();
  }

  static getInstance(): GameStateManager {
    if (!GameStateManager.instance) {
      GameStateManager.instance = new GameStateManager();
    }
    return GameStateManager.instance;
  }

  subscribe(listener: (state: GameState) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  private saveState() {
    localStorage.setItem('gameState', JSON.stringify({
      ...this.state,
      lastUpdated: this.state.lastUpdated.toISOString()
    }));
  }

  private loadState() {
    const saved = localStorage.getItem('gameState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.state = {
          ...parsed,
          lastUpdated: new Date(parsed.lastUpdated),
          quizHistory: parsed.quizHistory?.map((quiz: any) => ({
            ...quiz,
            timestamp: new Date(quiz.timestamp)
          })) || []
        };
      } catch (error) {
        console.error('Failed to load game state:', error);
      }
    }
  }

  getState(): GameState {
    return { ...this.state };
  }

  addQuizResult(result: Omit<QuizResult, 'id' | 'timestamp'>) {
    const quizResult: QuizResult = {
      ...result,
      id: Date.now().toString(),
      timestamp: new Date()
    };

    const xpGained = this.calculateXP(result.score, result.difficulty, result.totalQuestions);
    
    this.state = {
      ...this.state,
      totalXP: this.state.totalXP + xpGained,
      totalQuizzes: this.state.totalQuizzes + 1,
      totalCorrectAnswers: this.state.totalCorrectAnswers + result.correctAnswers,
      totalQuestions: this.state.totalQuestions + result.totalQuestions,
      studyTime: this.state.studyTime + result.timeSpent,
      level: this.calculateLevel(this.state.totalXP + xpGained),
      quizHistory: [quizResult, ...this.state.quizHistory].slice(0, 50), // Keep last 50
      lastUpdated: new Date()
    };

    this.saveState();
    this.notifyListeners();
  }

  private calculateXP(score: number, difficulty: string, totalQuestions: number): number {
    const baseXP = totalQuestions * 10;
    const scoreMultiplier = score / 100;
    const difficultyMultiplier = { easy: 1, medium: 1.5, hard: 2 }[difficulty] || 1;
    
    return Math.round(baseXP * scoreMultiplier * difficultyMultiplier);
  }

  private calculateLevel(totalXP: number): number {
    return Math.floor(totalXP / 1000) + 1;
  }

  getCurrentAccuracy(): number {
    if (this.state.totalQuestions === 0) return 0;
    return Math.round((this.state.totalCorrectAnswers / this.state.totalQuestions) * 100);
  }

  getRecentPerformance(): number[] {
    return this.state.quizHistory
      .slice(0, 7)
      .map(quiz => Math.round((quiz.correctAnswers / quiz.totalQuestions) * 100))
      .reverse();
  }

  addStudyTime(minutes: number) {
    this.state = {
      ...this.state,
      studyTime: this.state.studyTime + minutes,
      lastUpdated: new Date()
    };
    this.saveState();
    this.notifyListeners();
  }

  resetData() {
    this.state = {
      totalXP: 0,
      totalQuizzes: 0,
      totalCorrectAnswers: 0,
      totalQuestions: 0,
      studyTime: 0,
      streak: 0,
      level: 1,
      achievements: [],
      quizHistory: [],
      lastUpdated: new Date()
    };
    this.saveState();
    this.notifyListeners();
  }
}

export { GameStateManager, type GameState, type QuizResult, type QuizAnswer };