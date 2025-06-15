import { useProblemSync, globalSyncState, LinkedAccount } from './useProblemSync';

interface SyncManagerProps {
  onProblemsUpdate?: () => void;
  onSyncComplete: () => void;
}

export const useSyncManager = ({ onProblemsUpdate, onSyncComplete }: SyncManagerProps) => {
  // Just forward to the new hook, API remains unchanged for the rest of the app
  return useProblemSync({ onProblemsUpdate, onSyncComplete });
};
