-- Enable realtime for all relevant tables by adding them to the publication
-- and setting proper replica identity for complete row data capture

-- Set replica identity to FULL for all tables to capture complete row data
ALTER TABLE public.user_profiles REPLICA IDENTITY FULL;
ALTER TABLE public.quiz_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.quiz_results REPLICA IDENTITY FULL;
ALTER TABLE public.research_activities REPLICA IDENTITY FULL;
ALTER TABLE public.user_achievements REPLICA IDENTITY FULL;

-- Add all tables to the supabase_realtime publication to enable real-time functionality
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_results;
ALTER PUBLICATION supabase_realtime ADD TABLE public.research_activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_achievements;