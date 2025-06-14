
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, BarChart3, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
  total: number;
  completed: number;
  thisWeek: number;
}

const StatsCards = ({ total, completed, thisWeek }: StatsCardsProps) => {
  const statsArray = [
    {
      title: "Total Problems",
      value: total,
      icon: Target,
      color: "from-blue-500 to-cyan-500",
      delay: "delay-100"
    },
    {
      title: "Completed",
      value: completed,
      subtitle: `${total > 0 ? Math.round((completed / total) * 100) : 0}% completion rate`,
      icon: BarChart3,
      color: "from-green-500 to-emerald-500",
      delay: "delay-200"
    },
    {
      title: "This Week",
      value: thisWeek,
      subtitle: "Problems added",
      icon: TrendingUp,
      color: "from-purple-500 to-pink-500",
      delay: "delay-300"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
      {statsArray.map((stat, index) => (
        <Card key={index} className={`bg-black/40 border-white/10 backdrop-blur-xl hover:bg-black/60 transition-all duration-500 hover:scale-105 hover:-translate-y-2 shadow-xl hover:shadow-2xl animate-fade-in ${stat.delay}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-slate-300">{stat.title}</CardTitle>
            <div className={`p-2 rounded-xl bg-gradient-to-r ${stat.color}`}>
              <stat.icon className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
            {stat.subtitle && (
              <p className="text-xs text-slate-400">{stat.subtitle}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
