-- Update leaderboard view to be more comprehensive
DROP VIEW IF EXISTS public.leaderboard_stats;

CREATE VIEW public.leaderboard_stats AS
SELECT 
  ROW_NUMBER() OVER (ORDER BY 
    COALESCE(up.total_xp, 0) DESC,
    COALESCE(up.level, 1) DESC,
    COALESCE(up.streak, 0) DESC,
    COALESCE(up.total_correct_answers, 0) DESC
  ) as rank,
  up.id,
  up.user_name,
  COALESCE(up.total_xp, 0) as total_xp,
  COALESCE(up.level, 1) as level,
  COALESCE(up.streak, 0) as streak,
  COALESCE(up.total_quizzes, 0) as total_quizzes,
  COALESCE(up.total_correct_answers, 0) as total_correct_answers,
  COALESCE(up.total_questions, 0) as total_questions,
  COALESCE(up.research_sessions, 0) as research_sessions,
  up.last_activity
FROM public.user_profiles up
WHERE up.total_xp > 0 OR up.total_quizzes > 0 OR up.research_sessions > 0
ORDER BY 
  COALESCE(up.total_xp, 0) DESC,
  COALESCE(up.level, 1) DESC,
  COALESCE(up.streak, 0) DESC,
  COALESCE(up.total_correct_answers, 0) DESC;

-- Function to update user profile stats after quiz completion
CREATE OR REPLACE FUNCTION public.update_user_stats_after_quiz()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update or insert user profile stats
  INSERT INTO public.user_profiles (
    user_id, user_name, display_name,
    total_quizzes, total_correct_answers, total_questions,
    total_xp, study_time, last_activity
  )
  VALUES (
    NEW.user_name,
    NEW.user_name,
    NEW.user_name,
    1,
    NEW.correct_answers,
    NEW.total_questions,
    (NEW.correct_answers * 10) + CASE WHEN NEW.score >= 80 THEN 20 ELSE 0 END,
    NEW.time_spent,
    NOW()
  )
  ON CONFLICT (user_name) DO UPDATE SET
    total_quizzes = user_profiles.total_quizzes + 1,
    total_correct_answers = user_profiles.total_correct_answers + NEW.correct_answers,
    total_questions = user_profiles.total_questions + NEW.total_questions,
    total_xp = user_profiles.total_xp + (NEW.correct_answers * 10) + CASE WHEN NEW.score >= 80 THEN 20 ELSE 0 END,
    study_time = user_profiles.study_time + NEW.time_spent,
    level = LEAST(100, 1 + FLOOR((user_profiles.total_xp + (NEW.correct_answers * 10) + CASE WHEN NEW.score >= 80 THEN 20 ELSE 0 END) / 100)),
    last_activity = NOW(),
    updated_at = NOW();

  RETURN NEW;
END;
$function$;

-- Function to update user stats after research activity
CREATE OR REPLACE FUNCTION public.update_user_stats_after_research()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update or insert user profile stats for research
  INSERT INTO public.user_profiles (
    user_id, user_name, display_name,
    research_sessions, total_xp, study_time, last_activity
  )
  VALUES (
    NEW.user_name,
    NEW.user_name,
    NEW.user_name,
    1,
    NEW.results_count * 5,
    NEW.time_spent,
    NOW()
  )
  ON CONFLICT (user_name) DO UPDATE SET
    research_sessions = user_profiles.research_sessions + 1,
    total_xp = user_profiles.total_xp + (NEW.results_count * 5),
    study_time = user_profiles.study_time + NEW.time_spent,
    level = LEAST(100, 1 + FLOOR((user_profiles.total_xp + (NEW.results_count * 5)) / 100)),
    last_activity = NOW(),
    updated_at = NOW();

  RETURN NEW;
END;
$function$;

-- Create triggers for automatic stats updates
DROP TRIGGER IF EXISTS update_user_stats_quiz_trigger ON public.quiz_sessions;
CREATE TRIGGER update_user_stats_quiz_trigger
  AFTER INSERT ON public.quiz_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_stats_after_quiz();

DROP TRIGGER IF EXISTS update_user_stats_research_trigger ON public.research_activities;
CREATE TRIGGER update_user_stats_research_trigger
  AFTER INSERT ON public.research_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_stats_after_research();