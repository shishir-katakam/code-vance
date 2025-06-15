
import AccountCard from './AccountCard';

interface LinkedAccount {
  id: string;
  platform: string;
  username: string;
  is_active: boolean;
  last_sync: string | null;
}

interface AccountListProps {
  linkedAccounts: LinkedAccount[];
  syncingPlatforms: string[];
  syncProgress: {[key: string]: number};
  syncSpeed: {[key: string]: number};
  onSyncAccount: (account: LinkedAccount) => void;
  onRemoveAccount: (id: string, platform: string, username: string) => void;
}

const AccountList = ({ 
  linkedAccounts, 
  syncingPlatforms, 
  syncProgress, 
  syncSpeed, 
  onSyncAccount, 
  onRemoveAccount 
}: AccountListProps) => {
  return (
    <>
      {linkedAccounts.map((account, index) => (
        <AccountCard
          key={account.id}
          account={account}
          index={index}
          syncingPlatforms={syncingPlatforms}
          syncProgress={syncProgress}
          syncSpeed={syncSpeed}
          onSyncAccount={onSyncAccount}
          onRemoveAccount={onRemoveAccount}
        />
      ))}
    </>
  );
};

export default AccountList;
