-- Enable DELETE access for quiz data so users can delete their history
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.quiz_sessions;
CREATE POLICY "Enable delete access for all users" ON public.quiz_sessions
FOR DELETE USING (true);

ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.quiz_results;
CREATE POLICY "Enable delete access for all users" ON public.quiz_results
FOR DELETE USING (true);