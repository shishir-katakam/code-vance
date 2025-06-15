
import { Users, Target, UserPlus } from "lucide-react";

interface StatsSectionProps {
  loading: boolean;
  realUserCount: number | null;
  statsLoading: boolean;
  stats: { 
    total_users?: number; 
    total_problems?: number; 
    last_updated?: string;
  };
}

const formatNumber = (num: number) => {
  if (num === 0) return "0";
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

const StatsSection = ({
  loading,
  realUserCount,
  statsLoading,
  stats
}: StatsSectionProps) => {
  
  // Use the real user count from props, fallback to stats if needed
  const actualUserCount = realUserCount ?? stats.total_users ?? 0;
  const actualProblemsCount = stats.total_problems ?? 0;
  
  return (
    <div className="bg-black/30 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/10 p-6 sm:p-8 md:p-12 mb-12 sm:mb-16 md:mb-24 mx-2 sm:mx-4 animate-fade-in delay-500 transition-all duration-500 hover:bg-black/40 hover:border-white/20 hover:shadow-2xl hover:shadow-purple-500/20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 text-center">
        {[
          {
            number: loading ? "..." : formatNumber(actualUserCount),
            label: "Total Developers",
            icon: Users,
            isRealTime: true
          },
          {
            number: statsLoading ? "..." : formatNumber(actualProblemsCount),
            label: "Problems Solved",
            icon: Target,
            isRealTime: true
          }
        ].map((stat, index) => (
          <div 
            key={index} 
            className="group transform transition-all duration-500 hover:scale-105"
            style={{ 
              animationDelay: `${500 + index * 200}ms`,
              animationDuration: "1000ms"
            }}
          >
            <div className="flex items-center justify-center mb-2 sm:mb-3 md:mb-4 transition-all duration-300">
              <div className="relative">
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-purple-400 group-hover:scale-110 transition-all duration-300 group-hover:text-purple-300" />
                <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500 scale-150"></div>
              </div>
              {stat.isRealTime && (
                <div className="ml-1.5 sm:ml-2 flex items-center transition-all duration-300 group-hover:scale-105">
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 bg-green-400 rounded-full animate-subtle-pulse shadow-lg shadow-green-400/50"></div>
                  <span className="text-xs sm:text-xs md:text-xs text-green-400 ml-1 font-medium transition-all duration-300 group-hover:text-green-300">LIVE</span>
                </div>
              )}
            </div>
            <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2 bg-gradient-to-br from-white via-purple-200 to-pink-200 bg-clip-text text-transparent leading-tight transition-all duration-500 group-hover:scale-110">
              {stat.number}
            </div>
            <div className="text-slate-300 font-medium text-xs sm:text-sm md:text-base px-2 transition-all duration-300 group-hover:text-slate-200">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
      {((actualUserCount > 0) || (!statsLoading && (actualUserCount > 0 || actualProblemsCount > 0))) && (
        <div className="text-center mt-4 sm:mt-6 md:mt-8 text-xs sm:text-xs md:text-sm text-slate-400 px-2 animate-fade-in transition-all duration-300 hover:text-slate-300" style={{ animationDelay: '1s' }}>
          📊 All statistics update in real-time as users join and solve problems
        </div>
      )}
      
      {/* Additional info about total signups */}
      <div className="text-center mt-3 sm:mt-4 md:mt-5 text-xs text-slate-500 px-2 transition-all duration-300 hover:text-slate-400">
        Join {formatNumber(actualUserCount)} developers tracking their coding journey
      </div>
    </div>
  );
};

export default StatsSection;
