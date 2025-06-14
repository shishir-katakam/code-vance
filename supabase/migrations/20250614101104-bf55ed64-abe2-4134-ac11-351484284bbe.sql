
-- Create a function to reset platform statistics
CREATE OR REPLACE FUNCTION reset_platform_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Reset all stats to zero
  UPDATE public.platform_stats SET
    total_users = 0,
    total_problems = 0,
    total_platforms = 4,
    last_updated = now()
  WHERE id = (SELECT id FROM public.platform_stats LIMIT 1);
  
  -- If no row exists, insert one with zero values
  IF NOT FOUND THEN
    INSERT INTO public.platform_stats (total_users, total_problems, total_platforms)
    VALUES (0, 0, 4);
  END IF;
END;
$$;
