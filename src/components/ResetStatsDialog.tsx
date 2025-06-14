
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
      const { error } = await supabase.rpc('reset_platform_stats');
      
      if (error) throw error;

      toast({
        title: "Success",
        description: "Platform statistics have been reset successfully.",
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
            Reset Platform Statistics
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-300 space-y-3">
            <p className="font-medium text-red-300">
              ⚠️ This action cannot be undone!
            </p>
            <p>
              This will permanently reset all platform statistics including:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Total users count</li>
              <li>Total problems count</li>
              <li>All historical data</li>
            </ul>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mt-4">
              <p className="text-red-200 text-sm font-medium">
                Are you absolutely sure you want to proceed?
              </p>
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
            {isResetting ? 'Resetting...' : 'Yes, Reset All Stats'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ResetStatsDialog;
