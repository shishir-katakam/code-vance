
import { Code2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  userEmail?: string;
  onLogout: () => void;
}

const DashboardHeader = ({ userEmail, onLogout }: DashboardHeaderProps) => (
  <header className="relative bg-black/30 backdrop-blur-xl border-b border-white/10 shadow-2xl">
    <div className="container mx-auto px-4 md:px-6 py-4 md:py-6">
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center space-x-2 md:space-x-3 group flex-shrink-0">
          <div className="relative">
            <Code2 className="h-6 w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 text-purple-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
            <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              Codevance
            </h1>
            <p className="text-xs text-purple-300/70 font-medium tracking-wider hidden sm:block">DASHBOARD</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4 min-w-0">
          <div className="text-right hidden md:block min-w-0">
            <span className="text-slate-300 text-sm">Welcome back,</span>
            <p className="text-white font-semibold truncate max-w-[200px]">{userEmail}</p>
          </div>
          <div className="text-right md:hidden min-w-0">
            <p className="text-white font-semibold text-sm truncate max-w-[120px]">{userEmail?.split('@')[0]}</p>
          </div>
          <Button 
            variant="ghost" 
            onClick={onLogout}
            className="text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 border border-transparent hover:border-white/20 text-sm md:text-base px-2 md:px-4 py-2 flex-shrink-0"
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
