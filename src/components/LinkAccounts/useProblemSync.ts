
import { useToast } from '@/hooks/use-toast';
import { getPlatformData } from './PlatformConfig';
import { globalSyncState, LinkedAccount, UseProblemSyncOptions } from './problemSyncTypes';
import { performOptimizedSync } from './problemSyncCore';

export const useProblemSync = ({ onProblemsUpdate, onSyncComplete }: UseProblemSyncOptions) => {
  const { toast } = useToast();

  const handleSyncAccount = async (account: LinkedAccount) => {
    const platformData = getPlatformData(account.platform);

    if (!platformData?.hasSync) {
      toast({
        title: "Sync Not Available",
        description: `${account.platform} sync is not currently available. Your account is linked for future use.`,
        variant: "destructive",
      });
      return;
    }
    if (globalSyncState.activeSyncs.has(account.platform)) {
      toast({
        title: "⚡ Sync Already Running",
        description: `${account.platform} is syncing in the background at lightning speed!`,
      });
      return;
    }

    globalSyncState.syncingPlatforms.add(account.platform);
    globalSyncState.syncProgress[account.platform] = 0;
    globalSyncState.syncSpeed[account.platform] = 0;

    toast({
      title: "🚀 Sync Started!",
      description: `Initiating high-speed sync for ${account.platform}...`,
    });

    const syncPromise = performOptimizedSync(account, toast, onProblemsUpdate);
    globalSyncState.activeSyncs.set(account.platform, syncPromise);

    syncPromise.finally(() => {
      globalSyncState.syncingPlatforms.delete(account.platform);
      delete globalSyncState.syncProgress[account.platform];
      delete globalSyncState.syncSpeed[account.platform];
      globalSyncState.activeSyncs.delete(account.platform);

      onSyncComplete();
    });
  };

  return { handleSyncAccount, globalSyncState };
};
