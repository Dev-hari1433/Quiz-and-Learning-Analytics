-- Create user profiles table for session-based users
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Session ID for session-based users
  display_name TEXT NOT NULL,
  user_name TEXT NOT NULL,
  total_xp INTEGER NOT NULL DEFAULT 0,
  total_quizzes INTEGER NOT NULL DEFAULT 0,
  total_correct_answers INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  study_time INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  research_sessions INTEGER NOT NULL DEFAULT 0,
  achievements TEXT[] NOT NULL DEFAULT '{}',
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz sessions table
CREATE TABLE public.quiz_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  time_spent INTEGER NOT NULL DEFAULT 0,
  score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create research activities table
CREATE TABLE public.research_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  query_text TEXT,
  time_spent INTEGER NOT NULL DEFAULT 0,
  results_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_activities ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since using session-based auth)
CREATE POLICY "Enable read access for all users" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.user_profiles FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON public.quiz_sessions FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.quiz_sessions FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON public.research_activities FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.research_activities FOR INSERT WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX idx_user_profiles_display_name ON public.user_profiles(display_name);
CREATE INDEX idx_quiz_sessions_user_id ON public.quiz_sessions(user_id);
CREATE INDEX idx_research_activities_user_id ON public.research_activities(user_id);