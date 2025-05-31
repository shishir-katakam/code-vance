
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp } from 'lucide-react';

interface Problem {
  id: number;
  topic: string;
  language: string;
  completed: boolean;
}

interface TopicProgressProps {
  problems: Problem[];
}

const TopicProgress = ({ problems }: TopicProgressProps) => {
  // Calculate topic progress
  const topicStats = problems.reduce((acc, problem) => {
    const key = `${problem.topic}-${problem.language}`;
    if (!acc[key]) {
      acc[key] = {
        topic: problem.topic,
        language: problem.language,
        total: 0,
        completed: 0
      };
    }
    acc[key].total += 1;
    if (problem.completed) {
      acc[key].completed += 1;
    }
    return acc;
  }, {} as Record<string, any>);

  const topicProgress = Object.values(topicStats).map((stat: any) => ({
    ...stat,
    percentage: Math.round((stat.completed / stat.total) * 100)
  }));

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    if (percentage >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getAIRecommendation = (topic: string, percentage: number) => {
    if (percentage >= 80) {
      return `🎉 Excellent work on ${topic}! Consider tackling harder problems or move to advanced topics.`;
    } else if (percentage >= 60) {
      return `👍 Good progress on ${topic}! A few more problems and you'll master this topic.`;
    } else if (percentage >= 40) {
      return `📚 Keep practicing ${topic}. Focus on understanding core concepts.`;
    } else {
      return `🎯 Start with easier ${topic} problems to build your foundation.`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Topic Mastery */}
      <Card className="bg-black/40 border-white/10 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Brain className="h-5 w-5 mr-2 text-purple-400" />
            Topic Mastery
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topicProgress.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-white font-medium">{item.topic}</span>
                  <Badge variant="outline" className="text-xs text-gray-300 border-gray-500">
                    {item.language}
                  </Badge>
                </div>
                <span className={`text-sm font-medium ${getProgressColor(item.percentage)}`}>
                  {item.percentage}%
                </span>
              </div>
              <Progress value={item.percentage} className="h-2" />
              <p className="text-xs text-gray-400">
                {item.completed} of {item.total} problems completed
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className="bg-black/40 border-white/10 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topicProgress.slice(0, 3).map((item, index) => (
            <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm text-gray-300">
                {getAIRecommendation(item.topic, item.percentage)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default TopicProgress;
