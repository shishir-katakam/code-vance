
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return diffHours > 0 ? `${diffDays}d ${diffHours}h ago` : `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else {
      return 'Today';
    }
  };

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black/40 border-white/10 backdrop-blur-md animate-scale-in">
        <DialogHeader className="animate-fade-in">
          <DialogTitle className="text-white text-xl font-bold flex items-center space-x-2 group">
            <Target className="h-5 w-5 text-purple-400 transition-transform duration-300 group-hover:rotate-12" />
            <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              {problem.name}
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 animate-fade-in"
             style={{ animationDelay: '0.1s' }}>
          {/* Problem Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 hover-scale">
              <div className="flex items-center space-x-3 group p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
                <MapPin className="h-4 w-4 text-blue-400 transition-transform duration-300 group-hover:scale-110" />
                <span className="text-gray-300">Platform:</span>
                <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30 transition-all duration-300">
                  {problem.platform || 'Not specified'}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-3 group p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
                <Target className="h-4 w-4 text-purple-400 transition-transform duration-300 group-hover:scale-110" />
                <span className="text-gray-300">Topic:</span>
                <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30 transition-all duration-300">
                  {problem.topic || 'Not specified'}
                </Badge>
              </div>
            </div>

            <div className="space-y-4 hover-scale">
              <div className="flex items-center space-x-3 group p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20">
                <Brain className="h-4 w-4 text-pink-400 transition-transform duration-300 group-hover:scale-110" />
                <span className="text-gray-300">Difficulty:</span>
                <Badge variant="outline" className={`${getDifficultyColor(problem.difficulty || '')} hover:scale-105 transition-all duration-300`}>
                  {problem.difficulty || 'Not specified'}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-3 group p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20">
                <Calendar className="h-4 w-4 text-green-400 transition-transform duration-300 group-hover:scale-110" />
                <span className="text-gray-300">Added:</span>
                <span className="text-white">
                  {formatDate(problem.dateAdded)}
                </span>
                <span className="text-green-400 text-sm font-medium animate-pulse">
                  ({getTimeAgo(problem.dateAdded)})
                </span>
              </div>

              {problem.completed && problem.solvedDate && (
                <div className="flex items-center space-x-3 group p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 animate-scale-in">
                  <Zap className="h-4 w-4 text-purple-400 transition-transform duration-300 group-hover:scale-110" />
                  <span className="text-gray-300">Completed:</span>
                  <span className="text-white">
                    {formatDate(problem.solvedDate)}
                  </span>
                  <span className="text-purple-400 text-sm font-medium bg-purple-500/20 px-2 py-1 rounded-full">
                    ({Math.ceil((new Date(problem.solvedDate).getTime() - new Date(problem.dateAdded).getTime()) / (1000 * 60 * 60 * 24))} days)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {problem.description && (
            <div className="space-y-3 animate-fade-in hover-scale" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-white font-semibold flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-blue-400" />
                <span>Description</span>
              </h3>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
                <p className="text-gray-300 leading-relaxed">{problem.description}</p>
              </div>
            </div>
          )}

          {/* URL */}
          {problem.url && (
            <div className="space-y-3 animate-fade-in hover-scale" style={{ animationDelay: '0.3s' }}>
              <h3 className="text-white font-semibold flex items-center space-x-2">
                <ExternalLink className="h-4 w-4 text-green-400" />
                <span>Problem Link</span>
              </h3>
              <a
                href={problem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-all duration-300 hover:scale-105 bg-blue-500/10 hover:bg-blue-500/20 px-4 py-2 rounded-lg border border-blue-500/30 hover:border-blue-400/50"
              >
                <ExternalLink className="h-4 w-4 transition-transform duration-300 hover:scale-110" />
                <span>Open Problem</span>
              </a>
            </div>
          )}

          {/* Status */}
          <div className="flex items-center space-x-3 animate-fade-in hover-scale" style={{ animationDelay: '0.4s' }}>
            <span className="text-gray-300">Status:</span>
            <Badge 
              variant="outline" 
              className={`${problem.completed 
                ? "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30" 
                : "bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30"
              } transition-all duration-300 hover:scale-105`}
            >
              {problem.completed ? '✅ Completed' : '⏳ In Progress'}
            </Badge>
          </div>

          {/* AI Answer Section */}
          <div className="border-t border-white/10 pt-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            {!showAiQuestion ? (
              <div className="text-center space-y-4">
                <Button
                  onClick={() => setShowAiQuestion(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 group"
                >
                  <Brain className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:rotate-12" />
                  Get AI Answer for This Problem
                </Button>
                <p className="text-xs text-gray-400 animate-pulse">
                  Get personalized coding help with AI assistance
                </p>
              </div>
            ) : (
              <div className="space-y-4 animate-scale-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-purple-400" />
                    <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                      AI Assistant for {problem.name}
                    </span>
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAiQuestion(false)}
                    className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-105"
                  >
                    Hide
                  </Button>
                </div>
                <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <AiQuestionBox 
                    problemName={problem.name} 
                    problemDescription={problem.description}
                    autoFillQuestion={true}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProblemDetailModal;
