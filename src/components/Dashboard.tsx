import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, BarChart3, Target, Code2, LogOut, Link, Sparkles, TrendingUp, Zap } from 'lucide-react';
import ProblemList from './ProblemList';
import ProblemForm from './ProblemForm';
import TopicProgress from './TopicProgress';
import ProgressChart from './ProgressChart';
import LinkAccounts from './LinkAccounts';
import Footer from './Footer';
import ResetStatsDialog from './ResetStatsDialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DashboardHeader from './Dashboard/DashboardHeader';
import StatsCards from './Dashboard/StatsCards';
import DashboardTabs from './Dashboard/DashboardTabs';

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
  user_id?: string;
}

interface DashboardProps {
  onLogout?: () => void;
}

const Dashboard = ({ onLogout }: DashboardProps) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  // Check authentication and load user data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking auth session...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session:', session);

        if (session?.user) {
          setUser(session.user);
          console.log('User session found, loading problems...');
          await loadProblems();
        } else {
          console.log('No session found, logging out...');
          if (onLogout) onLogout();
        }
      } catch (err) {
        console.error('Error during auth check:', err);
      } finally {
        setIsLoading(false);
        console.log('Done checking auth -- isLoading set to false');
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user);
          loadProblems();
        } else {
          setUser(null);
          setProblems([]);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [onLogout]);

  // Fetches all user problems regardless of count (works for large datasets)
  const loadProblems = async () => {
    try {
      let allProblems: any[] = [];
      let from = 0;
      const batchSize = 1000;
      let keepFetching = true;

      while (keepFetching) {
        const { data, error, count } = await supabase
          .from('problems')
          .select('*', { count: 'exact', head: false })
          .order('date_added', { ascending: false })
          .range(from, from + batchSize - 1);

        if (error) throw error;

        if (data && data.length > 0) {
          allProblems = allProblems.concat(data);
          if (data.length < batchSize) {
            keepFetching = false; // No more data left to fetch
          } else {
            from += batchSize;
          }
        } else {
          keepFetching = false;
        }
      }

      const formattedProblems = allProblems.map(problem => ({
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
        user_id: problem.user_id
      }));

      setProblems(formattedProblems);
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleStatsReset = async () => {
    // Reload problems data after stats reset
    await loadProblems();
    
    // Show updated stats immediately
    toast({
      title: "Reset Complete",
      description: "All your statistics have been cleared successfully.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-white text-xl font-medium animate-pulse">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  const stats = {
    total: problems.length,
    completed: problems.filter(p => p.completed).length,
    thisWeek: problems.filter(p => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(p.dateAdded) >= weekAgo;
    }).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <DashboardHeader userEmail={user?.email} onLogout={handleLogout} />

      {/* Stats cards */}
      <div className="relative container mx-auto px-6 py-8 flex-1">
        <StatsCards 
          total={stats.total} 
          completed={stats.completed} 
          thisWeek={stats.thisWeek} 
        />

        {/* Tabs and content */}
        <DashboardTabs
          problems={problems}
          onAddProblem={handleAddProblem}
          onToggleProblem={handleToggleProblem}
          showForm={showForm}
          setShowForm={setShowForm}
          loadProblems={loadProblems}
          onStatsReset={handleStatsReset}
        />
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
