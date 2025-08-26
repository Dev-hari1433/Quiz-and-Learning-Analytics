-- Fix security issue: Set search_path for evaluate_achievements function
CREATE OR REPLACE FUNCTION public.evaluate_achievements(
  p_user_id text,
  p_user_name text
) RETURNS SETOF public.user_achievements
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_stats RECORD;
  achievement_record public.user_achievements%ROWTYPE;
  new_achievements public.user_achievements[];
BEGIN
  -- Get user statistics
  SELECT 
    COALESCE(COUNT(DISTINCT qs.id), 0) as total_quizzes,
    COALESCE(SUM(qs.correct_answers), 0) as total_correct,
    COALESCE(SUM(qs.total_questions), 0) as total_questions,
    COALESCE(MAX(qs.correct_answers::float / NULLIF(qs.total_questions, 0) * 100), 0) as best_accuracy,
    COALESCE(COUNT(DISTINCT ra.id), 0) as research_sessions
  INTO user_stats
  FROM quiz_sessions qs
  FULL OUTER JOIN research_activities ra ON qs.user_id = ra.user_id
  WHERE qs.user_id = p_user_id OR ra.user_id = p_user_id;

  -- Initialize array
  new_achievements := '{}';

  -- Achievement: First Quiz (QUIZ_1)
  IF user_stats.total_quizzes >= 1 AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements 
    WHERE user_id = p_user_id AND achievement_type = 'QUIZ_1'
  ) THEN
    INSERT INTO public.user_achievements (user_id, user_name, achievement_type, achievement_name, description, points_earned)
    VALUES (p_user_id, p_user_name, 'QUIZ_1', 'First Steps', 'Completed your first quiz', 10)
    RETURNING * INTO achievement_record;
    new_achievements := new_achievements || achievement_record;
  END IF;

  -- Achievement: Quiz Master (QUIZ_5)
  IF user_stats.total_quizzes >= 5 AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements 
    WHERE user_id = p_user_id AND achievement_type = 'QUIZ_5'
  ) THEN
    INSERT INTO public.user_achievements (user_id, user_name, achievement_type, achievement_name, description, points_earned)
    VALUES (p_user_id, p_user_name, 'QUIZ_5', 'Quiz Master', 'Completed 5 quizzes', 50)
    RETURNING * INTO achievement_record;
    new_achievements := new_achievements || achievement_record;
  END IF;

  -- Achievement: High Accuracy (ACCURACY_80)
  IF user_stats.best_accuracy >= 80 AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements 
    WHERE user_id = p_user_id AND achievement_type = 'ACCURACY_80'
  ) THEN
    INSERT INTO public.user_achievements (user_id, user_name, achievement_type, achievement_name, description, points_earned)
    VALUES (p_user_id, p_user_name, 'ACCURACY_80', 'Sharp Mind', 'Achieved 80%+ accuracy in a quiz', 25)
    RETURNING * INTO achievement_record;
    new_achievements := new_achievements || achievement_record;
  END IF;

  -- Achievement: Perfect Score (ACCURACY_100)
  IF user_stats.best_accuracy >= 100 AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements 
    WHERE user_id = p_user_id AND achievement_type = 'ACCURACY_100'
  ) THEN
    INSERT INTO public.user_achievements (user_id, user_name, achievement_type, achievement_name, description, points_earned)
    VALUES (p_user_id, p_user_name, 'ACCURACY_100', 'Perfect Score', 'Achieved 100% accuracy in a quiz', 100)
    RETURNING * INTO achievement_record;
    new_achievements := new_achievements || achievement_record;
  END IF;

  -- Achievement: Research Explorer (RESEARCH_5)
  IF user_stats.research_sessions >= 5 AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements 
    WHERE user_id = p_user_id AND achievement_type = 'RESEARCH_5'
  ) THEN
    INSERT INTO public.user_achievements (user_id, user_name, achievement_type, achievement_name, description, points_earned)
    VALUES (p_user_id, p_user_name, 'RESEARCH_5', 'Research Explorer', 'Completed 5 research sessions', 30)
    RETURNING * INTO achievement_record;
    new_achievements := new_achievements || achievement_record;
  END IF;

  -- Return all newly unlocked achievements
  RETURN QUERY 
  SELECT * FROM unnest(new_achievements);
END;
$$;