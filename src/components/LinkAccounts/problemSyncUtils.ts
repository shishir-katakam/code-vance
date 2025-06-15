
import { supabase } from '@/integrations/supabase/client';

export const processProblemsWithMetrics = async (
  problems: any[],
  accountId: string,
  platform: string,
  startTime: number,
  onProblemsUpdate?: () => void
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  let syncedCount = 0;
  const total = problems.length;
  const batchSize = 50;

  console.log(`Processing ${total} problems in batches of ${batchSize}`);

  for (let i = 0; i < problems.length; i += batchSize) {
    const batch = problems.slice(i, Math.min(i + batchSize, problems.length));
    await Promise.all(batch.map(async (problem) => {
      try {
        const { data: existing } = await supabase
          .from('problems')
          .select('id')
          .eq('platform_problem_id', problem.platform_problem_id)
          .eq('platform', platform)
          .eq('user_id', user.id)
          .single();

        if (existing) return;

        const topic = problem.topics?.[0] || null;
        const difficulty = problem.difficulty || null;
        const language = problem.language || null;

        const { error: insertError } = await supabase
          .from('problems')
          .insert({
            name: problem.title,
            description: (problem.content || problem.title).replace(/<[^>]*>/g, '').substring(0, 500) + (problem.content && problem.content.length > 500 ? '...' : ''),
            platform: platform,
            topic,
            language,
            difficulty,
            completed: true,
            url: problem.url,
            platform_problem_id: problem.platform_problem_id,
            synced_from_platform: true,
            platform_url: problem.url,
            solved_date: problem.timestamp ? new Date(parseInt(problem.timestamp) * 1000).toISOString() : new Date().toISOString(),
            user_id: user.id
          });

        if (!insertError) {
          syncedCount++;
        }
      } catch (error) {
        console.error(`Error processing problem:`, error);
      }
    }));

    // Performance metrics and progress updates must be performed by caller
    if (onProblemsUpdate && i % (batchSize * 2) === 0) onProblemsUpdate();
  }
  if (onProblemsUpdate) onProblemsUpdate();

  console.log(`Sync completed: ${syncedCount} problems processed out of ${total} total`);
  return syncedCount;
};
