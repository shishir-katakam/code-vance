import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AddAccountForm from './LinkAccounts/AddAccountForm';
import AccountList from './LinkAccounts/AccountList';
import EmptyState from './LinkAccounts/EmptyState';
import { useSyncManager } from './LinkAccounts/SyncManager';
import { getPlatformData } from './LinkAccounts/PlatformConfig';
import { globalSyncState } from './LinkAccounts/problemSyncTypes';

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
  const [syncProgress, setSyncProgress] = useState<{[key: string]: number}>({});
  const [syncSpeed, setSyncSpeed] = useState<{[key: string]: number}>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const { handleSyncAccount } = useSyncManager({ 
    onProblemsUpdate, 
    onSyncComplete: () => {
      setSyncingPlatforms(Array.from(globalSyncState.syncingPlatforms));
      setSyncProgress({ ...globalSyncState.syncProgress });
      setSyncSpeed({ ...globalSyncState.syncSpeed });
      loadLinkedAccounts();
    }
  });

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
    }, 500);

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

      const platformData = getPlatformData(newAccount.platform);
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

      <AddAccountForm
        showAddForm={showAddForm}
        newAccount={newAccount}
        onAccountChange={setNewAccount}
        onAddAccount={handleAddAccount}
        onCancel={() => setShowAddForm(false)}
      />

      <div className="grid gap-6">
        {linkedAccounts.length > 0 ? (
          <AccountList
            linkedAccounts={linkedAccounts}
            syncingPlatforms={syncingPlatforms}
            syncProgress={syncProgress}
            syncSpeed={syncSpeed}
            onSyncAccount={handleSyncAccount}
            onRemoveAccount={handleRemoveAccount}
          />
        ) : (
          <EmptyState onAddAccount={() => setShowAddForm(true)} />
        )}
      </div>
    </div>
  );
};

export default LinkAccounts;
