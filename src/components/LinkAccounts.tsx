
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

interface LinkedAccount {
  id: string;
  platform: string;
  username: string;
  is_active: boolean;
  last_sync: string | null;
}

const LinkAccounts = () => {
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAccount, setNewAccount] = useState({ platform: '', username: '' });
  const [syncingPlatforms, setSyncingPlatforms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const platforms = [
    { name: 'LeetCode', icon: '🔗', color: 'bg-orange-500' },
    { name: 'CodeChef', icon: '👨‍🍳', color: 'bg-purple-500' },
    { name: 'HackerRank', icon: '🚀', color: 'bg-green-500' },
    { name: 'Codeforces', icon: '⚡', color: 'bg-blue-500' },
    { name: 'GeeksforGeeks', icon: '🤓', color: 'bg-yellow-500' },
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
    if (!newAccount.platform || !newAccount.username) {
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

      const { error } = await supabase
        .from('linked_accounts')
        .insert({
          platform: newAccount.platform,
          username: newAccount.username,
          user_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `${newAccount.platform} account linked successfully!`,
      });

      setNewAccount({ platform: '', username: '' });
      setShowAddForm(false);
      loadLinkedAccounts();
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
      const { error } = await supabase
        .from('linked_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${platform} account removed successfully!`,
      });

      loadLinkedAccounts();
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
    
    try {
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

      await processProblems(data.problems, account.id, account.platform);
      
      await supabase
        .from('linked_accounts')
        .update({ last_sync: new Date().toISOString() })
        .eq('id', account.id);

      toast({
        title: "Sync Complete",
        description: `${data.problems.length} problems synced from ${account.platform}!`,
      });

      loadLinkedAccounts();
    } catch (error: any) {
      console.error('Error syncing account:', error);
      toast({
        title: "Sync Failed",
        description: error.message || `Failed to sync ${account.platform} account.`,
        variant: "destructive",
      });
    } finally {
      setSyncingPlatforms(prev => prev.filter(p => p !== account.platform));
    }
  };

  const processProblems = async (problems: any[], accountId: string, platform: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    for (const problem of problems) {
      try {
        const { data: existing } = await supabase
          .from('problems')
          .select('id')
          .eq('platform_problem_id', problem.platform_problem_id)
          .eq('platform', platform)
          .eq('user_id', user.id)
          .single();

        if (existing) continue;

        const { data: analysisData } = await supabase.functions.invoke('analyze-problem', {
          body: {
            problemName: problem.title,
            description: problem.content || problem.title,
            platform: platform,
            currentProblems: []
          }
        });

        const topic = analysisData?.topic || (problem.topics && problem.topics[0]) || 'Arrays';
        const difficulty = problem.difficulty || 'Medium';

        await supabase
          .from('problems')
          .insert({
            name: problem.title,
            description: (problem.content || problem.title).replace(/<[^>]*>/g, '').substring(0, 500) + (problem.content && problem.content.length > 500 ? '...' : ''),
            platform: platform,
            topic,
            language: problem.language || 'JavaScript',
            difficulty,
            completed: true,
            url: problem.url,
            platform_problem_id: problem.platform_problem_id,
            synced_from_platform: true,
            platform_url: problem.url,
            solved_date: problem.timestamp ? new Date(parseInt(problem.timestamp) * 1000).toISOString() : new Date().toISOString(),
            user_id: user.id
          });

      } catch (error) {
        console.error(`Error processing problem ${problem.title}:`, error);
      }
    }
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
                <SelectTrigger className="w-full bg-black/60 border-white/30 text-white">
                  <SelectValue placeholder="Select Platform" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/20">
                  {platforms.map((platform) => (
                    <SelectItem 
                      key={platform.name} 
                      value={platform.name}
                      className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                    >
                      <div className="flex items-center space-x-2">
                        <span>{platform.icon}</span>
                        <span>{platform.name}</span>
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
                className="bg-black/60 border-white/30 text-white placeholder:text-gray-400"
                placeholder="Your platform username"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="ghost" onClick={() => setShowAddForm(false)} className="text-gray-300 hover:bg-white/10">
                Cancel
              </Button>
              <Button onClick={handleAddAccount} className="bg-purple-600 hover:bg-purple-700 text-white">
                Link Account
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {linkedAccounts.map((account) => (
          <Card key={account.id} className="bg-black/60 border-white/20 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full ${getPlatformColor(account.platform)} flex items-center justify-center text-white font-bold text-lg`}>
                    {getPlatformIcon(account.platform)}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{account.platform}</h3>
                    <p className="text-gray-300 text-sm">@{account.username}</p>
                    {account.last_sync && (
                      <p className="text-gray-400 text-xs">
                        Last synced: {new Date(account.last_sync).toLocaleDateString()}
                      </p>
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
                    className="text-white border-white/30 hover:bg-white/10 bg-purple-600/20 font-semibold"
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
