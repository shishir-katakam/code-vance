
import { Users, Target, Shield } from "lucide-react";

interface StatsSectionProps {
  loading: boolean;
  realUserCount: number | null;
  statsLoading: boolean;
  stats: { total_users?: number; total_problems?: number; last_updated?: string };
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
}: StatsSectionProps) => (
  <div className={`bg-black/30 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/10 p-6 sm:p-8 md:p-12 mb-12 sm:mb-16 md:mb-24 mx-2 sm:mx-4 animate-fade-in delay-500 transition-all duration-500`}>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 md:gap-12 text-center">
      {[
        {
          number: loading ? "..." : formatNumber(realUserCount ?? 0),
          label: "Total Developers",
          icon: Users,
          isRealTime: true
        },
        {
          number: statsLoading ? "..." : formatNumber(stats.total_problems || 0),
          label: "Problems Tracked",
          icon: Target,
          isRealTime: true
        },
        {
          number: "99.9%",
          label: "Sync Accuracy",
          icon: Shield,
          isRealTime: false
        }
      ].map((stat, index) => (
        <div key={index} className="group">
          <div className="flex items-center justify-center mb-2 sm:mb-3 md:mb-4">
            <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
            {stat.isRealTime && (
              <div className="ml-1.5 sm:ml-2 flex items-center">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-xs md:text-xs text-green-400 ml-1 font-medium">LIVE</span>
              </div>
            )}
          </div>
          <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2 bg-gradient-to-br from-white to-purple-200 bg-clip-text text-transparent leading-tight">
            {stat.number}
          </div>
          <div className="text-slate-300 font-medium text-xs sm:text-sm md:text-base px-2">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
    {(realUserCount !== null && realUserCount > 0) || (!statsLoading && (!!stats.total_users || !!stats.total_problems)) ? (
      <div className="text-center mt-4 sm:mt-6 md:mt-8 text-xs sm:text-xs md:text-sm text-slate-400 px-2">
        📊 All statistics update automatically as users interact with the platform
      </div>
    ) : null}
  </div>
);

export default StatsSection;
