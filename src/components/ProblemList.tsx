
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calendar, ExternalLink } from 'lucide-react';

interface Problem {
  id: number;
  name: string;
  description: string;
  platform: string;
  topic: string;
  language: string;
  difficulty: string;
  completed: boolean;
  dateAdded: string;
}

interface ProblemListProps {
  problems: Problem[];
  onToggle: (id: number) => void;
}

const ProblemList = ({ problems, onToggle }: ProblemListProps) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'LeetCode': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'CodeChef': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'GeeksforGeeks': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'HackerRank': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-4">
      {problems.map((problem) => (
        <Card key={problem.id} className={`bg-black/40 border-white/10 backdrop-blur-md transition-all ${problem.completed ? 'opacity-75' : ''}`}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <Checkbox
                  checked={problem.completed}
                  onCheckedChange={() => onToggle(problem.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className={`text-lg font-semibold ${problem.completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                      {problem.name}
                    </h3>
                    <ExternalLink className="h-4 w-4 text-gray-400 cursor-pointer hover:text-white" />
                  </div>
                  <p className="text-gray-300 mb-3 text-sm">{problem.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge className={getPlatformColor(problem.platform)}>
                      {problem.platform}
                    </Badge>
                    <Badge className={getDifficultyColor(problem.difficulty)}>
                      {problem.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-gray-300 border-gray-500">
                      {problem.topic}
                    </Badge>
                    <Badge variant="outline" className="text-gray-300 border-gray-500">
                      {problem.language}
                    </Badge>
                  </div>
                  <div className="flex items-center text-xs text-gray-400">
                    <Calendar className="h-3 w-3 mr-1" />
                    Added on {new Date(problem.dateAdded).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProblemList;
