import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Calendar, ExternalLink, Zap, Edit, Trash2 } from 'lucide-react';

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
  url?: string;
  synced_from_platform?: boolean;
  solved_date?: string;
}

interface ProblemCardProps {
  problem: Problem;
  onToggle: (id: number) => void;
  onEdit: (problem: Problem) => void;
  onDelete: (problem: Problem) => void;
  deleting: boolean;
}

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
    case 'Codeforces': return 'bg-red-500/20 text-red-400 border-red-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

const ProblemCard = ({
  problem,
  onToggle,
  onEdit,
  onDelete,
  deleting,
}: ProblemCardProps) => {
  const handleLinkClick = (url?: string) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card
      className={`bg-black/40 border-white/10 backdrop-blur-md transition-all ${problem.completed ? 'opacity-75' : ''} ${problem.synced_from_platform ? 'border-purple-500/30' : ''}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <Checkbox
              checked={problem.completed}
              onCheckedChange={() => onToggle(problem.id)}
              className="mt-1"
              disabled={problem.synced_from_platform}
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className={`text-lg font-semibold ${problem.completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                  {problem.name}
                </h3>
                {problem.synced_from_platform && (
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                    <Zap className="h-3 w-3 mr-1" />
                    Auto-synced
                  </Badge>
                )}
                {problem.url && (
                  <ExternalLink
                    className="h-4 w-4 text-gray-400 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleLinkClick(problem.url)}
                  />
                )}
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
                {problem.synced_from_platform && problem.solved_date ? (
                  <>Solved on {new Date(problem.solved_date).toLocaleDateString()}</>
                ) : (
                  <>Added on {new Date(problem.dateAdded).toLocaleDateString()}</>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(problem)}
              disabled={problem.synced_from_platform}
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 p-2"
              title={problem.synced_from_platform ? "Cannot edit auto-synced problems" : "Edit problem"}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={problem.synced_from_platform || deleting}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-2"
                  title={problem.synced_from_platform ? "Cannot delete auto-synced problems" : "Delete problem"}
                >
                  <Trash2 className={`h-4 w-4 ${deleting ? 'animate-spin' : ''}`} />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-slate-900/95 backdrop-blur-md border border-white/20 shadow-2xl max-w-md mx-auto">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white text-xl font-semibold text-center">
                    Delete Problem?
                  </AlertDialogTitle>
                  <AlertDialogDescription 
                    className="text-gray-100 text-base font-medium text-center mt-2"
                  >
                    This action cannot be undone. The problem "{problem.name}" will be permanently deleted from your collection.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex flex-col gap-3 w-full mt-6">
                  <AlertDialogAction
                    onClick={() => onDelete(problem)}
                    className="bg-red-600 hover:bg-red-700 text-white w-full py-3 font-medium transition-colors"
                  >
                    Delete Problem
                  </AlertDialogAction>
                  <AlertDialogCancel className="bg-gray-700/80 text-white border-gray-600 hover:bg-gray-600 w-full py-3 font-medium transition-colors">
                    Cancel
                  </AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProblemCard;
