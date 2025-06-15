
import { supabase } from '@/integrations/supabase/client';
import { getPlatformData } from './PlatformConfig';
import { processProblemsWithMetrics } from './problemSyncUtils';
import { globalSyncState, LinkedAccount } from './problemSyncTypes';

// The core sync logic used by the hook
export const performOptimizedSync = async (
  account: LinkedAccount,
  toast: any,
  onProblemsUpdate?: () => void
) => {
  const startTime = Date.now();
  try {
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

    const { data, error } = await supabase.functions.invoke(syncFunction, {
      body: { username: account.username }
    });

    // Handle the case where the edge function returns an error object in the data
    if (!error && data && typeof data === 'object' && 'error' in data && data.error) {
      await supabase
        .from('linked_accounts')
        .update({ last_sync: new Date().toISOString() })
        .eq('id', account.id);

      const errorMessage = typeof data.error === 'string' ? data.error : 'Unknown error occurred';
      
      // Check if this is a "user not found" error vs "no problems found" case
      const isUserNotFoundError = errorMessage.includes('not found') || 
                                  errorMessage.includes('does not exist') ||
                                  errorMessage.includes('User with handle');

      if (isUserNotFoundError) {
        toast({
          title: "❌ User Not Found",
          description: errorMessage,
          variant: "destructive"
        });
      } else {
        // This is likely a "no problems found" case - treat as success
        toast({
          title: "✅ Sync Complete!",
          description: "No solved problems found for this account. Start solving problems and sync again!",
        });
      }

      if (onProblemsUpdate) onProblemsUpdate();
      return;
    }

    // Handle HTTP errors from the edge function
    if (error) {
      const errorMessage = error.message || '';
      const isUserNotFoundError = 
        errorMessage.includes('not found') ||
        errorMessage.includes('does not exist') ||
        errorMessage.includes('User not found');

      await supabase
        .from('linked_accounts')
        .update({ last_sync: new Date().toISOString() })
        .eq('id', account.id);

      if (isUserNotFoundError) {
        toast({
          title: "❌ User Not Found",
          description: "User does not exist on this platform. Please check the username.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "✅ Sync Complete!",
          description: "No solved problems found for this account. Start solving problems and sync again!",
        });
      }

      if (onProblemsUpdate) onProblemsUpdate();
      return;
    }

    // Handle successful response but check if it has the success message for zero problems
    if (data && typeof data === 'object' && 'message' in data && data.message === "No solved problems found. Sync completed successfully.") {
      await supabase
        .from('linked_accounts')
        .update({ last_sync: new Date().toISOString() })
        .eq('id', account.id);

      toast({
        title: "✅ Sync Complete!",
        description: "No solved problems found for this account. Start solving problems and sync again!",
      });

      if (onProblemsUpdate) onProblemsUpdate();
      return;
    }

    // Handle case where no data or empty problems array
    if (!data || !Array.isArray(data.problems) || data.problems.length === 0) {
      await supabase
        .from('linked_accounts')
        .update({ last_sync: new Date().toISOString() })
        .eq('id', account.id);

      toast({
        title: "✅ Sync Complete!",
        description: "No solved problems found for this account. Start solving problems and sync again!",
      });

      if (onProblemsUpdate) onProblemsUpdate();
      return;
    }

    globalSyncState.syncProgress[account.platform] = 50;

    // Normal logic: problems exist
    const syncedCount = await processProblemsWithMetrics(
      data.problems,
      account.id,
      account.platform,
      startTime,
      onProblemsUpdate
    );

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

    if (onProblemsUpdate) onProblemsUpdate();
  } catch (err: any) {
    toast({
      title: "❌ Sync Failed",
      description: err.message || `Failed to sync ${account.platform}. Please check your username and try again.`,
      variant: "destructive",
    });
  }
};
