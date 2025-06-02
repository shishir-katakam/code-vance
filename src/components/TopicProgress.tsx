
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

// Define realistic problem counts needed for topic mastery
const TOPIC_MASTERY_REQUIREMENTS = {
  'Math': 15,
  'Arrays': 20,
  'Strings': 18,
  'Trees': 25,
  'Graphs': 30,
  'Dynamic Programming': 35,
  'Linked Lists': 15,
  'Stacks': 12,
  'Queues': 12,
  'Hash Tables': 15,
  'Heaps': 15,
  'Sorting': 10,
  'Searching': 12,
  'Recursion': 20,
  'Backtracking': 25,
  'Greedy': 20,
  'Bit Manipulation': 15,
  'Two Pointers': 15,
  'Sliding Window': 15,
};

const TopicProgress = ({ problems }: TopicProgressProps) => {
  // Calculate topic progress with realistic mastery requirements
  const topicStats = problems.reduce((acc, problem) => {
    const key = `${problem.topic}-${problem.language}`;
    if (!acc[key]) {
      acc[key] = {
        topic: problem.topic,
        language: problem.language,
        total: 0,
        completed: 0,
        requiredForMastery: TOPIC_MASTERY_REQUIREMENTS[problem.topic as keyof typeof TOPIC_MASTERY_REQUIREMENTS] || 20
      };
    }
    acc[key].total += 1;
    if (problem.completed) {
      acc[key].completed += 1;
    }
    return acc;
  }, {} as Record<string, any>);

  const topicProgress = Object.values(topicStats).map((stat: any) => {
    // Calculate percentage based on completed problems vs required for mastery
    // Cap at 90% to never show 100% until truly mastered
    const masteryPercentage = Math.min(90, Math.round((stat.completed / stat.requiredForMastery) * 100));
    // Calculate progress within current problems
    const currentProgress = Math.round((stat.completed / stat.total) * 100);
    
    return {
      ...stat,
      percentage: masteryPercentage,
      currentProgress: currentProgress,
      remainingProblems: Math.max(0, stat.requiredForMastery - stat.completed)
    };
  });

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    if (percentage >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getMasteryLevel = (percentage: number) => {
    if (percentage >= 80) return 'Advanced';
    if (percentage >= 60) return 'Intermediate';
    if (percentage >= 30) return 'Beginner';
    return 'Novice';
  };

  const getAIRecommendation = (topic: string, percentage: number, remainingProblems: number, completed: number) => {
    if (percentage >= 80) {
      return `🏆 Advanced level in ${topic}! You've solved ${completed} problems. ${remainingProblems} more problems to achieve true mastery.`;
    } else if (percentage >= 60) {
      return `🚀 Good progress in ${topic}! ${remainingProblems} more problems to reach advanced level.`;
    } else if (percentage >= 30) {
      return `📈 Building foundation in ${topic}. Keep practicing - ${remainingProblems} more problems for mastery.`;
    } else {
      return `🎯 Just started with ${topic}. Focus on easier problems first - ${remainingProblems} problems to master this topic.`;
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
                  <Badge 
                    variant="outline" 
                    className={`text-xs border-gray-500 ${getProgressColor(item.percentage)}`}
                  >
                    {getMasteryLevel(item.percentage)}
                  </Badge>
                </div>
                <span className={`text-sm font-medium ${getProgressColor(item.percentage)}`}>
                  {item.percentage}%
                </span>
              </div>
              <Progress value={item.percentage} className="h-2" />
              <div className="flex justify-between text-xs text-gray-400">
                <span>{item.completed} completed | {item.total} attempted</span>
                <span>{item.remainingProblems} more for mastery</span>
              </div>
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
                {getAIRecommendation(item.topic, item.percentage, item.remainingProblems, item.completed)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default TopicProgress;
