
import { Code2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  userEmail?: string;
  onLogout: () => void;
}

const DashboardHeader = ({ userEmail, onLogout }: DashboardHeaderProps) => (
  <header className="relative bg-black/30 backdrop-blur-xl border-b border-white/10 shadow-2xl">
    <div className="container mx-auto px-4 md:px-6 py-4 md:py-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2 md:space-x-3 group">
          <div className="relative">
            <Code2 className="h-8 w-8 md:h-10 md:w-10 text-purple-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
            <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              Codevance
            </h1>
            <p className="text-xs text-purple-300/70 font-medium tracking-wider hidden sm:block">DASHBOARD</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="text-right hidden md:block">
            <span className="text-slate-300 text-sm">Welcome back,</span>
            <p className="text-white font-semibold">{userEmail}</p>
          </div>
          <div className="text-right md:hidden">
            <p className="text-white font-semibold text-sm truncate max-w-32">{userEmail?.split('@')[0]}</p>
          </div>
          <Button 
            variant="ghost" 
            onClick={onLogout}
            className="text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 border border-transparent hover:border-white/20 text-sm md:text-base px-3 md:px-4 py-2"
          >
            <LogOut className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">Exit</span>
          </Button>
        </div>
      </div>
    </div>
  </header>
);

export default DashboardHeader;
