
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
        const { data, error } = await supabase
          .from('platform_stats')
          .select('*')
          .single();

        if (error) {
          console.error('Error fetching stats:', error);
          setError(error.message);
        } else if (data) {
          setStats(data);
        }
      } catch (err) {
        console.error('Error:', err);
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
          if (payload.new) {
            setStats(payload.new as PlatformStats);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { stats, isLoading, error };
};
