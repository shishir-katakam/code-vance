
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ExternalLink, Zap, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import EditProblemModal from './EditProblemModal';

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

interface ProblemListProps {
  problems: Problem[];
  onToggle: (id: number) => void;
  onUpdate?: () => void;
}

const ProblemList = ({ problems, onToggle, onUpdate }: ProblemListProps) => {
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [deletingIds, setDeletingIds] = useState<number[]>([]);
  const { toast } = useToast();

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

  const handleLinkClick = (url?: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleEdit = (problem: Problem) => {
    if (problem.synced_from_platform) {
      toast({
        title: "Cannot Edit",
        description: "Auto-synced problems cannot be edited manually.",
        variant: "destructive",
      });
      return;
    }
    setEditingProblem(problem);
  };

  const handleDelete = async (problem: Problem) => {
    if (problem.synced_from_platform) {
      toast({
        title: "Cannot Delete",
        description: "Auto-synced problems cannot be deleted manually.",
        variant: "destructive",
      });
      return;
    }

    setDeletingIds(prev => [...prev, problem.id]);

    try {
      const { error } = await supabase
        .from('problems')
        .delete()
        .eq('id', problem.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Problem deleted successfully!",
      });

      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting problem:', error);
      toast({
        title: "Error",
        description: "Failed to delete problem.",
        variant: "destructive",
      });
    } finally {
      setDeletingIds(prev => prev.filter(id => id !== problem.id));
    }
  };

  const handleEditSave = () => {
    setEditingProblem(null);
    if (onUpdate) {
      onUpdate();
    }
  };

  return (
    <>
      <div className="space-y-4">
        {problems.map((problem) => (
          <Card key={problem.id} className={`bg-black/40 border-white/10 backdrop-blur-md transition-all ${problem.completed ? 'opacity-75' : ''} ${problem.synced_from_platform ? 'border-purple-500/30' : ''}`}>
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
                    onClick={() => handleEdit(problem)}
                    disabled={problem.synced_from_platform}
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 p-2"
                    title={problem.synced_from_platform ? "Cannot edit auto-synced problems" : "Edit problem"}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(problem)}
                    disabled={problem.synced_from_platform || deletingIds.includes(problem.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-2"
                    title={problem.synced_from_platform ? "Cannot delete auto-synced problems" : "Delete problem"}
                  >
                    <Trash2 className={`h-4 w-4 ${deletingIds.includes(problem.id) ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {editingProblem && (
        <EditProblemModal
          problem={editingProblem}
          isOpen={!!editingProblem}
          onClose={() => setEditingProblem(null)}
          onSave={handleEditSave}
        />
      )}
    </>
  );
};

export default ProblemList;
