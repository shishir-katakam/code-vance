
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, RefreshCw, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

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

const LinkAccounts = ({ onProblemsUpdate }: LinkAccountsProps) => {
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAccount, setNewAccount] = useState({ platform: '', username: '' });
  const [syncingPlatforms, setSyncingPlatforms] = useState<string[]>([]);
  const [syncProgress, setSyncProgress] = useState<{[key: string]: { current: number, total: number, message: string }}>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const platforms = [
    { name: 'LeetCode', icon: '💻', color: 'bg-orange-500', description: 'Sync your LeetCode solutions' },
    { name: 'CodeChef', icon: '🍳', color: 'bg-purple-500', description: 'Import CodeChef problems' },
    { name: 'HackerRank', icon: '🚀', color: 'bg-green-500', description: 'Track HackerRank progress' },
    { name: 'Codeforces', icon: '⚡', color: 'bg-blue-500', description: 'Sync Codeforces submissions' },
    { name: 'GeeksforGeeks', icon: '🤓', color: 'bg-yellow-500', description: 'Import GFG problems' },
  ];

  useEffect(() => {
    loadLinkedAccounts();
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

      toast({
        title: "Account Linked Successfully!",
        description: `${newAccount.platform} account @${newAccount.username} has been linked. Click "Sync Now" to import your problems.`,
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

  const handleRemoveAccount = async (id: string, platform: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First, delete all problems synced from this platform for this user
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

      // Then delete the linked account
      const { error } = await supabase
        .from('linked_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${platform} account and all synced problems removed successfully!`,
      });

      loadLinkedAccounts();
      if (onProblemsUpdate) onProblemsUpdate();
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
    setSyncingPlatforms(prev => [...prev, account.platform]);
    setSyncProgress(prev => ({ 
      ...prev, 
      [account.platform]: { current: 0, total: 0, message: 'Starting sync...' }
    }));
    
    try {
      console.log(`Starting sync for ${account.platform} with username: ${account.username}`);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Update progress: Clearing existing problems
      setSyncProgress(prev => ({ 
        ...prev, 
        [account.platform]: { current: 0, total: 0, message: 'Clearing existing problems...' }
      }));

      // Before syncing new data, remove all existing synced problems for this platform and user
      const { error: deleteError } = await supabase
        .from('problems')
        .delete()
        .eq('platform', account.platform)
        .eq('user_id', user.id)
        .eq('synced_from_platform', true);

      if (deleteError) {
        console.error('Error clearing existing problems:', deleteError);
      }

      // Trigger problems update immediately after clearing
      if (onProblemsUpdate) onProblemsUpdate();

      let syncFunction = '';
      
      switch (account.platform) {
        case 'LeetCode':
          syncFunction = 'sync-leetcode';
          break;
        case 'CodeChef':
          syncFunction = 'sync-codechef';
          break;
        case 'HackerRank':
          syncFunction = 'sync-hackerrank';
          break;
        case 'Codeforces':
          syncFunction = 'sync-codeforces';
          break;
        case 'GeeksforGeeks':
          syncFunction = 'sync-geeksforgeeks';
          break;
        default:
          throw new Error(`${account.platform} sync not implemented`);
      }

      // Update progress: Fetching data
      setSyncProgress(prev => ({ 
        ...prev, 
        [account.platform]: { current: 0, total: 0, message: 'Fetching problems from platform...' }
      }));

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

      console.log(`Received ${data.problems.length} problems from ${account.platform}`);
      
      // Update progress: Processing problems
      setSyncProgress(prev => ({ 
        ...prev, 
        [account.platform]: { current: 0, total: data.problems.length, message: 'Processing problems...' }
      }));

      const syncedCount = await processProblems(data.problems, account.id, account.platform);
      
      // Update last sync time
      await supabase
        .from('linked_accounts')
        .update({ last_sync: new Date().toISOString() })
        .eq('id', account.id);

      toast({
        title: "Sync Complete!",
        description: `Successfully synced ${syncedCount} problems from ${account.platform}!`,
      });

      await loadLinkedAccounts();
      if (onProblemsUpdate) onProblemsUpdate();
    } catch (error: any) {
      console.error('Error syncing account:', error);
      toast({
        title: "Sync Failed",
        description: error.message || `Failed to sync ${account.platform} account. Please check your username and try again.`,
        variant: "destructive",
      });
    } finally {
      setSyncingPlatforms(prev => prev.filter(p => p !== account.platform));
      setSyncProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[account.platform];
        return newProgress;
      });
    }
  };

  const processProblems = async (problems: any[], accountId: string, platform: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    let syncedCount = 0;
    const total = problems.length;
    const batchSize = 5; // Process in smaller batches for better performance

    for (let i = 0; i < problems.length; i += batchSize) {
      const batch = problems.slice(i, Math.min(i + batchSize, problems.length));
      
      // Update progress
      setSyncProgress(prev => ({ 
        ...prev, 
        [platform]: { 
          current: Math.min(i + batchSize, total), 
          total, 
          message: `Processing ${Math.min(i + batchSize, total)}/${total} problems...` 
        }
      }));

      // Process batch
      for (const problem of batch) {
        try {
          // Check if problem already exists
          const { data: existing } = await supabase
            .from('problems')
            .select('id')
            .eq('platform_problem_id', problem.platform_problem_id)
            .eq('platform', platform)
            .eq('user_id', user.id)
            .single();

          if (existing) {
            console.log(`Problem ${problem.title} already exists, skipping`);
            continue;
          }

          // Get topic analysis (simplified for speed)
          const topic = problem.topics?.[0] || 'Arrays';
          const difficulty = problem.difficulty || 'Medium';

          // Insert new problem
          const { error: insertError } = await supabase
            .from('problems')
            .insert({
              name: problem.title,
              description: (problem.content || problem.title).replace(/<[^>]*>/g, '').substring(0, 500) + (problem.content && problem.content.length > 500 ? '...' : ''),
              platform: platform,
              topic,
              language: problem.language || 'Python',
              difficulty,
              completed: true,
              url: problem.url,
              platform_problem_id: problem.platform_problem_id,
              synced_from_platform: true,
              platform_url: problem.url,
              solved_date: problem.timestamp ? new Date(parseInt(problem.timestamp) * 1000).toISOString() : new Date().toISOString(),
              user_id: user.id
            });

          if (insertError) {
            console.error(`Error inserting problem ${problem.title}:`, insertError);
          } else {
            syncedCount++;
            console.log(`Successfully synced problem: ${problem.title}`);
          }

        } catch (error) {
          console.error(`Error processing problem ${problem.title}:`, error);
        }
      }

      // Trigger UI update after each batch
      if (onProblemsUpdate) onProblemsUpdate();
      
      // Small delay to prevent overwhelming the UI
      await new Promise(resolve => setTimeout(resolve, 50));
    }

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
        <div className="text-white">Loading linked accounts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Linked Accounts</h2>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
        >
          <Plus className="h-4 w-4 mr-2" />
          Link Account
        </Button>
      </div>

      {showAddForm && (
        <Card className="bg-black/60 border-white/20 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white">Link New Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform" className="text-white font-medium">Platform</Label>
              <Select value={newAccount.platform} onValueChange={(value) => setNewAccount({ ...newAccount, platform: value })}>
                <SelectTrigger className="w-full bg-black/60 border-white/30 text-white hover:bg-black/80 focus:bg-black/80">
                  <SelectValue placeholder="Select Platform" />
                </SelectTrigger>
                <SelectContent className="bg-black/95 border-white/20 backdrop-blur-md">
                  {platforms.map((platform) => (
                    <SelectItem 
                      key={platform.name} 
                      value={platform.name}
                      className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer py-3"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full ${platform.color} flex items-center justify-center text-white font-bold text-sm`}>
                          {platform.icon}
                        </div>
                        <div>
                          <div className="font-medium">{platform.name}</div>
                          <div className="text-xs text-gray-400">{platform.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white font-medium">Username</Label>
              <Input
                id="username"
                value={newAccount.username}
                onChange={(e) => setNewAccount({ ...newAccount, username: e.target.value })}
                className="bg-black/60 border-white/30 text-white placeholder:text-gray-400 focus:bg-black/80"
                placeholder="Your platform username"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="ghost" onClick={() => setShowAddForm(false)} className="text-gray-300 hover:bg-white/10">
                Cancel
              </Button>
              <Button onClick={handleAddAccount} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold">
                Link Account
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {linkedAccounts.map((account) => (
          <Card key={account.id} className="bg-black/60 border-white/20 backdrop-blur-md hover:bg-black/70 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full ${platforms.find(p => p.name === account.platform)?.color || 'bg-gray-500'} flex items-center justify-center text-white font-bold text-lg`}>
                    {platforms.find(p => p.name === account.platform)?.icon || '🔗'}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{account.platform}</h3>
                    <p className="text-gray-300 text-sm">@{account.username}</p>
                    {account.last_sync && (
                      <p className="text-gray-400 text-xs">
                        Last synced: {new Date(account.last_sync).toLocaleDateString()}
                      </p>
                    )}
                    {syncProgress[account.platform] && (
                      <div className="mt-2 space-y-1">
                        <p className="text-blue-400 text-xs">{syncProgress[account.platform].message}</p>
                        {syncProgress[account.platform].total > 0 && (
                          <Progress 
                            value={(syncProgress[account.platform].current / syncProgress[account.platform].total) * 100} 
                            className="w-48 h-2"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant={account.is_active ? "default" : "secondary"} className="flex items-center space-x-1">
                    {account.is_active ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    <span>{account.is_active ? 'Active' : 'Inactive'}</span>
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSyncAccount(account)}
                    disabled={syncingPlatforms.includes(account.platform)}
                    className="text-white border-purple-500/50 hover:bg-purple-600/20 bg-purple-600/10 font-semibold hover:border-purple-400"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${syncingPlatforms.includes(account.platform) ? 'animate-spin' : ''}`} />
                    {syncingPlatforms.includes(account.platform) ? 'Syncing...' : 'Sync Now'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveAccount(account.id, account.platform)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {linkedAccounts.length === 0 && (
        <Card className="bg-black/60 border-white/20 backdrop-blur-md">
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <ExternalLink className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Linked Accounts</h3>
              <p>Link your coding platform accounts to automatically sync your solved problems.</p>
            </div>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Link Your First Account
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LinkAccounts;
