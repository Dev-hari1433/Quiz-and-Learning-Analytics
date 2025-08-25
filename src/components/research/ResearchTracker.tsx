import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSessionUser } from '@/hooks/useSessionUser';

interface ResearchTrackerProps {
  query: string;
  resultsCount: number;
  timeSpent: number;
  activityType: 'search' | 'analyze';
}

export const ResearchTracker: React.FC<ResearchTrackerProps> = ({
  query,
  resultsCount,
  timeSpent,
  activityType
}) => {
  const { sessionUser } = useSessionUser();

  useEffect(() => {
    if (sessionUser && query && resultsCount > 0) {
      saveResearchActivity();
    }
  }, [query, resultsCount, timeSpent]);

  const saveResearchActivity = async () => {
    if (!sessionUser) return;

    try {
      const { error } = await supabase
        .from('research_activities')
        .insert({
          user_id: sessionUser.sessionId,
          user_name: sessionUser.name,
          activity_type: activityType,
          query_text: query.substring(0, 500), // Limit query length
          time_spent: Math.max(1, Math.round(timeSpent / 1000)), // Convert to seconds
          results_count: resultsCount
        });

      if (error) {
        console.error('Error saving research activity:', error);
      }
    } catch (error) {
      console.error('Error saving research activity:', error);
    }
  };

  return null; // This is a tracking component, no UI
};