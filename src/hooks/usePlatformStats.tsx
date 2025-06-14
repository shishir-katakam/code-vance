
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PlatformStats {
  total_users: number;
  total_problems: number;
  total_platforms: number;
  last_updated: string;
}

export const usePlatformStats = () => {
  const [stats, setStats] = useState<PlatformStats>({
    total_users: 0,
    total_problems: 0,
    total_platforms: 4,
    last_updated: new Date().toISOString()
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // First try to get from platform_stats table
        const { data: platformStats, error: platformError } = await supabase
          .from('platform_stats')
          .select('*')
          .single();

        if (platformError && platformError.code !== 'PGRST116') {
          console.error('Error fetching platform stats:', platformError);
        }

        // If no platform stats exist, calculate real-time from actual data
        if (!platformStats) {
          console.log('No platform stats found, calculating from real data...');
          
          // Get real user count
          const { data: usersData, error: usersError } = await supabase
            .from('problems')
            .select('user_id')
            .not('user_id', 'is', null);

          // Get real problems count
          const { data: problemsData, error: problemsError, count: problemsCount } = await supabase
            .from('problems')
            .select('*', { count: 'exact', head: true });

          if (usersError) {
            console.error('Error fetching users:', usersError);
          }
          if (problemsError) {
            console.error('Error fetching problems:', problemsError);
          }

          // Calculate unique users
          const uniqueUsers = usersData ? new Set(usersData.map(item => item.user_id)).size : 0;
          const totalProblems = problemsCount || 0;

          // Update platform stats table with real data
          const realStats = {
            total_users: uniqueUsers,
            total_problems: totalProblems,
            total_platforms: 4,
            last_updated: new Date().toISOString()
          };

          // Try to insert/update platform stats
          const { error: upsertError } = await supabase
            .from('platform_stats')
            .upsert(realStats);

          if (upsertError) {
            console.error('Error updating platform stats:', upsertError);
          }

          setStats(realStats);
        } else {
          setStats(platformStats);
        }
      } catch (err) {
        console.error('Error in fetchStats:', err);
        setError('Failed to fetch statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();

    // Set up real-time subscription for stats updates
    const channel = supabase
      .channel('platform-stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'platform_stats'
        },
        (payload) => {
          console.log('Platform stats updated:', payload);
          if (payload.new) {
            setStats(payload.new as PlatformStats);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'problems'
        },
        () => {
          // When problems change, recalculate stats
          console.log('Problems updated, recalculating stats...');
          setTimeout(fetchStats, 1000); // Small delay to ensure consistency
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { stats, isLoading, error };
};
