
import { Code2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  userEmail?: string;
  onLogout: () => void;
}

const DashboardHeader = ({ userEmail, onLogout }: DashboardHeaderProps) => (
  <header className="relative bg-black/30 backdrop-blur-xl border-b border-white/10 shadow-2xl">
    <div className="container mx-auto px-6 py-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3 group">
          <div className="relative">
            <Code2 className="h-10 w-10 text-purple-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
            <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              Codevance
            </h1>
            <p className="text-xs text-purple-300/70 font-medium tracking-wider">DASHBOARD</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <span className="text-slate-300 text-sm">Welcome back,</span>
            <p className="text-white font-semibold">{userEmail}</p>
          </div>
          <Button 
            variant="ghost" 
            onClick={onLogout}
            className="text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 border border-transparent hover:border-white/20"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  </header>
);

export default DashboardHeader;
