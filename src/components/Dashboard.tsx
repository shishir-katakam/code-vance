import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, BarChart3, Target, Code2, LogOut, Link } from 'lucide-react';
import ProblemList from './ProblemList';
import ProblemForm from './ProblemForm';
import TopicProgress from './TopicProgress';
import ProgressChart from './ProgressChart';
import LinkAccounts from './LinkAccounts';
import Footer from './Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await loadProblems();
      } else {
        // Redirect to login if not authenticated
        if (onLogout) onLogout();
      }
      setIsLoading(false);
    };

    checkAuth();

    // Listen for auth changes
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

  const loadProblems = async () => {
    try {
      const { data, error } = await supabase
        .from('problems')
        .select('*')
        .order('date_added', { ascending: false });

      if (error) throw error;

      // Convert database format to component format
      const formattedProblems = data.map(problem => ({
        id: problem.id,
        name: problem.name,
        description: problem.description || '',
        platform: problem.platform || '',
        topic: problem.topic || '',
        language: problem.language || '',
        difficulty: problem.difficulty || '',
        completed: problem.completed,
        dateAdded: problem.date_added.split('T')[0],
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

      // Add the new problem to local state
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex flex-col">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Code2 className="h-8 w-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">CodeTracker</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">Welcome back, {user?.email}!</span>
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="text-white hover:bg-white/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 flex-1">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-black/40 border-white/10 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Problems</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="bg-black/40 border-white/10 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Completed</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% completion rate
              </p>
            </CardContent>
          </Card>
          <Card className="bg-black/40 border-white/10 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">This Week</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.thisWeek}</div>
              <p className="text-xs text-muted-foreground">Problems added</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="problems" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-black/40 border-white/10">
            <TabsTrigger value="problems" className="data-[state=active]:bg-purple-600">Problems</TabsTrigger>
            <TabsTrigger value="accounts" className="data-[state=active]:bg-purple-600">
              <Link className="h-4 w-4 mr-2" />
              Accounts
            </TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-purple-600">Progress</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="problems" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Problem List</h2>
              <Button 
                onClick={() => setShowForm(!showForm)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Problem
              </Button>
            </div>
            
            {showForm && (
              <ProblemForm 
                onSubmit={handleAddProblem} 
                onCancel={() => setShowForm(false)}
                problems={problems}
              />
            )}
            
            <ProblemList problems={problems} onToggle={handleToggleProblem} />
          </TabsContent>

          <TabsContent value="accounts">
            <LinkAccounts />
          </TabsContent>

          <TabsContent value="progress">
            <TopicProgress problems={problems} />
          </TabsContent>

          <TabsContent value="analytics">
            <ProgressChart problems={problems} />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
