
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trash2, RefreshCw, Zap, Clock, CheckCircle2 } from 'lucide-react';
import { getPlatformIcon, getPlatformColor, getPlatformData } from './PlatformConfig';

interface LinkedAccount {
  id: string;
  platform: string;
  username: string;
  is_active: boolean;
  last_sync: string | null;
}

interface AccountCardProps {
  account: LinkedAccount;
  index: number;
  syncingPlatforms: string[];
  syncProgress: {[key: string]: number};
  syncSpeed: {[key: string]: number};
  onSyncAccount: (account: LinkedAccount) => void;
  onRemoveAccount: (id: string, platform: string, username: string) => void;
}

const AccountCard = ({ 
  account, 
  index, 
  syncingPlatforms, 
  syncProgress, 
  syncSpeed, 
  onSyncAccount, 
  onRemoveAccount 
}: AccountCardProps) => {
  const platformData = getPlatformData(account.platform);
  const isSyncing = syncingPlatforms.includes(account.platform);
  const progress = syncProgress[account.platform] || 0;
  const speed = syncSpeed[account.platform] || 0;

  const formatLastSync = (lastSync: string | null) => {
    if (!lastSync) return 'Never synced';
    const date = new Date(lastSync);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <Card 
      className="bg-black/60 border-white/20 backdrop-blur-xl shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 hover:scale-[1.02] animate-fade-in group overflow-hidden"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full ${getPlatformColor(account.platform)} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
              {getPlatformIcon(account.platform)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                {account.platform}
                {account.is_active && (
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                )}
              </h3>
              <p className="text-slate-400">@{account.username}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {platformData?.hasSync && (
              <Button
                onClick={() => onSyncAccount(account)}
                disabled={isSyncing}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Syncing
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Sync
                  </>
                )}
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onRemoveAccount(account.id, account.platform, account.username)}
              className="hover:bg-red-600 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isSyncing && (
          <div className="mb-4 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-300">Syncing progress</span>
              <span className="text-purple-400 font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-700/50">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            {speed > 0 && (
              <div className="flex items-center text-xs text-slate-400">
                <Zap className="h-3 w-3 mr-1 text-yellow-400" />
                {speed.toFixed(1)} problems/sec
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-slate-400">
            <Clock className="h-4 w-4 mr-1" />
            Last sync: {formatLastSync(account.last_sync)}
          </div>
          <Badge variant={account.is_active ? "default" : "secondary"} className="bg-slate-700 text-slate-300">
            {account.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountCard;
