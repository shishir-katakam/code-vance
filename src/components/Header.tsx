
import { Button } from '@/components/ui/button';
import { Code2, User, LogOut } from 'lucide-react';

const Header = () => {
  const handleLogout = () => {
    window.location.reload();
  };

  return (
    <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Code2 className="h-8 w-8 text-purple-400" />
          <h1 className="text-2xl font-bold text-white">Codevance</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-white">
            <User className="h-5 w-5" />
            <span>John Doe</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleLogout}
            className="text-white hover:bg-white/10"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
