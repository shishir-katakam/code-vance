
-- Allow anyone (anon + authenticated) to SELECT from problems table
CREATE POLICY "Public read for stats - problems"
  ON public.problems
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anyone to SELECT from platform_stats table for public stats
CREATE POLICY "Public read for stats - platform_stats"
  ON public.platform_stats
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anyone to SELECT from profiles (for public real user count)
CREATE POLICY "Public read for stats - profiles"
  ON public.profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);
