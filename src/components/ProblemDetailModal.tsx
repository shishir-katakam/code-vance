
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ExternalLink, MapPin, Target, Brain, MessageSquare, Loader2, Zap } from 'lucide-react';
import { Problem } from '@/types/problem';
import AiQuestionBox from './AiQuestionBox';

interface ProblemDetailModalProps {
  problem: Problem | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProblemDetailModal = ({ problem, isOpen, onClose }: ProblemDetailModalProps) => {
  const [showAiQuestion, setShowAiQuestion] = useState(false);

  if (!problem) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black/40 border-white/10 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-bold flex items-center space-x-2">
            <Target className="h-5 w-5 text-purple-400" />
            <span>{problem.name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Problem Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-blue-400" />
                <span className="text-gray-300">Platform:</span>
                <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {problem.platform || 'Not specified'}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-purple-400" />
                <span className="text-gray-300">Topic:</span>
                <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  {problem.topic || 'Not specified'}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Brain className="h-4 w-4 text-pink-400" />
                <span className="text-gray-300">Difficulty:</span>
                <Badge variant="outline" className={getDifficultyColor(problem.difficulty || '')}>
                  {problem.difficulty || 'Not specified'}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-green-400" />
                <span className="text-gray-300">Added:</span>
                <span className="text-white">
                  {new Date(problem.dateAdded).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {problem.description && (
            <div className="space-y-2">
              <h3 className="text-white font-semibold">Description</h3>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <p className="text-gray-300 leading-relaxed">{problem.description}</p>
              </div>
            </div>
          )}

          {/* URL */}
          {problem.url && (
            <div className="space-y-2">
              <h3 className="text-white font-semibold">Problem Link</h3>
              <a
                href={problem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Open Problem</span>
              </a>
            </div>
          )}

          {/* Status */}
          <div className="flex items-center space-x-2">
            <span className="text-gray-300">Status:</span>
            <Badge 
              variant="outline" 
              className={problem.completed 
                ? "bg-green-500/20 text-green-400 border-green-500/30" 
                : "bg-orange-500/20 text-orange-400 border-orange-500/30"
              }
            >
              {problem.completed ? '✅ Completed' : '⏳ In Progress'}
            </Badge>
          </div>

          {/* AI Answer Section */}
          <div className="border-t border-white/10 pt-6">
            {!showAiQuestion ? (
              <div className="text-center">
                <Button
                  onClick={() => setShowAiQuestion(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Get AI Answer for This Problem
                </Button>
                <p className="text-xs text-gray-400 mt-2">
                  Get personalized coding help with AI assistance
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-purple-400" />
                    <span>AI Assistant for {problem.name}</span>
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAiQuestion(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    Hide
                  </Button>
                </div>
                <AiQuestionBox 
                  problemName={problem.name} 
                  problemDescription={problem.description}
                  autoFillQuestion={true}
                />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProblemDetailModal;
