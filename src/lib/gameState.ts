// Global game state management for real-time data with Supabase integration
import { supabase } from '@/integrations/supabase/client';

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
  private isAuthenticated: boolean = false;

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
    
    this.initializeAuth();
    this.loadState();
  }

  private async initializeAuth() {
    // Check current session
    const { data: { session } } = await supabase.auth.getSession();
    this.isAuthenticated = !!session;

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      this.isAuthenticated = !!session;
      if (event === 'SIGNED_IN' && session) {
        await this.loadFromDatabase();
      } else if (event === 'SIGNED_OUT') {
        this.resetState();
      }
    });
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

  private async saveToDatabase() {
    if (!this.isAuthenticated) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const profileData = {
        user_id: user.id,
        total_xp: this.state.totalXP,
        total_quizzes: this.state.totalQuizzes,
        total_correct_answers: this.state.totalCorrectAnswers,
        total_questions: this.state.totalQuestions,
        study_time: this.state.studyTime,
        streak: this.state.streak,
        level: this.state.level,
        quiz_history: JSON.stringify(this.state.quizHistory) as any,
        achievements: this.state.achievements
      };

      const { error } = await supabase
        .from('user_profiles')
        .upsert(profileData, { onConflict: 'user_id' });

      if (error) {
        console.error('Failed to save to database:', error);
      }
    } catch (error) {
      console.error('Database save error:', error);
    }
  }

  private async loadFromDatabase() {
    if (!this.isAuthenticated) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Failed to load from database:', error);
        return;
      }

      if (profile) {
        const quizHistory = typeof profile.quiz_history === 'string' 
          ? JSON.parse(profile.quiz_history) 
          : Array.isArray(profile.quiz_history) 
            ? profile.quiz_history 
            : [];

        this.state = {
          totalXP: profile.total_xp || 0,
          totalQuizzes: profile.total_quizzes || 0,
          totalCorrectAnswers: profile.total_correct_answers || 0,
          totalQuestions: profile.total_questions || 0,
          studyTime: profile.study_time || 0,
          streak: profile.streak || 0,
          level: profile.level || 1,
          achievements: profile.achievements || [],
          quizHistory: quizHistory.map((quiz: any) => ({
            ...quiz,
            timestamp: new Date(quiz.timestamp)
          })),
          lastUpdated: new Date()
        };
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Database load error:', error);
    }
  }

  private saveState() {
    // Still keep localStorage as backup
    localStorage.setItem('gameState', JSON.stringify({
      ...this.state,
      lastUpdated: this.state.lastUpdated.toISOString()
    }));
    
    // Save to database if authenticated
    this.saveToDatabase();
  }

  private loadState() {
    // Load from localStorage first (fallback/cache)
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
        console.error('Failed to load game state from localStorage:', error);
      }
    }

    // Then try to load from database if authenticated
    if (this.isAuthenticated) {
      this.loadFromDatabase();
    }
  }

  getState(): GameState {
    return { ...this.state };
  }

  async addQuizResult(result: Omit<QuizResult, 'id' | 'timestamp'>) {
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

    // Save quiz session to database
    if (this.isAuthenticated) {
      await this.saveQuizSession(quizResult);
    }

    this.saveState();
    this.notifyListeners();
  }

  private async saveQuizSession(quiz: QuizResult) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('quiz_sessions')
        .insert({
          user_id: user.id,
          title: quiz.title,
          subject: quiz.subject,
          difficulty: quiz.difficulty,
          total_questions: quiz.totalQuestions,
          correct_answers: quiz.correctAnswers,
          time_spent: quiz.timeSpent,
          score: quiz.score,
          answers: JSON.stringify(quiz.answers) as any
        });

      if (error) {
        console.error('Failed to save quiz session:', error);
      }
    } catch (error) {
      console.error('Quiz session save error:', error);
    }
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

  async addStudyTime(minutes: number) {
    this.state = {
      ...this.state,
      studyTime: this.state.studyTime + minutes,
      lastUpdated: new Date()
    };
    this.saveState();
    this.notifyListeners();
  }

  async addResearchActivity(type: 'search' | 'analysis', query?: string, analysisText?: string, timeSpent: number = 0, resultsCount: number = 0) {
    if (!this.isAuthenticated) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('research_activities')
        .insert({
          user_id: user.id,
          activity_type: type,
          query_text: query,
          analysis_text: analysisText,
          time_spent: timeSpent,
          results_count: resultsCount
        });

      if (error) {
        console.error('Failed to save research activity:', error);
      }
    } catch (error) {
      console.error('Research activity save error:', error);
    }
  }

  resetState() {
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

  resetData() {
    this.resetState();
  }
}

export { GameStateManager, type GameState, type QuizResult, type QuizAnswer };