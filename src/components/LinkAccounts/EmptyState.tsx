
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Plus } from 'lucide-react';

interface EmptyStateProps {
  onAddAccount: () => void;
}

const EmptyState = ({ onAddAccount }: EmptyStateProps) => {
  return (
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
          onClick={onAddAccount}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 md:px-8 md:py-3 text-base md:text-lg font-semibold transition-all duration-300 hover:scale-105 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 md:h-5 md:w-5 mr-2" />
          Link Your First Account
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
