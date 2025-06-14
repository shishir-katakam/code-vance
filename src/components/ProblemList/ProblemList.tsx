
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import EditProblemModal from '@/components/EditProblemModal';
import ProblemCard from './ProblemCard';

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
  const [optimisticProblems, setOptimisticProblems] = useState<Problem[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const { toast } = useToast();

  const itemsPerPage = 5;
  const totalPages = Math.ceil(problems.length / itemsPerPage);

  const displayedProblems = showAll
    ? (optimisticProblems || problems).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : (optimisticProblems || problems).slice(0, itemsPerPage);

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

    // Optimistically remove from UI
    setDeletingIds((prev) => [...prev, problem.id]);
    const origProblems = optimisticProblems || problems;
    setOptimisticProblems(origProblems.filter((p) => p.id !== problem.id));

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

      if (onUpdate) onUpdate();
    } catch (error) {
      // Restore
      setOptimisticProblems(origProblems);
      toast({
        title: "Error",
        description: "Failed to delete problem.",
        variant: "destructive",
      });
    } finally {
      setDeletingIds((prev) => prev.filter((id) => id !== problem.id));
    }
  };

  const handleEditSave = () => {
    setEditingProblem(null);
    if (onUpdate) onUpdate();
  };

  const handleShowAll = () => {
    setShowAll(true);
    setCurrentPage(1);
  };

  const handleShowLess = () => {
    setShowAll(false);
    setCurrentPage(1);
  };

  return (
    <>
      <div className="space-y-4">
        {displayedProblems.map((problem) => (
          <ProblemCard
            key={problem.id}
            problem={problem}
            onToggle={onToggle}
            onEdit={handleEdit}
            onDelete={handleDelete}
            deleting={deletingIds.includes(problem.id)}
          />
        ))}
      </div>
      {problems.length > itemsPerPage && (
        <div className="flex flex-col items-center space-y-4 mt-6">
          {!showAll ? (
            <Button
              onClick={handleShowAll}
              variant="outline"
              className="bg-black/40 border-white/20 text-white hover:bg-white/10"
            >
              <ChevronDown className="h-4 w-4 mr-2" />
              Show All Problems ({problems.length})
            </Button>
          ) : (
            <>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleShowLess}
                  variant="outline"
                  className="bg-black/40 border-white/20 text-white hover:bg-white/10"
                >
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Show Less
                </Button>
                <span className="text-gray-400 text-sm">
                  Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, problems.length)} of {problems.length} problems
                </span>
              </div>
              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-white/10'} text-white border-white/20`}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className={`cursor-pointer text-white border-white/20 ${
                            currentPage === page
                              ? 'bg-purple-600 hover:bg-purple-700'
                              : 'hover:bg-white/10'
                          }`}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        className={`${currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-white/10'} text-white border-white/20`}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </div>
      )}
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
