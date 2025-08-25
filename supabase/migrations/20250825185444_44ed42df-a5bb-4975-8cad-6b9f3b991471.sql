-- Create quiz_results table for detailed question-level analytics
CREATE TABLE public.quiz_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  quiz_session_id UUID,
  question_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  options TEXT[] NOT NULL DEFAULT '{}',
  selected_answer INTEGER NOT NULL,
  correct_answer INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  time_spent INTEGER NOT NULL DEFAULT 0,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  subject TEXT NOT NULL DEFAULT 'General',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- Create policies for quiz_results
CREATE POLICY "Enable insert access for all users" 
ON public.quiz_results 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable read access for all users" 
ON public.quiz_results 
FOR SELECT 
USING (true);

-- Add indexes for better performance
CREATE INDEX idx_quiz_results_user_id ON public.quiz_results(user_id);
CREATE INDEX idx_quiz_results_created_at ON public.quiz_results(created_at DESC);
CREATE INDEX idx_quiz_results_subject ON public.quiz_results(subject);
CREATE INDEX idx_quiz_results_difficulty ON public.quiz_results(difficulty);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_quiz_results_updated_at
BEFORE UPDATE ON public.quiz_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();