import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSessionUser } from './useSessionUser';

export const useRealTimeConnection = () => {
  const { sessionUser } = useSessionUser();
  const [isConnected, setIsConnected] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  useEffect(() => {
    if (!sessionUser) return;

    let updateTimeout: NodeJS.Timeout;

    // Set up connection status monitoring
    const monitorConnection = async () => {
      try {
        // Test connection with a simple query
        await supabase
          .from('user_profiles')
          .select('id')
          .limit(1);
        setIsConnected(true);
      } catch (error) {
        setIsConnected(false);
      }
    };

    // Monitor connection every 30 seconds
    const connectionInterval = setInterval(monitorConnection, 30000);
    monitorConnection(); // Initial check

    // Set up real-time update indicators
    const setupUpdateIndicators = () => {
      const subscriptions = [];

      // Profile updates
      const profileSub = supabase
        .channel('connection_profile_updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_profiles',
            filter: `user_id=eq.${sessionUser.sessionId}`
          },
          () => {
            setIsUpdating(true);
            setLastUpdateTime(new Date());
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(() => setIsUpdating(false), 2000);
          }
        )
        .subscribe();

      // Quiz session updates
      const quizSub = supabase
        .channel('connection_quiz_updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'quiz_sessions',
            filter: `user_id=eq.${sessionUser.sessionId}`
          },
          () => {
            setIsUpdating(true);
            setLastUpdateTime(new Date());
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(() => setIsUpdating(false), 2000);
          }
        )
        .subscribe();

      // Achievement updates
      const achievementSub = supabase
        .channel('connection_achievement_updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_achievements',
            filter: `user_id=eq.${sessionUser.sessionId}`
          },
          () => {
            setIsUpdating(true);
            setLastUpdateTime(new Date());
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(() => setIsUpdating(false), 2000);
          }
        )
        .subscribe();

      subscriptions.push(profileSub, quizSub, achievementSub);
      return subscriptions;
    };

    const subscriptions = setupUpdateIndicators();

    return () => {
      clearInterval(connectionInterval);
      clearTimeout(updateTimeout);
      subscriptions.forEach(sub => supabase.removeChannel(sub));
    };
  }, [sessionUser]);

  return {
    isConnected,
    isUpdating,
    lastUpdateTime
  };
};