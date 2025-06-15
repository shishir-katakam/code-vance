
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Sparkles, Zap } from 'lucide-react';
import { platforms } from './PlatformConfig';

interface AddAccountFormProps {
  showAddForm: boolean;
  newAccount: { platform: string; username: string };
  onAccountChange: (account: { platform: string; username: string }) => void;
  onAddAccount: () => void;
  onCancel: () => void;
}

const AddAccountForm = ({ 
  showAddForm, 
  newAccount, 
  onAccountChange, 
  onAddAccount, 
  onCancel 
}: AddAccountFormProps) => {
  if (!showAddForm) return null;

  return (
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
          <Select 
            value={newAccount.platform} 
            onValueChange={(value) => onAccountChange({ ...newAccount, platform: value })}
          >
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
            onChange={(e) => onAccountChange({ ...newAccount, username: e.target.value })}
            className="bg-black/60 border-white/30 text-white placeholder:text-gray-400 focus:bg-black/80 transition-all duration-300 focus:border-purple-400"
            placeholder="Your platform username"
          />
        </div>
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
          <Button 
            variant="ghost" 
            onClick={onCancel} 
            className="text-gray-300 hover:bg-white/10 transition-all duration-300 w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button 
            onClick={onAddAccount} 
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold transition-all duration-300 hover:scale-105 w-full sm:w-auto"
          >
            <Zap className="w-4 h-4 mr-2" />
            Link Account
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddAccountForm;
