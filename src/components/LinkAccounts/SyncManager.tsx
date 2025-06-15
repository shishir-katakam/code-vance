
// Import types from problemSyncTypes, not useProblemSync!
import { useProblemSync } from './useProblemSync';
import { globalSyncState, LinkedAccount } from './problemSyncTypes';

interface SyncManagerProps {
  onProblemsUpdate?: () => void;
  onSyncComplete: () => void;
}

export const useSyncManager = ({ onProblemsUpdate, onSyncComplete }: SyncManagerProps) => {
  // Just forward to the new hook, API remains unchanged for the rest of the app
  return useProblemSync({ onProblemsUpdate, onSyncComplete });
};
