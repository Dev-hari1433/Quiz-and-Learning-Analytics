-- Enable real-time updates for all tables
-- This ensures that changes to data are broadcasted in real-time

-- Enable replica identity full for complete row data in real-time updates
ALTER TABLE public.user_profiles REPLICA IDENTITY FULL;
ALTER TABLE public.quiz_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.research_activities REPLICA IDENTITY FULL;

-- Add tables to the realtime publication to enable real-time functionality
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.research_activities;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_total_xp ON public.user_profiles(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id_created ON public.quiz_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_created_at ON public.quiz_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_research_activities_user_id_created ON public.research_activities(user_id, created_at DESC);