
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ResetStatsDialogProps {
  onStatsReset?: () => void;
}

const ResetStatsDialog = ({ onStatsReset }: ResetStatsDialogProps) => {
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

  const handleResetStats = async () => {
    setIsResetting(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Delete all problems for the current user
      const { error: deleteError } = await supabase
        .from('problems')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Reset platform stats
      const { error: resetError } = await supabase.rpc('reset_platform_stats');
      
      if (resetError) throw resetError;

      toast({
        title: "Success",
        description: "Your statistics and problems have been reset successfully.",
      });

      if (onStatsReset) {
        onStatsReset();
      }
    } catch (error) {
      console.error('Error resetting stats:', error);
      toast({
        title: "Error",
        description: "Failed to reset statistics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="text-red-400 border-red-400/30 hover:bg-red-400/10 hover:border-red-400/50 hover:text-red-300 transition-all duration-300"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Stats
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-gradient-to-br from-slate-900 to-purple-900 border-red-500/20 max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            Reset Your Statistics
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-300">
            <div className="space-y-3">
              <div className="font-medium text-red-300">
                ⚠️ This action cannot be undone!
              </div>
              <div>
                This will permanently reset your personal statistics including:
              </div>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>All your problems will be deleted</li>
                <li>Your completion progress</li>
                <li>Your weekly activity data</li>
                <li>Platform-wide statistics</li>
              </ul>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mt-4">
                <div className="text-red-200 text-sm font-medium">
                  Your account will remain active. Are you sure you want to proceed?
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-slate-600 hover:bg-slate-700 text-white border-slate-500">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleResetStats}
            disabled={isResetting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isResetting ? 'Resetting...' : 'Yes, Reset Everything'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ResetStatsDialog;
