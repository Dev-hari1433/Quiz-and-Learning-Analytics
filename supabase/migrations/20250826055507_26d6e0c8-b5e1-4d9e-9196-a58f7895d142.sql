-- Drop existing function and triggers if they exist
DROP TRIGGER IF EXISTS evaluate_achievements_on_quiz_insert ON quiz_sessions;
DROP TRIGGER IF EXISTS evaluate_achievements_on_research_insert ON research_activities;
DROP FUNCTION IF EXISTS public.evaluate_achievements(text, text);

-- Create updated evaluate_achievements function
CREATE OR REPLACE FUNCTION public.evaluate_achievements(p_user_name text)
 RETURNS SETOF user_achievements
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_stats RECORD;
  achievement_record public.user_achievements%ROWTYPE;
  new_achievements public.user_achievements[];
BEGIN
  -- Get user statistics from correct tables
  SELECT 
    COALESCE(COUNT(DISTINCT qs.id), 0) as total_quizzes,
    COALESCE(SUM(qs.correct_answers), 0) as total_correct,
    COALESCE(SUM(qs.total_questions), 0) as total_questions,
    COALESCE(MAX(qs.correct_answers::float / NULLIF(qs.total_questions, 0) * 100), 0) as best_accuracy,
    COALESCE(COUNT(DISTINCT ra.id), 0) as research_sessions
  INTO user_stats
  FROM quiz_sessions qs
  FULL OUTER JOIN research_activities ra ON qs.user_name = ra.user_name
  WHERE qs.user_name = p_user_name OR ra.user_name = p_user_name;

  -- Initialize array
  new_achievements := '{}';

  -- Achievement: First Quiz (QUIZ_1)
  IF user_stats.total_quizzes >= 1 AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements 
    WHERE user_name = p_user_name AND achievement_type = 'QUIZ_1'
  ) THEN
    INSERT INTO public.user_achievements (user_id, user_name, achievement_type, achievement_name, description, points_earned)
    VALUES (p_user_name, p_user_name, 'QUIZ_1', 'First Steps', 'Completed your first quiz', 10)
    RETURNING * INTO achievement_record;
    new_achievements := new_achievements || achievement_record;
  END IF;

  -- Achievement: Quiz Master (QUIZ_5)
  IF user_stats.total_quizzes >= 5 AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements 
    WHERE user_name = p_user_name AND achievement_type = 'QUIZ_5'
  ) THEN
    INSERT INTO public.user_achievements (user_id, user_name, achievement_type, achievement_name, description, points_earned)
    VALUES (p_user_name, p_user_name, 'QUIZ_5', 'Quiz Master', 'Completed 5 quizzes', 50)
    RETURNING * INTO achievement_record;
    new_achievements := new_achievements || achievement_record;
  END IF;

  -- Achievement: High Accuracy (ACCURACY_80)
  IF user_stats.best_accuracy >= 80 AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements 
    WHERE user_name = p_user_name AND achievement_type = 'ACCURACY_80'
  ) THEN
    INSERT INTO public.user_achievements (user_id, user_name, achievement_type, achievement_name, description, points_earned)
    VALUES (p_user_name, p_user_name, 'ACCURACY_80', 'Sharp Mind', 'Achieved 80%+ accuracy in a quiz', 25)
    RETURNING * INTO achievement_record;
    new_achievements := new_achievements || achievement_record;
  END IF;

  -- Achievement: Perfect Score (ACCURACY_100)
  IF user_stats.best_accuracy >= 100 AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements 
    WHERE user_name = p_user_name AND achievement_type = 'ACCURACY_100'
  ) THEN
    INSERT INTO public.user_achievements (user_id, user_name, achievement_type, achievement_name, description, points_earned)
    VALUES (p_user_name, p_user_name, 'ACCURACY_100', 'Perfect Score', 'Achieved 100% accuracy in a quiz', 100)
    RETURNING * INTO achievement_record;
    new_achievements := new_achievements || achievement_record;
  END IF;

  -- Achievement: Research Explorer (RESEARCH_5)
  IF user_stats.research_sessions >= 5 AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements 
    WHERE user_name = p_user_name AND achievement_type = 'RESEARCH_5'
  ) THEN
    INSERT INTO public.user_achievements (user_id, user_name, achievement_type, achievement_name, description, points_earned)
    VALUES (p_user_name, p_user_name, 'RESEARCH_5', 'Research Explorer', 'Completed 5 research sessions', 30)
    RETURNING * INTO achievement_record;
    new_achievements := new_achievements || achievement_record;
  END IF;

  -- Return all newly unlocked achievements
  RETURN QUERY 
  SELECT * FROM unnest(new_achievements);
END;
$function$;

-- Create trigger function for quiz achievements
CREATE OR REPLACE FUNCTION public.trigger_evaluate_achievements_quiz()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Call evaluate_achievements and ignore the result
  PERFORM public.evaluate_achievements(NEW.user_name);
  RETURN NEW;
END;
$$;

-- Create trigger function for research achievements  
CREATE OR REPLACE FUNCTION public.trigger_evaluate_achievements_research()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Call evaluate_achievements and ignore the result
  PERFORM public.evaluate_achievements(NEW.user_name);
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER evaluate_achievements_on_quiz_insert
  AFTER INSERT ON quiz_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_evaluate_achievements_quiz();

CREATE TRIGGER evaluate_achievements_on_research_insert
  AFTER INSERT ON research_activities  
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_evaluate_achievements_research();

-- Enable realtime for all relevant tables
ALTER TABLE quiz_sessions REPLICA IDENTITY FULL;
ALTER TABLE research_activities REPLICA IDENTITY FULL;
ALTER TABLE user_achievements REPLICA IDENTITY FULL;
ALTER TABLE user_profiles REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE research_activities;
ALTER PUBLICATION supabase_realtime ADD TABLE user_achievements;
ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;