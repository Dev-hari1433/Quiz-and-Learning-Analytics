import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSessionUser } from './useSessionUser';

export const useRealTimeSubscriptions = () => {
  const { sessionUser } = useSessionUser();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  useEffect(() => {
    if (!sessionUser) return;

    const setupSubscriptions = () => {
      const newSubscriptions = [];

      // Subscribe to user profile changes
      const profileSubscription = supabase
        .channel('user_profiles_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_profiles',
            filter: `user_id=eq.${sessionUser.sessionId}`
          },
          (payload) => {
            console.log('Profile updated:', payload);
            // Trigger a refresh of user data
            window.dispatchEvent(new CustomEvent('userProfileUpdated', { detail: payload }));
          }
        )
        .subscribe();

      // Subscribe to quiz session changes
      const quizSubscription = supabase
        .channel('quiz_sessions_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'quiz_sessions',
            filter: `user_id=eq.${sessionUser.sessionId}`
          },
          (payload) => {
            console.log('Quiz session updated:', payload);
            // Trigger a refresh of quiz history
            window.dispatchEvent(new CustomEvent('quizSessionUpdated', { detail: payload }));
          }
        )
        .subscribe();

      // Subscribe to research activity changes
      const researchSubscription = supabase
        .channel('research_activities_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'research_activities',
            filter: `user_id=eq.${sessionUser.sessionId}`
          },
          (payload) => {
            console.log('Research activity updated:', payload);
            // Trigger a refresh of research history
            window.dispatchEvent(new CustomEvent('researchActivityUpdated', { detail: payload }));
          }
        )
        .subscribe();

      // Subscribe to leaderboard changes (all users)
      const leaderboardSubscription = supabase
        .channel('leaderboard_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_profiles'
          },
          (payload) => {
            console.log('Leaderboard updated:', payload);
            // Trigger a refresh of leaderboard data
            window.dispatchEvent(new CustomEvent('leaderboardUpdated', { detail: payload }));
          }
        )
        .subscribe();

      // Subscribe to user achievement changes  
      const achievementSubscription = supabase
        .channel('user_achievements_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_achievements',
            filter: `user_id=eq.${sessionUser.sessionId}`
          },
          (payload) => {
            console.log('Achievement updated:', payload);
            // Trigger a refresh of achievement data
            window.dispatchEvent(new CustomEvent('achievementUpdated', { detail: payload }));
          }
        )
        .subscribe();

      newSubscriptions.push(
        profileSubscription,
        quizSubscription,
        researchSubscription,
        leaderboardSubscription,
        achievementSubscription
      );

      setSubscriptions(newSubscriptions);
    };

    setupSubscriptions();

    // Cleanup function
    return () => {
      subscriptions.forEach(subscription => {
        supabase.removeChannel(subscription);
      });
    };
  }, [sessionUser]);

  return { subscriptions };
};