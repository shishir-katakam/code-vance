
-- Create a table to store platform statistics
CREATE TABLE public.platform_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  total_users INTEGER NOT NULL DEFAULT 0,
  total_problems INTEGER NOT NULL DEFAULT 0,
  total_platforms INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert initial real data
INSERT INTO public.platform_stats (total_users, total_problems, total_platforms)
VALUES (0, 0, 4);

-- Create a function to update statistics
CREATE OR REPLACE FUNCTION update_platform_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.platform_stats SET
    total_users = (SELECT COUNT(DISTINCT user_id) FROM public.problems WHERE user_id IS NOT NULL),
    total_problems = (SELECT COUNT(*) FROM public.problems),
    total_platforms = 4,
    last_updated = now()
  WHERE id = (SELECT id FROM public.platform_stats LIMIT 1);
  
  -- If no row exists, insert one
  IF NOT FOUND THEN
    INSERT INTO public.platform_stats (total_users, total_problems, total_platforms)
    VALUES (
      (SELECT COUNT(DISTINCT user_id) FROM public.problems WHERE user_id IS NOT NULL),
      (SELECT COUNT(*) FROM public.problems),
      4
    );
  END IF;
END;
$$;

-- Create a trigger to automatically update stats when problems are added/updated
CREATE OR REPLACE FUNCTION trigger_update_platform_stats()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM update_platform_stats();
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers for problems table
CREATE TRIGGER update_stats_on_problem_insert
  AFTER INSERT ON public.problems
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_platform_stats();

CREATE TRIGGER update_stats_on_problem_update
  AFTER UPDATE ON public.problems
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_platform_stats();

CREATE TRIGGER update_stats_on_problem_delete
  AFTER DELETE ON public.problems
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_platform_stats();

-- Enable Row Level Security and create policy for public read access
ALTER TABLE public.platform_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view platform stats" 
  ON public.platform_stats 
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- Initial update of statistics
SELECT update_platform_stats();
