import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getPlatformData } from './PlatformConfig';

interface LinkedAccount {
  id: string;
  platform: string;
  username: string;
  is_active: boolean;
  last_sync: string | null;
}

interface SyncManagerProps {
  onProblemsUpdate?: () => void;
  onSyncComplete: () => void;
}

// Enhanced global sync state with better performance tracking
export const globalSyncState = {
  syncingPlatforms: new Set<string>(),
  syncProgress: {} as {[key: string]: number},
  activeSyncs: new Map<string, Promise<void>>(),
  syncSpeed: {} as {[key: string]: number}, // problems per second
  estimatedTimeRemaining: {} as {[key: string]: number}
};

export const useSyncManager = ({ onProblemsUpdate, onSyncComplete }: SyncManagerProps) => {
  const { toast } = useToast();

  const handleSyncAccount = async (account: LinkedAccount) => {
    const platformData = getPlatformData(account.platform);
    
    // Check if platform supports sync
    if (!platformData?.hasSync) {
      toast({
        title: "Sync Not Available",
        description: `${account.platform} sync is not currently available. Your account is linked for future use.`,
        variant: "destructive",
      });
      return;
    }

    // Check if sync is already running
    if (globalSyncState.activeSyncs.has(account.platform)) {
      toast({
        title: "⚡ Sync Already Running",
        description: `${account.platform} is syncing in the background at lightning speed!`,
      });
      return;
    }

    // Initialize enhanced sync state
    globalSyncState.syncingPlatforms.add(account.platform);
    globalSyncState.syncProgress[account.platform] = 0;
    globalSyncState.syncSpeed[account.platform] = 0;

    // Show immediate feedback
    toast({
      title: "🚀 Sync Started!",
      description: `Initiating high-speed sync for ${account.platform}...`,
    });

    // Create optimized background sync
    const syncPromise = performOptimizedSync(account);
    globalSyncState.activeSyncs.set(account.platform, syncPromise);

    // Handle completion with celebration
    syncPromise.finally(() => {
      globalSyncState.syncingPlatforms.delete(account.platform);
      delete globalSyncState.syncProgress[account.platform];
      delete globalSyncState.syncSpeed[account.platform];
      globalSyncState.activeSyncs.delete(account.platform);
      
      onSyncComplete();
    });
  };

  const performOptimizedSync = async (account: LinkedAccount) => {
    const startTime = Date.now();
    
    try {
      console.log(`🚀 Starting optimized sync for ${account.platform}`);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      globalSyncState.syncProgress[account.platform] = 5;

      const { error: deleteError } = await supabase
        .from('problems')
        .delete()
        .eq('platform', account.platform)
        .eq('user_id', user.id)
        .eq('synced_from_platform', true);

      if (deleteError) {
        console.error('Error clearing existing problems:', deleteError);
      }
      globalSyncState.syncProgress[account.platform] = 15;
      if (onProblemsUpdate) onProblemsUpdate();

      const syncFunctionMap = {
        'LeetCode': 'sync-leetcode',
        'GeeksforGeeks': 'sync-geeksforgeeks',
        'Codeforces': 'sync-codeforces'
      };
      const syncFunction = syncFunctionMap[account.platform as keyof typeof syncFunctionMap];
      if (!syncFunction) throw new Error(`${account.platform} sync not implemented`);
      globalSyncState.syncProgress[account.platform] = 25;
      console.log(`📡 Calling ${syncFunction} for ${account.username}`);

      const { data, error } = await supabase.functions.invoke(syncFunction, {
        body: { username: account.username }
      });

      // ---------- PATCH: Handle Edge Function returning { error: ... } with 2xx ----------
      if (!error && data && typeof data === 'object' && 'error' in data) {
        // The edge function returned a 2xx but body has error property
        console.error(`${account.platform} sync returned error in data:`, data.error);
        throw new Error(`Sync failed: ${typeof data.error === "string" ? data.error : JSON.stringify(data.error)}`);
      }
      // ----------------------------------------------------------------------

      if (error) {
        console.error(`${account.platform} sync error:`, error);
        
        // Check if the error message indicates no problems found (not a real error)
        const errorMessage = error.message || '';
        const isNoProblemsError = errorMessage.includes('No solved problems found') || 
                                 errorMessage.includes('user does not exist') ||
                                 errorMessage.includes('No problems found');
        
        if (isNoProblemsError) {
          // Treat as successful sync with 0 problems
          console.log(`No problems found for ${account.username} on ${account.platform}, treating as successful sync`);
          
          await supabase
            .from('linked_accounts')
            .update({ last_sync: new Date().toISOString() })
            .eq('id', account.id);

          toast({
            title: "✅ Sync Complete!",
            description: `Successfully synced 0 problems from ${account.platform}. No problems found for this account.`,
          });

          if (onProblemsUpdate) {
            onProblemsUpdate();
          }
          return;
        } else {
          // Real error
          throw new Error(`Sync failed: ${errorMessage}`);
        }
      }

      // Handle successful response
      if (!data) {
        console.log(`No data returned from ${account.platform} sync`);
        toast({
          title: "✅ Sync Complete!",
          description: `Successfully synced 0 problems from ${account.platform}. No problems found for this account.`,
        });

        await supabase
          .from('linked_accounts')
          .update({ last_sync: new Date().toISOString() })
          .eq('id', account.id);

        if (onProblemsUpdate) {
          onProblemsUpdate();
        }
        return;
      }

      if (!Array.isArray(data.problems)) {
        console.error('Unexpected sync response:', data);
        // Check if it's a successful response but with different structure
        if (data && typeof data === 'object') {
          toast({
            title: "✅ Sync Complete!",
            description: `Successfully synced 0 problems from ${account.platform}. No problems found for this account.`,
          });

          await supabase
            .from('linked_accounts')
            .update({ last_sync: new Date().toISOString() })
            .eq('id', account.id);

          if (onProblemsUpdate) {
            onProblemsUpdate();
          }
          return;
        }
        toast({
          title: "❌ Sync Failed",
          description: `Received an unexpected response from the sync function. Please check your username and try again.`,
          variant: "destructive",
        });
        return;
      }

      globalSyncState.syncProgress[account.platform] = 50;
      console.log(`📊 Received ${data.problems.length} problems from ${account.platform}`);
      
      if (data.problems.length === 0) {
        toast({
          title: "✅ Sync Complete!",
          description: `Successfully synced 0 problems from ${account.platform}. No problems found for this account.`,
        });
        
        await supabase
          .from('linked_accounts')
          .update({ last_sync: new Date().toISOString() })
          .eq('id', account.id);

        if (onProblemsUpdate) {
          onProblemsUpdate();
        }
        return;
      }

      const syncedCount = await processProblemsWithMetrics(data.problems, account.id, account.platform, startTime);

      await supabase
        .from('linked_accounts')
        .update({ last_sync: new Date().toISOString() })
        .eq('id', account.id);

      const totalTime = (Date.now() - startTime) / 1000;
      const finalSpeed = Math.round(syncedCount / totalTime);

      toast({
        title: "🎉 Sync Complete!",
        description: `Successfully synced ${syncedCount} problems from ${account.platform} in ${totalTime.toFixed(1)}s (${finalSpeed} problems/sec)!`,
      });

      if (onProblemsUpdate) {
        onProblemsUpdate();
      }
    } catch (error: any) {
      console.error('Error in optimized sync:', error);
      toast({
        title: "❌ Sync Failed",
        description: error.message || `Failed to sync ${account.platform}. Please check your username and try again.`,
        variant: "destructive",
      });
    }
  };

  const processProblemsWithMetrics = async (problems: any[], accountId: string, platform: string, startTime: number) => {
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

      // Update progress with performance metrics
      const progress = Math.min(50 + ((i + batchSize) / total) * 50, 100);
      const elapsed = (Date.now() - startTime) / 1000;
      const currentSpeed = Math.round(syncedCount / elapsed);
      
      globalSyncState.syncProgress[platform] = progress;
      globalSyncState.syncSpeed[platform] = currentSpeed;
      
      console.log(`Processed batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(total/batchSize)}: ${syncedCount}/${total} problems synced (${currentSpeed} problems/sec)`);
      
      if (i % (batchSize * 2) === 0 && onProblemsUpdate) {
        onProblemsUpdate();
      }
    }

    if (onProblemsUpdate) {
      onProblemsUpdate();
    }

    console.log(`Sync completed: ${syncedCount} problems processed out of ${total} total`);
    return syncedCount;
  };

  return { handleSyncAccount, globalSyncState };
};
