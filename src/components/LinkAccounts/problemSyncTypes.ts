
export interface LinkedAccount {
  id: string;
  platform: string;
  username: string;
  is_active: boolean;
  last_sync: string | null;
}

export interface SyncState {
  syncingPlatforms: Set<string>;
  syncProgress: { [key: string]: number };
  activeSyncs: Map<string, Promise<void>>;
  syncSpeed: { [key: string]: number };
  estimatedTimeRemaining: { [key: string]: number };
}

// Actual initial value
export const globalSyncState: SyncState = {
  syncingPlatforms: new Set(),
  syncProgress: {},
  activeSyncs: new Map(),
  syncSpeed: {},
  estimatedTimeRemaining: {},
};

export interface UseProblemSyncOptions {
  onProblemsUpdate?: () => void;
  onSyncComplete: () => void;
}
