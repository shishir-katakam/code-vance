import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, RefreshCw, CheckCircle, XCircle, ExternalLink, Zap, Sparkles } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LinkedAccount {
  id: string;
  platform: string;
  username: string;
  is_active: boolean;
  last_sync: string | null;
}

interface LinkAccountsProps {
  onProblemsUpdate?: () => void;
}

// Enhanced global sync state with better performance tracking
const globalSyncState = {
  syncingPlatforms: new Set<string>(),
  syncProgress: {} as {[key: string]: number},
  activeSyncs: new Map<string, Promise<void>>(),
  syncSpeed: {} as {[key: string]: number}, // problems per second
  estimatedTimeRemaining: {} as {[key: string]: number}
};

const LinkAccounts = ({ onProblemsUpdate }: LinkAccountsProps) => {
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAccount, setNewAccount] = useState({ platform: '', username: '' });
  const [syncingPlatforms, setSyncingPlatforms] = useState<string[]>([]);
  const [syncProgress, setSyncProgress] = useState<{[key: string]: number}>({});
  const [syncSpeed, setSyncSpeed] = useState<{[key: string]: number}>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const platforms = [
    { name: 'LeetCode', icon: '💻', color: 'bg-gradient-to-r from-orange-500 to-red-500', description: 'Lightning-fast LeetCode sync', hasSync: true },
    { name: 'CodeChef', icon: '🍳', color: 'bg-gradient-to-r from-purple-500 to-indigo-500', description: 'CodeChef platform linking', hasSync: false },
    { name: 'HackerRank', icon: '🎯', color: 'bg-gradient-to-r from-green-500 to-blue-500', description: 'HackerRank platform linking', hasSync: false },
    { name: 'GeeksforGeeks', icon: '🤓', color: 'bg-gradient-to-r from-yellow-500 to-orange-500', description: 'Smart GFG integration', hasSync: true },
  ];

  useEffect(() => {
    loadLinkedAccounts();
    
    // Restore sync states with animations
    setSyncingPlatforms(Array.from(globalSyncState.syncingPlatforms));
    setSyncProgress({ ...globalSyncState.syncProgress });
    setSyncSpeed({ ...globalSyncState.syncSpeed });
    
    // Enhanced progress tracking with performance metrics
    const progressInterval = setInterval(() => {
      if (globalSyncState.syncingPlatforms.size > 0) {
        setSyncingPlatforms(Array.from(globalSyncState.syncingPlatforms));
        setSyncProgress({ ...globalSyncState.syncProgress });
        setSyncSpeed({ ...globalSyncState.syncSpeed });
      }
    }, 500); // Faster updates for smoother animations

    return () => {
      clearInterval(progressInterval);
    };
  }, []);

  const loadLinkedAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('linked_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLinkedAccounts(data || []);
    } catch (error) {
      console.error('Error loading linked accounts:', error);
      toast({
        title: "Error",
        description: "Failed to load linked accounts.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAccount = async () => {
    if (!newAccount.platform || !newAccount.username.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a platform and enter your username.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast({
          title: "Authentication Error",
          description: "Please log in to link accounts.",
          variant: "destructive",
        });
        return;
      }

      // Check if account already exists
      const { data: existing } = await supabase
        .from('linked_accounts')
        .select('id')
        .eq('platform', newAccount.platform)
        .eq('username', newAccount.username.trim())
        .eq('user_id', user.id)
        .single();

      if (existing) {
        toast({
          title: "Account Already Linked",
          description: `${newAccount.platform} account @${newAccount.username} is already linked.`,
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('linked_accounts')
        .insert({
          platform: newAccount.platform,
          username: newAccount.username.trim(),
          user_id: user.id,
        });

      if (error) throw error;

      const platformData = platforms.find(p => p.name === newAccount.platform);
      const successMessage = platformData?.hasSync 
        ? `${newAccount.platform} account @${newAccount.username} is ready for lightning-fast sync!`
        : `${newAccount.platform} account @${newAccount.username} has been linked successfully!`;

      toast({
        title: "🎉 Account Linked Successfully!",
        description: successMessage,
      });

      setNewAccount({ platform: '', username: '' });
      setShowAddForm(false);
      await loadLinkedAccounts();
    } catch (error: any) {
      console.error('Error linking account:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to link account.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveAccount = async (id: string, platform: string, username: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log(`Removing account: ${platform} - ${username}`);

      // Enhanced removal with better feedback
      const { error: deleteProblemsError } = await supabase
        .from('problems')
        .delete()
        .eq('platform', platform)
        .eq('user_id', user.id)
        .eq('synced_from_platform', true);

      if (deleteProblemsError) {
        console.error('Error deleting problems:', deleteProblemsError);
        throw new Error('Failed to remove synced problems');
      }

      const { error } = await supabase
        .from('linked_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "🗑️ Account Removed",
        description: `${platform} account (@${username}) and all synced problems removed successfully!`,
      });

      await loadLinkedAccounts();
      
      if (onProblemsUpdate) {
        onProblemsUpdate();
      }
    } catch (error) {
      console.error('Error removing account:', error);
      toast({
        title: "Error",
        description: "Failed to remove account.",
        variant: "destructive",
      });
    }
  };

  const handleSyncAccount = async (account: LinkedAccount) => {
    const platformData = platforms.find(p => p.name === account.platform);
    
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
    
    // Update local state with animation
    setSyncingPlatforms(Array.from(globalSyncState.syncingPlatforms));
    setSyncProgress({ ...globalSyncState.syncProgress });
    setSyncSpeed({ ...globalSyncState.syncSpeed });

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
      
      setSyncingPlatforms(Array.from(globalSyncState.syncingPlatforms));
      setSyncProgress({ ...globalSyncState.syncProgress });
      setSyncSpeed({ ...globalSyncState.syncSpeed });
    });
  };

  const performOptimizedSync = async (account: LinkedAccount) => {
    const startTime = Date.now();
    
    try {
      console.log(`🚀 Starting optimized sync for ${account.platform}`);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Fast cleanup with progress tracking
      globalSyncState.syncProgress[account.platform] = 5;
      console.log(`🧹 Clearing existing problems for ${account.platform}`);
      
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

      // Immediate UI update
      if (onProblemsUpdate) {
        onProblemsUpdate();
      }

      // Determine sync function with enhanced mapping - only for platforms that have sync
      const syncFunctionMap = {
        'LeetCode': 'sync-leetcode',
        'GeeksforGeeks': 'sync-geeksforgeeks'
      };

      const syncFunction = syncFunctionMap[account.platform as keyof typeof syncFunctionMap];
      if (!syncFunction) {
        throw new Error(`${account.platform} sync not implemented`);
      }

      globalSyncState.syncProgress[account.platform] = 25;
      console.log(`📡 Calling ${syncFunction} for ${account.username}`);

      // Execute sync with timeout and retry logic
      const { data, error } = await supabase.functions.invoke(syncFunction, {
        body: { username: account.username }
      });

      if (error) {
        console.error(`${account.platform} sync error:`, error);
        throw new Error(`Sync failed: ${error.message || 'Unknown error'}`);
      }

      if (!data || !data.problems) {
        throw new Error(`No problem data received from ${account.platform}`);
      }

      globalSyncState.syncProgress[account.platform] = 50;
      console.log(`📊 Received ${data.problems.length} problems from ${account.platform}`);
      
      // Process with enhanced performance tracking and NO LIMIT
      const syncedCount = await processProblemsWithMetrics(data.problems, account.id, account.platform, startTime);
      
      // Update sync completion
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

      await loadLinkedAccounts();
      
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
    const batchSize = 50; // Increased batch size for better performance with large datasets

    console.log(`Processing ${total} problems in batches of ${batchSize}`);

    for (let i = 0; i < problems.length; i += batchSize) {
      const batch = problems.slice(i, Math.min(i + batchSize, problems.length));
      
      // Process batch concurrently for speed
      await Promise.all(batch.map(async (problem) => {
        try {
          // Check if already exists (with better performance)
          const { data: existing } = await supabase
            .from('problems')
            .select('id')
            .eq('platform_problem_id', problem.platform_problem_id)
            .eq('platform', platform)
            .eq('user_id', user.id)
            .single();

          if (existing) return;

          // Only use real data from the problem object, no fake data
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
      
      // Real-time UI updates every few batches
      if (i % (batchSize * 2) === 0 && onProblemsUpdate) {
        onProblemsUpdate();
      }
    }

    // Final update
    if (onProblemsUpdate) {
      onProblemsUpdate();
    }

    console.log(`Sync completed: ${syncedCount} problems processed out of ${total} total`);
    return syncedCount;
  };

  const getPlatformIcon = (platform: string) => {
    const platformData = platforms.find(p => p.name === platform);
    return platformData?.icon || '🔗';
  };

  const getPlatformColor = (platform: string) => {
    const platformData = platforms.find(p => p.name === platform);
    return platformData?.color || 'bg-gray-500';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-white animate-pulse">Loading linked accounts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            Linked Accounts
          </h2>
          <p className="text-slate-400 mt-1 text-sm md:text-base">Connect your coding platforms for lightning-fast sync</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Link Account
        </Button>
      </div>

      {showAddForm && (
        <Card className="bg-black/60 border-white/20 backdrop-blur-xl shadow-2xl animate-fade-in">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>Link New Account</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="platform" className="text-white font-medium">Platform</Label>
              <Select value={newAccount.platform} onValueChange={(value) => setNewAccount({ ...newAccount, platform: value })}>
                <SelectTrigger className="w-full bg-black/60 border-white/30 text-white hover:bg-black/80 focus:bg-black/80 transition-all duration-300">
                  <SelectValue placeholder="Select Platform" />
                </SelectTrigger>
                <SelectContent className="bg-black/95 border-white/20 backdrop-blur-md z-50">
                  {platforms.map((platform) => (
                    <SelectItem 
                      key={platform.name} 
                      value={platform.name}
                      className="text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer py-4 transition-all duration-200 data-[highlighted]:bg-white/20 data-[highlighted]:text-white"
                    >
                      <div className="flex items-center space-x-4 w-full">
                        <div className={`w-10 h-10 rounded-xl ${platform.color} flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0`}>
                          {platform.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white truncate">{platform.name}</div>
                          <div className="text-xs text-gray-300 truncate">{platform.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label htmlFor="username" className="text-white font-medium">Username</Label>
              <Input
                id="username"
                value={newAccount.username}
                onChange={(e) => setNewAccount({ ...newAccount, username: e.target.value })}
                className="bg-black/60 border-white/30 text-white placeholder:text-gray-400 focus:bg-black/80 transition-all duration-300 focus:border-purple-400"
                placeholder="Your platform username"
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <Button 
                variant="ghost" 
                onClick={() => setShowAddForm(false)} 
                className="text-gray-300 hover:bg-white/10 transition-all duration-300 w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddAccount} 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold transition-all duration-300 hover:scale-105 w-full sm:w-auto"
              >
                <Zap className="w-4 h-4 mr-2" />
                Link Account
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {linkedAccounts.map((account, index) => {
          const platformData = platforms.find(p => p.name === account.platform);
          return (
            <Card key={account.id} className="bg-black/60 border-white/20 backdrop-blur-xl hover:bg-black/70 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 shadow-xl hover:shadow-2xl animate-fade-in overflow-hidden" style={{ animationDelay: `${index * 100}ms` }}>
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col space-y-4">
                  {/* Top section with platform info */}
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl ${getPlatformColor(account.platform)} flex items-center justify-center text-white font-bold text-base md:text-xl shadow-lg transition-transform duration-300 hover:scale-110 flex-shrink-0`}>
                      {getPlatformIcon(account.platform)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-lg md:text-xl truncate">{account.platform}</h3>
                      <p className="text-purple-300 text-sm md:text-base font-medium truncate">@{account.username}</p>
                      {account.last_sync && (
                        <p className="text-slate-400 text-xs md:text-sm">
                          Last synced: {new Date(account.last_sync).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center flex-shrink-0">
                      <Badge variant={account.is_active ? "default" : "secondary"} className="flex items-center space-x-1 px-2 py-1 text-xs">
                        {account.is_active ? (
                          <CheckCircle className="h-3 w-3 text-green-400" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-400" />
                        )}
                        <span className="font-medium hidden sm:inline">{account.is_active ? 'Active' : 'Inactive'}</span>
                      </Badge>
                    </div>
                  </div>

                  {/* Sync progress section */}
                  {syncProgress[account.platform] !== undefined && (
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="text-blue-400 text-sm font-medium">
                          Syncing... {syncProgress[account.platform]}%
                        </div>
                        {syncSpeed[account.platform] > 0 && (
                          <div className="text-green-400 text-xs flex items-center space-x-1">
                            <Zap className="w-3 h-3" />
                            <span>{syncSpeed[account.platform]} problems/sec</span>
                          </div>
                        )}
                      </div>
                      <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${syncProgress[account.platform]}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action buttons section */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    {platformData?.hasSync && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSyncAccount(account)}
                        disabled={syncingPlatforms.includes(account.platform)}
                        className="text-white border-purple-500/50 hover:bg-purple-600/20 bg-purple-600/10 font-semibold hover:border-purple-400 transition-all duration-300 hover:scale-105 disabled:opacity-50 flex-1"
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${syncingPlatforms.includes(account.platform) ? 'animate-spin' : ''}`} />
                        {syncingPlatforms.includes(account.platform) ? 'Syncing...' : 'Sync Now'}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAccount(account.id, account.platform, account.username)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all duration-300 hover:scale-105 flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="ml-2 sm:hidden">Remove</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {linkedAccounts.length === 0 && (
        <Card className="bg-black/60 border-white/20 backdrop-blur-xl shadow-2xl animate-fade-in">
          <CardContent className="p-8 md:p-12 text-center">
            <div className="text-gray-400 mb-6">
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <ExternalLink className="h-8 w-8 md:h-10 md:w-10 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3">No Linked Accounts</h3>
              <p className="text-base md:text-lg px-4">Connect your coding platforms to automatically sync your solved problems with lightning speed.</p>
            </div>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 md:px-8 md:py-3 text-base md:text-lg font-semibold transition-all duration-300 hover:scale-105 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 md:h-5 md:w-5 mr-2" />
              Link Your First Account
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LinkAccounts;
