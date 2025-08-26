import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSessionUser } from './useSessionUser';
import { useToast } from '@/components/ui/use-toast';

interface UserStats {
  id?: string;
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
  last_activity?: string;
  created_at?: string;
}

interface QuizSession {
  id: string;
  user_name: string;
  title: string;
  subject: string;
  difficulty: string;
  total_questions: number;
  correct_answers: number;
  time_spent: number;
  score: number;
  created_at: string;
}

interface ResearchActivity {
  id: string;
  user_name: string;
  activity_type: string;
  query_text?: string;
  time_spent: number;
  results_count: number;
  created_at: string;
}

export const useRealTimeData = () => {
  const { sessionUser } = useSessionUser();
  const { toast } = useToast();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [allUserStats, setAllUserStats] = useState<UserStats[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizSession[]>([]);
  const [researchHistory, setResearchHistory] = useState<ResearchActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data and set up real-time subscriptions
  useEffect(() => {
    let subscriptions: any[] = [];
    
    if (sessionUser) {
      loadInitialData();
      subscriptions = setupRealTimeSubscriptions();
    }

    return () => {
      // Cleanup subscriptions
      subscriptions.forEach(subscription => {
        supabase.removeChannel(subscription);
      });
    };
  }, [sessionUser]);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        loadUserData(),
        loadAllUsersData(),
        loadQuizHistory(),
        loadResearchHistory()
      ]);
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Failed to load data. Please refresh the page.');
      toast({
        title: "Data Loading Error",
        description: "Failed to load your data. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeSubscriptions = () => {
    const subscriptions = [];

    // Subscribe to user profile changes with optimized refresh
    const profileSubscription = supabase
      .channel('user_profiles_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_profiles',
          filter: `user_id=eq.${sessionUser.sessionId}`
        },
        (payload) => {
          console.log('Profile updated - refreshing user data', payload.eventType);
          // Debounced refresh to prevent too many calls
          setTimeout(() => {
            loadUserData();
            if (payload.eventType === 'UPDATE') {
              loadAllUsersData(); // Only refresh leaderboard on updates
            }
          }, 100);
        }
      )
      .subscribe();

    // Subscribe to quiz session changes with immediate refresh
    const quizSubscription = supabase
      .channel('quiz_sessions_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quiz_sessions',
          filter: `user_id=eq.${sessionUser.sessionId}`
        },
        (payload) => {
          console.log('Quiz session updated - refreshing data', payload.eventType);
          // Immediate refresh for quiz data
          Promise.all([
            loadQuizHistory(),
            loadUserData(),
            loadAllUsersData()
          ]).catch(console.error);
        }
      )
      .subscribe();

    // Subscribe to detailed quiz results for real-time analytics
    const quizResultsSubscription = supabase
      .channel('quiz_results_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quiz_results',
          filter: `user_id=eq.${sessionUser.sessionId}`
        },
        (payload) => {
          console.log('Quiz results updated - refreshing analytics data', payload.eventType);
          // Refresh data for real-time analytics updates
          Promise.all([
            loadQuizHistory(),
            loadUserData()
          ]).catch(console.error);
        }
      )
      .subscribe();

    // Subscribe to research activity changes
    const researchSubscription = supabase
      .channel('research_activities_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'research_activities',
          filter: `user_id=eq.${sessionUser.sessionId}`
        },
        (payload) => {
          console.log('Research activity updated - refreshing data', payload.eventType);
          setTimeout(() => {
            loadResearchHistory();
            loadUserData(); // Update stats
          }, 50);
        }
      )
      .subscribe();

    // Subscribe to global leaderboard changes with throttling
    const leaderboardSubscription = supabase
      .channel('leaderboard_realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_profiles'
        },
        (payload) => {
          console.log('Leaderboard updated - refreshing leaderboard data');
          // Throttle leaderboard updates to prevent excessive calls
          setTimeout(() => {
            loadAllUsersData();
          }, 500);
        }
      )
      .subscribe();

    subscriptions.push(
      profileSubscription,
      quizSubscription,
      quizResultsSubscription,
      researchSubscription,
      leaderboardSubscription
    );

    console.log(`Set up ${subscriptions.length} real-time subscriptions for user ${sessionUser.sessionId}`);
    return subscriptions;
  };

  const loadUserData = async () => {
    if (!sessionUser) return;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          user_name,
          display_name,
          total_xp,
          total_quizzes,
          total_correct_answers,
          total_questions,
          study_time,
          streak,
          level,
          research_sessions,
          achievements,
          last_activity,
          created_at
        `)
        .eq('user_id', sessionUser.sessionId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user data:', error);
        return;
      }

      if (data) {
        setUserStats({
          id: data.id,
          user_name: data.user_name || data.display_name || sessionUser.name,
          total_xp: data.total_xp || 0,
          total_quizzes: data.total_quizzes || 0,
          total_correct_answers: data.total_correct_answers || 0,
          total_questions: data.total_questions || 0,
          study_time: data.study_time || 0,
          streak: data.streak || 0,
          level: data.level || 1,
          research_sessions: data.research_sessions || 0,
          achievements: data.achievements || [],
          last_activity: data.last_activity,
          created_at: data.created_at
        });
      } else {
        setUserStats(null);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load user profile');
    }
  };

  const loadAllUsersData = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_leaderboard_stats');

      if (error) {
        console.error('Error loading leaderboard:', error);
        return;
      }

      const formattedData = (data || [])
        .filter(item => item && item.user_name) // Filter out invalid entries
        .slice(0, 100) // Limit to top 100 for performance
        .map(item => ({
          id: item.id,
          user_name: item.user_name,
          total_xp: item.total_xp || 0,
          total_quizzes: item.total_quizzes || 0,
          total_correct_answers: item.total_correct_answers || 0,
          total_questions: item.total_questions || 0,
          study_time: 0, // Not exposed in leaderboard view for privacy
          streak: item.streak || 0,
          level: item.level || 1,
          research_sessions: item.research_sessions || 0,
          achievements: [], // Not exposed in leaderboard view for privacy
          last_activity: undefined, // Not exposed in leaderboard view for privacy
          created_at: undefined // Not exposed in leaderboard view for privacy
        }));

      setAllUserStats(formattedData);
    } catch (error) {
      console.error('Error loading all users data:', error);
      setError('Failed to load leaderboard data');
    }
  };

  const loadQuizHistory = async () => {
    if (!sessionUser) return;

    try {
      const { data, error } = await supabase
        .from('quiz_sessions')
        .select(`
          id,
          user_name,
          title,
          subject,
          difficulty,
          total_questions,
          correct_answers,
          time_spent,
          score,
          created_at
        `)
        .eq('user_id', sessionUser.sessionId)
        .order('created_at', { ascending: false })
        .limit(100); // Increased limit for better analytics

      if (error) {
        throw error;
      }

      const formattedData = (data || []).map(item => ({
        id: item.id,
        user_name: item.user_name || sessionUser.name,
        title: item.title || '',
        subject: item.subject || '',
        difficulty: item.difficulty || '',
        total_questions: Math.max(1, item.total_questions || 0), // Prevent division by zero
        correct_answers: item.correct_answers || 0,
        time_spent: item.time_spent || 0,
        score: item.score || 0,
        created_at: item.created_at
      }));

      setQuizHistory(formattedData);
    } catch (error) {
      console.error('Error loading quiz history:', error);
    }
  };

  const loadResearchHistory = async () => {
    if (!sessionUser) return;

    try {
      const { data, error } = await supabase
        .from('research_activities')
        .select('*')
        .eq('user_id', sessionUser.sessionId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        throw error;
      }

      const formattedData = (data || []).map(item => ({
        id: item.id,
        user_name: (item as any).user_name || sessionUser.name,
        activity_type: item.activity_type || '',
        query_text: item.query_text,
        time_spent: item.time_spent || 0,
        results_count: item.results_count || 0,
        created_at: item.created_at
      }));

      setResearchHistory(formattedData);
    } catch (error) {
      console.error('Error loading research history:', error);
    }
  };

  const saveQuizResult = async (quizData: Omit<QuizSession, 'id' | 'created_at'>): Promise<string | null> => {
    if (!sessionUser) return null;

    try {
      // Save quiz session and return the ID
      const { data, error: quizError } = await supabase
        .from('quiz_sessions')
        .insert({
          ...quizData,
          user_id: sessionUser.sessionId,
          user_name: sessionUser.name
        })
        .select('id')
        .single();

      if (quizError) throw quizError;

      // Update or create user profile
      await updateUserProfile(quizData);
      
      // Reload data
      await Promise.all([loadUserData(), loadAllUsersData(), loadQuizHistory()]);
      
      return data?.id || null;
    } catch (error) {
      console.error('Error saving quiz result:', error);
      return null;
    }
  };

  const saveResearchActivity = async (researchData: Omit<ResearchActivity, 'id' | 'created_at'>) => {
    if (!sessionUser) return;

    try {
      const { error } = await supabase
        .from('research_activities')
        .insert({
          ...researchData,
          user_id: sessionUser.sessionId,
          user_name: sessionUser.name
        });

      if (error) throw error;

      // Update research sessions count
      await updateResearchCount();
      
      // Reload data
      await Promise.all([loadUserData(), loadAllUsersData(), loadResearchHistory()]);
    } catch (error) {
      console.error('Error saving research activity:', error);
    }
  };

  const updateUserProfile = async (quizData: Omit<QuizSession, 'id' | 'created_at'>) => {
    if (!sessionUser) return;

    try {
      const { data: existing, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', sessionUser.sessionId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      const xpGained = quizData.correct_answers * 10 + (quizData.score >= 80 ? 20 : 0);
      const newStats = existing ? {
        display_name: sessionUser.name,
        user_name: sessionUser.name, 
        user_id: sessionUser.sessionId,
        total_xp: (existing.total_xp || 0) + xpGained,
        total_quizzes: (existing.total_quizzes || 0) + 1,
        total_correct_answers: (existing.total_correct_answers || 0) + quizData.correct_answers,
        total_questions: (existing.total_questions || 0) + quizData.total_questions,
        study_time: (existing.study_time || 0) + quizData.time_spent,
        streak: calculateStreak(existing.streak || 0, quizData.score),
        level: calculateLevel((existing.total_xp || 0) + xpGained),
        research_sessions: existing.research_sessions || 0,
        achievements: updateAchievements(existing, quizData, xpGained)
      } : {
        user_id: sessionUser.sessionId,
        display_name: sessionUser.name,
        user_name: sessionUser.name,
        total_xp: xpGained,
        total_quizzes: 1,
        total_correct_answers: quizData.correct_answers,
        total_questions: quizData.total_questions,
        study_time: quizData.time_spent,
        streak: quizData.score >= 70 ? 1 : 0,
        level: calculateLevel(xpGained),
        research_sessions: 0,
        achievements: getInitialAchievements(quizData, xpGained)
      };

      const { error } = existing
        ? await supabase.from('user_profiles').update(newStats).eq('user_id', sessionUser.sessionId)
        : await supabase.from('user_profiles').insert({ ...newStats });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };

  const updateResearchCount = async () => {
    if (!sessionUser) return;

    try {
      const { data: existing, error: fetchError } = await supabase
        .from('user_profiles')
        .select('research_sessions')
        .eq('user_id', sessionUser.sessionId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existing) {
        const { error } = await supabase
          .from('user_profiles')
          .update({ research_sessions: (existing.research_sessions || 0) + 1 })
          .eq('user_id', sessionUser.sessionId);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating research count:', error);
    }
  };

  const calculateLevel = (totalXP: number): number => {
    return Math.floor(totalXP / 100) + 1;
  };

  const calculateStreak = (currentStreak: number, score: number): number => {
    return score >= 70 ? currentStreak + 1 : 0;
  };

  const updateAchievements = (existing: any, quizData: any, xpGained: number): string[] => {
    const achievements = [...(existing.achievements || [])];
    const newTotal = (existing.total_quizzes || 0) + 1;
    
    if (newTotal === 1 && !achievements.includes('first_quiz')) {
      achievements.push('first_quiz');
    }
    if (newTotal === 5 && !achievements.includes('quiz_enthusiast')) {
      achievements.push('quiz_enthusiast');
    }
    if (newTotal === 10 && !achievements.includes('dedicated_learner')) {
      achievements.push('dedicated_learner');
    }
    if (quizData.score === 100 && !achievements.includes('perfect_score')) {
      achievements.push('perfect_score');
    }
    
    return achievements;
  };

  const getInitialAchievements = (quizData: any, xpGained: number): string[] => {
    const achievements = ['first_quiz'];
    if (quizData.score === 100) {
      achievements.push('perfect_score');
    }
    return achievements;
  };

  const evaluateAchievements = async (userId: string, userName: string) => {
    try {
      const { data, error } = await supabase
        .rpc('evaluate_achievements', {
          p_user_id: userId,
          p_user_name: userName
        });

      if (error) {
        console.error('Error evaluating achievements:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error evaluating achievements:', error);
      return [];
    }
  };

  return {
    userStats,
    allUserStats,
    quizHistory,
    researchHistory,
    loading,
    error,
    saveQuizResult,
    saveResearchActivity,
    evaluateAchievements,
    refreshData: () => {
      loadInitialData();
    }
  };
};