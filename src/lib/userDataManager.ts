import { supabase } from '@/integrations/supabase/client';
import { GameStateManager, QuizResult } from '@/lib/gameState';

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  user_name: string;
  total_xp: number;
  total_quizzes: number;
  total_correct_answers: number;
  total_questions: number;
  study_time: number;
  streak: number;
  level: number;
  research_sessions: number;
  achievements: string[];
  last_activity: string | null;
  created_at: string;
  updated_at: string;
}

class UserDataManager {
  private static instance: UserDataManager;

  static getInstance(): UserDataManager {
    if (!UserDataManager.instance) {
      UserDataManager.instance = new UserDataManager();
    }
    return UserDataManager.instance;
  }

  async initializeUserProfile(userId: string): Promise<void> {
    try {
      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (!existingProfile) {
        // Create new profile
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: userId,
            display_name: userId,
            user_name: userId,
            total_xp: 0,
            total_quizzes: 0,
            total_correct_answers: 0,
            total_questions: 0,
            study_time: 0,
            streak: 0,
            level: 1,
            research_sessions: 0,
            achievements: []
          });

        if (insertError) {
          throw insertError;
        }
      } else {
        // Load existing data into game state by refreshing from database
        // The GameStateManager will automatically load from database when authenticated
        console.log('User profile exists, data will be loaded automatically');
      }
    } catch (error) {
      console.error('Error initializing user profile:', error);
    }
  }

  async saveQuizResult(userId: string, quizResult: Omit<QuizResult, 'id' | 'timestamp'>): Promise<void> {
    try {
      // Save quiz session to database
      const { error: quizError } = await supabase
        .from('quiz_sessions')
        .insert({
          user_id: userId,
          user_name: userId,
          title: quizResult.title,
          subject: quizResult.subject,
          difficulty: quizResult.difficulty,
          total_questions: quizResult.totalQuestions,
          correct_answers: quizResult.correctAnswers,
          time_spent: quizResult.timeSpent,
          score: (quizResult.correctAnswers / quizResult.totalQuestions) * 100
        });

      if (quizError) {
        throw quizError;
      }

      // Update user profile
      await this.syncGameStateToDatabase(userId);
    } catch (error) {
      console.error('Error saving quiz result:', error);
    }
  }

  async saveResearchActivity(
    userId: string, 
    activityType: 'search' | 'analysis',
    queryText?: string,
    analysisText?: string,
    timeSpent: number = 0,
    resultsCount: number = 0
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('research_activities')
        .insert({
          user_id: userId,
          user_name: userId,
          activity_type: activityType,
          query_text: queryText,
          time_spent: timeSpent,
          results_count: resultsCount
        });

      if (error) {
        throw error;
      }

      // Update research sessions count in user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('research_sessions')
        .eq('user_id', userId)
        .single();

      if (!profileError && profile) {
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ 
            research_sessions: (profile.research_sessions || 0) + 1
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('Error updating research sessions:', updateError);
        }
      }
    } catch (error) {
      console.error('Error saving research activity:', error);
    }
  }

  async syncGameStateToDatabase(userId: string): Promise<void> {
    try {
      const gameState = GameStateManager.getInstance().getState();
      
      const { error } = await supabase
        .from('user_profiles')
        .update({
          total_xp: gameState.totalXP,
          total_quizzes: gameState.totalQuizzes,
          total_correct_answers: gameState.totalCorrectAnswers,
          total_questions: gameState.totalQuestions,
          study_time: gameState.studyTime,
          streak: gameState.streak,
          level: gameState.level,
          achievements: gameState.achievements
        })
        .eq('user_id', userId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error syncing game state to database:', error);
    }
  }

  async loadUserData(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error loading user data:', error);
      return null;
    }
  }

  async getQuizHistory(userId: string, limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching quiz history:', error);
      return [];
    }
  }

  async getResearchActivities(userId: string, limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('research_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching research activities:', error);
      return [];
    }
  }
}

export { UserDataManager, type UserProfile };