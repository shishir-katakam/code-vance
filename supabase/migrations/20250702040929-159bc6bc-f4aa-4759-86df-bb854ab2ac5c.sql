
-- Create a table to track AI question answers usage
CREATE TABLE public.ai_question_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  programming_language TEXT NOT NULL,
  problem_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.ai_question_answers ENABLE ROW LEVEL SECURITY;

-- Create policies for ai_question_answers
CREATE POLICY "Users can view their own AI answers" 
  ON public.ai_question_answers 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI answers" 
  ON public.ai_question_answers 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create a table to track daily usage limits
CREATE TABLE public.daily_ai_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  question_answers_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Add Row Level Security (RLS)
ALTER TABLE public.daily_ai_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for daily_ai_usage
CREATE POLICY "Users can view their own usage" 
  ON public.daily_ai_usage 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own usage" 
  ON public.daily_ai_usage 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
