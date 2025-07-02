
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ExternalLink, MapPin, Target, Edit, Eye } from 'lucide-react';
import { Problem } from '@/types/problem';
import EditProblemModal from '../EditProblemModal';
import ProblemDetailModal from '../ProblemDetailModal';

interface ProblemCardProps {
  problem: Problem;
  onToggle: (id: number) => void;
  onEdit?: (problem: Problem) => void;
  onDelete?: (problem: Problem) => Promise<void>;
  deleting?: boolean;
}

const ProblemCard = ({ problem, onToggle, onEdit, onDelete, deleting }: ProblemCardProps) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleSave = () => {
    if (onEdit) {
      onEdit(problem);
    }
    // Trigger a re-fetch or update of the problem list
    window.location.reload();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTopicColor = (topic: string) => {
    const colors = [
      'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'bg-pink-500/20 text-pink-400 border-pink-500/30',
      'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    ];
    const index = topic ? topic.length % colors.length : 0;
    return colors[index];
  };

  return (
    <>
      <Card className={`group relative bg-black/40 border-white/10 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 ${
        problem.completed ? 'ring-2 ring-green-500/30' : ''
      }`}>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col space-y-3 md:space-y-4">
            {/* Header with title and status */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 
                  className="text-white font-semibold text-sm md:text-lg truncate cursor-pointer hover:text-purple-300 transition-colors"
                  onClick={() => setShowDetailModal(true)}
                  title="Click to view details"
                >
                  {problem.name}
                </h3>
                {problem.platform && (
                  <div className="flex items-center space-x-1 mt-1">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-400">{problem.platform}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetailModal(true)}
                  className="h-8 w-8 p-0 opacity-70 hover:opacity-100 hover:bg-blue-500/20"
                  title="View Details"
                >
                  <Eye className="h-4 w-4 text-blue-400" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditModal(true)}
                  className="h-8 w-8 p-0 opacity-70 hover:opacity-100 hover:bg-purple-500/20"
                  title="Edit Problem"
                >
                  <Edit className="h-4 w-4 text-purple-400" />
                </Button>
              </div>
            </div>

            {/* Tags section */}
            <div className="flex flex-wrap gap-2">
              {problem.topic && (
                <Badge variant="outline" className={`text-xs ${getTopicColor(problem.topic)}`}>
                  <Target className="h-3 w-3 mr-1" />
                  {problem.topic}
                </Badge>
              )}
              {problem.difficulty && (
                <Badge variant="outline" className={`text-xs ${getDifficultyColor(problem.difficulty)}`}>
                  {problem.difficulty}
                </Badge>
              )}
            </div>

            {/* Description preview */}
            {problem.description && (
              <p className="text-gray-400 text-xs md:text-sm line-clamp-2 leading-relaxed">
                {problem.description.length > 100 
                  ? `${problem.description.substring(0, 100)}...` 
                  : problem.description
                }
              </p>
            )}

            {/* Footer with date and actions */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <Calendar className="h-3 w-3" />
                <span>{new Date(problem.dateAdded).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center space-x-2">
                {problem.url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(problem.url, '_blank');
                    }}
                    className="h-8 px-2 text-xs opacity-70 hover:opacity-100 hover:bg-blue-500/20"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Open
                  </Button>
                )}
                
                <Button
                  onClick={() => onToggle(problem.id)}
                  size="sm"
                  className={`h-8 px-3 text-xs transition-all duration-300 ${
                    problem.completed
                      ? 'bg-green-600/80 hover:bg-green-700 text-white'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                  }`}
                >
                  {problem.completed ? '✓ Done' : 'Mark Done'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditProblemModal
        problem={problem}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSave}
      />

      <ProblemDetailModal
        problem={problem}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
    </>
  );
};

export default ProblemCard;
