import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSessionUser } from './useSessionUser';

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
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [allUserStats, setAllUserStats] = useState<UserStats[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizSession[]>([]);
  const [researchHistory, setResearchHistory] = useState<ResearchActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    if (sessionUser) {
      loadUserData();
      loadAllUsersData();
      loadQuizHistory();
      loadResearchHistory();
    }
  }, [sessionUser]);

  const loadUserData = async () => {
    if (!sessionUser) return;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('display_name', sessionUser.name)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setUserStats({
          id: data.id,
          user_name: (data as any).user_name || data.display_name || sessionUser.name,
          total_xp: data.total_xp || 0,
          total_quizzes: data.total_quizzes || 0,
          total_correct_answers: data.total_correct_answers || 0,
          total_questions: data.total_questions || 0,
          study_time: data.study_time || 0,
          streak: data.streak || 0,
          level: data.level || 1,
          research_sessions: data.research_sessions || 0,
          achievements: data.achievements || [],
          last_activity: (data as any).last_activity,
          created_at: data.created_at
        });
      } else {
        setUserStats(null);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadAllUsersData = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('total_xp', { ascending: false });

      if (error) {
        throw error;
      }

      const formattedData = (data || []).map(item => ({
        id: item.id,
        user_name: (item as any).user_name || item.display_name || '',
        total_xp: item.total_xp || 0,
        total_quizzes: item.total_quizzes || 0,
        total_correct_answers: item.total_correct_answers || 0,
        total_questions: item.total_questions || 0,
        study_time: item.study_time || 0,
        streak: item.streak || 0,
        level: item.level || 1,
        research_sessions: item.research_sessions || 0,
        achievements: item.achievements || [],
        last_activity: (item as any).last_activity,
        created_at: item.created_at
      }));

      setAllUserStats(formattedData);
    } catch (error) {
      console.error('Error loading all users data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadQuizHistory = async () => {
    if (!sessionUser) return;

    try {
      const { data, error } = await supabase
        .from('quiz_sessions')
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
        title: item.title || '',
        subject: item.subject || '',
        difficulty: item.difficulty || '',
        total_questions: item.total_questions || 0,
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

  const saveQuizResult = async (quizData: Omit<QuizSession, 'id' | 'created_at'>) => {
    if (!sessionUser) return;

    try {
      // Save quiz session
      const { error: quizError } = await supabase
        .from('quiz_sessions')
        .insert({
          ...quizData,
          user_name: sessionUser.name
        });

      if (quizError) throw quizError;

      // Update or create user profile
      await updateUserProfile(quizData);
      
      // Reload data
      await Promise.all([loadUserData(), loadAllUsersData(), loadQuizHistory()]);
    } catch (error) {
      console.error('Error saving quiz result:', error);
    }
  };

  const saveResearchActivity = async (researchData: Omit<ResearchActivity, 'id' | 'created_at'>) => {
    if (!sessionUser) return;

    try {
      const { error } = await supabase
        .from('research_activities')
        .insert({
          ...researchData,
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
        .eq('display_name', sessionUser.name)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      const xpGained = quizData.correct_answers * 10 + (quizData.score >= 80 ? 20 : 0);
      const newStats = existing ? {
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
        ? await supabase.from('user_profiles').update(newStats).eq('display_name', sessionUser.name)
        : await supabase.from('user_profiles').insert(newStats);

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
        .eq('display_name', sessionUser.name)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existing) {
        const { error } = await supabase
          .from('user_profiles')
          .update({ research_sessions: (existing.research_sessions || 0) + 1 })
          .eq('display_name', sessionUser.name);

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

  return {
    userStats,
    allUserStats,
    quizHistory,
    researchHistory,
    loading,
    saveQuizResult,
    saveResearchActivity,
    refreshData: () => {
      loadUserData();
      loadAllUsersData();
      loadQuizHistory();
      loadResearchHistory();
    }
  };
};