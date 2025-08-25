-- First, drop the overly permissive policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.user_profiles;

-- Create secure RLS policies for user_profiles
-- Users can only view their own profile
CREATE POLICY "Users can view own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid()::text = user_id);

-- Users can only update their own profile  
CREATE POLICY "Users can update own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- Create a secure view for leaderboard data that only exposes necessary public information
CREATE OR REPLACE VIEW public.leaderboard_stats AS
SELECT 
  id,
  user_name,
  total_xp,
  level,
  streak,
  total_quizzes,
  total_correct_answers,
  total_questions,
  research_sessions,
  ROW_NUMBER() OVER (ORDER BY total_xp DESC) as rank
FROM public.user_profiles
ORDER BY total_xp DESC;

-- Enable RLS on the view and make it publicly readable for leaderboard functionality
ALTER VIEW public.leaderboard_stats SET (security_invoker = on);

-- Create a function to get leaderboard data (security definer to bypass RLS)
CREATE OR REPLACE FUNCTION public.get_leaderboard_stats()
RETURNS SETOF public.leaderboard_stats
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT * FROM public.leaderboard_stats;
$$;