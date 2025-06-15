
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

    // Custom: 2xx with error in body
    if (!error && data && typeof data === 'object' && 'error' in data && data.error) {
      await supabase
        .from('linked_accounts')
        .update({ last_sync: new Date().toISOString() })
        .eq('id', account.id);

      toast({
        title: "❌ No Problems Synced",
        description: typeof data.error === 'string'
          ? data.error.includes('No solved problems') || data.error.includes('not found')
            ? "No solved problems found or user does not exist. Please check the username."
            : data.error
          : "No solved problems found or user does not exist. Please check the username.",
        variant: "destructive"
      });

      if (onProblemsUpdate) onProblemsUpdate();
      return;
    }

    if (error) {
      const errorMessage = error.message || '';
      const isNoProblemsError =
        errorMessage.includes('No solved problems found') ||
        errorMessage.includes('user does not exist') ||
        errorMessage.includes('No problems found') ||
        errorMessage.includes('User not found');

      if (isNoProblemsError) {
        await supabase
          .from('linked_accounts')
          .update({ last_sync: new Date().toISOString() })
          .eq('id', account.id);

        toast({
          title: "❌ No Problems Synced",
          description: "No solved problems found or user does not exist. Please check the username.",
          variant: "destructive"
        });

        if (onProblemsUpdate) onProblemsUpdate();
        return;
      }
      throw new Error(`Sync failed: ${errorMessage}`);
    }

    // Enhanced: handle "no problems" (data exists but problems = [] or missing)
    if (!data || !Array.isArray(data.problems) || data.problems.length === 0) {
      await supabase
        .from('linked_accounts')
        .update({ last_sync: new Date().toISOString() })
        .eq('id', account.id);

      toast({
        title: "✅ Sync Complete!",
        description: `No solved problems found for this account. Please check the username or try syncing after you've solved some problems.`,
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
