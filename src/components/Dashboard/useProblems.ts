
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Problem {
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
  user_id?: string;
}

export const useProblems = (user: any) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [problemsTabKey, setProblemsTabKey] = useState(0);

  const { toast } = useToast();

  const loadProblems = async () => {
    try {
      let allProblems: any[] = [];
      let from = 0;
      const batchSize = 1000;
      let keepFetching = true;

      while (keepFetching) {
        const { data, error } = await supabase
          .from('problems')
          .select('*')
          .order('date_added', { ascending: false })
          .range(from, from + batchSize - 1);

        if (error) throw error;

        if (data && data.length > 0) {
          allProblems = allProblems.concat(data);
          if (data.length < batchSize) {
            keepFetching = false;
          } else {
            from += batchSize;
          }
        } else {
          keepFetching = false;
        }
      }

      const formatted = allProblems.map((problem: any) => ({
        id: problem.id,
        name: problem.name,
        description: problem.description || '',
        platform: problem.platform || '',
        topic: problem.topic || '',
        language: problem.language || '',
        difficulty: problem.difficulty || '',
        completed: problem.completed,
        dateAdded: problem.date_added ? problem.date_added.split('T')[0] : '',
        url: problem.url || '',
        user_id: problem.user_id,
      }));

      setProblems(formatted);
    } catch (error) {
      console.error('Error loading problems:', error);
      toast({
        title: "Error",
        description: "Failed to load problems. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddProblem = async (newProblem: Omit<Problem, 'id' | 'dateAdded' | 'user_id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('problems')
        .insert({
          name: newProblem.name,
          description: newProblem.description,
          platform: newProblem.platform,
          topic: newProblem.topic,
          language: newProblem.language,
          difficulty: newProblem.difficulty,
          completed: newProblem.completed,
          url: newProblem.url,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      const formattedProblem = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        platform: data.platform || '',
        topic: data.topic || '',
        language: data.language || '',
        difficulty: data.difficulty || '',
        completed: data.completed,
        dateAdded: data.date_added.split('T')[0],
        url: data.url || '',
        user_id: data.user_id
      };

      setProblems([formattedProblem, ...problems]);
      setShowForm(false);

      toast({
        title: "Success",
        description: "Problem added successfully!",
      });
    } catch (error) {
      console.error('Error adding problem:', error);
      toast({
        title: "Error",
        description: "Failed to add problem. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleProblem = async (id: number) => {
    const problem = problems.find(p => p.id === id);
    if (!problem) return;

    try {
      const { error } = await supabase
        .from('problems')
        .update({ completed: !problem.completed })
        .eq('id', id);

      if (error) throw error;

      setProblems(problems.map(problem =>
        problem.id === id
          ? { ...problem, completed: !problem.completed }
          : problem
      ));

      toast({
        title: "Success",
        description: `Problem marked as ${!problem.completed ? 'completed' : 'incomplete'}!`,
      });
    } catch (error) {
      console.error('Error updating problem:', error);
      toast({
        title: "Error",
        description: "Failed to update problem. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleProblemsTabFocus = () => {
    loadProblems();
    setProblemsTabKey((prev) => prev + 1);
  };

  const handleStatsReset = async () => {
    await loadProblems();
    toast({
      title: "Reset Complete",
      description: "All your statistics have been cleared successfully.",
    });
  };

  return {
    problems,
    setProblems,
    showForm,
    setShowForm,
    problemsTabKey,
    loadProblems,
    handleAddProblem,
    handleToggleProblem,
    handleProblemsTabFocus,
    handleStatsReset
  };
};
