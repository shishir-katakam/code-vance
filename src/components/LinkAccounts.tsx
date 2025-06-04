
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, RefreshCw, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
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
      const { error } = await supabase
        .from('linked_accounts')
        .insert({
          platform: newAccount.platform,
          username: newAccount.username,
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
      if (account.platform === 'LeetCode') {
        const { data, error } = await supabase.functions.invoke('sync-leetcode', {
          body: { username: account.username }
        });

        if (error) throw error;

        // Process and save the problems
        await processLeetCodeProblems(data.problems, account.id);
        
        // Update last sync time
        await supabase
          .from('linked_accounts')
          .update({ last_sync: new Date().toISOString() })
          .eq('id', account.id);

        toast({
          title: "Sync Complete",
          description: `${data.problems.length} problems synced from LeetCode!`,
        });
      } else {
        toast({
          title: "Coming Soon",
          description: `${account.platform} sync is not yet implemented.`,
        });
      }

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

  const processLeetCodeProblems = async (problems: any[], accountId: string) => {
    for (const problem of problems) {
      try {
        // Check if problem already exists
        const { data: existing } = await supabase
          .from('problems')
          .select('id')
          .eq('platform_problem_id', problem.platform_problem_id)
          .eq('platform', 'LeetCode')
          .single();

        if (existing) continue; // Skip if already exists

        // Analyze the problem with AI
        const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-problem', {
          body: {
            problemName: problem.title,
            description: problem.content,
            platform: 'LeetCode',
            currentProblems: [] // We'll handle this separately for synced problems
          }
        });

        const topic = analysisData?.topic || (problem.topics[0] || 'Arrays');
        const difficulty = problem.difficulty || 'Medium';

        // Insert the problem
        await supabase
          .from('problems')
          .insert({
            name: problem.title,
            description: problem.content.replace(/<[^>]*>/g, '').substring(0, 500) + '...',
            platform: 'LeetCode',
            topic,
            language: problem.language,
            difficulty,
            completed: true,
            url: problem.url,
            platform_problem_id: problem.platform_problem_id,
            synced_from_platform: true,
            platform_url: problem.url,
            solved_date: new Date(parseInt(problem.timestamp) * 1000).toISOString()
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
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Link Account
        </Button>
      </div>

      {showAddForm && (
        <Card className="bg-black/40 border-white/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white">Link New Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform" className="text-white">Platform</Label>
              <select
                id="platform"
                value={newAccount.platform}
                onChange={(e) => setNewAccount({ ...newAccount, platform: e.target.value })}
                className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-white"
              >
                <option value="">Select Platform</option>
                {platforms.map((platform) => (
                  <option key={platform.name} value={platform.name}>
                    {platform.icon} {platform.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">Username</Label>
              <Input
                id="username"
                value={newAccount.username}
                onChange={(e) => setNewAccount({ ...newAccount, username: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
                placeholder="Your platform username"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="ghost" onClick={() => setShowAddForm(false)} className="text-gray-300">
                Cancel
              </Button>
              <Button onClick={handleAddAccount} className="bg-purple-600 hover:bg-purple-700">
                Link Account
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {linkedAccounts.map((account) => (
          <Card key={account.id} className="bg-black/40 border-white/10 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full ${getPlatformColor(account.platform)} flex items-center justify-center text-white font-bold`}>
                    {getPlatformIcon(account.platform)}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{account.platform}</h3>
                    <p className="text-gray-300 text-sm">@{account.username}</p>
                    {account.last_sync && (
                      <p className="text-gray-400 text-xs">
                        Last synced: {new Date(account.last_sync).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
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
                    className="text-white border-white/20 hover:bg-white/10"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${syncingPlatforms.includes(account.platform) ? 'animate-spin' : ''}`} />
                    {syncingPlatforms.includes(account.platform) ? 'Syncing...' : 'Sync'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveAccount(account.id, account.platform)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
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
        <Card className="bg-black/40 border-white/10 backdrop-blur-md">
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <ExternalLink className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Linked Accounts</h3>
              <p>Link your coding platform accounts to automatically sync your solved problems.</p>
            </div>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-purple-600 hover:bg-purple-700"
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
