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
        if (onLogout) onLogout();
      }
      setIsLoading(false);
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

      {/* Enhanced Header */}
      <header className="relative bg-black/30 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <Code2 className="h-10 w-10 text-purple-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                  Codevance
                </h1>
                <p className="text-xs text-purple-300/70 font-medium tracking-wider">DASHBOARD</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-slate-300 text-sm">Welcome back,</span>
                <p className="text-white font-semibold">{user?.email}</p>
              </div>
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 border border-transparent hover:border-white/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative container mx-auto px-6 py-8 flex-1">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {[
            {
              title: "Total Problems",
              value: stats.total,
              icon: Target,
              color: "from-blue-500 to-cyan-500",
              delay: "delay-100"
            },
            {
              title: "Completed",
              value: stats.completed,
              subtitle: `${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% completion rate`,
              icon: BarChart3,
              color: "from-green-500 to-emerald-500",
              delay: "delay-200"
            },
            {
              title: "This Week",
              value: stats.thisWeek,
              subtitle: "Problems added",
              icon: TrendingUp,
              color: "from-purple-500 to-pink-500",
              delay: "delay-300"
            }
          ].map((stat, index) => (
            <Card key={index} className={`bg-black/40 border-white/10 backdrop-blur-xl hover:bg-black/60 transition-all duration-500 hover:scale-105 hover:-translate-y-2 shadow-xl hover:shadow-2xl animate-fade-in ${stat.delay}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-slate-300">{stat.title}</CardTitle>
                <div className={`p-2 rounded-xl bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                {stat.subtitle && (
                  <p className="text-xs text-slate-400">{stat.subtitle}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Fixed Tab Bar Alignment */}
        <Tabs defaultValue="problems" className="space-y-8">
          <div className="flex justify-center mb-8">
            <TabsList className="inline-flex bg-black/40 border-white/10 backdrop-blur-xl p-1 rounded-2xl">
              {[
                { value: "problems", label: "Problems", icon: Target },
                { value: "accounts", label: "Accounts", icon: Link },
                { value: "progress", label: "Progress", icon: TrendingUp },
                { value: "analytics", label: "Analytics", icon: BarChart3 }
              ].map((tab) => (
                <TabsTrigger 
                  key={tab.value}
                  value={tab.value} 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white text-white/70 hover:text-white transition-all duration-300 rounded-xl py-3 px-6 flex items-center space-x-2 font-medium whitespace-nowrap"
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="problems" className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Problem Collection
                </h2>
                <p className="text-slate-400 mt-1">Track and manage your coding challenges</p>
              </div>
              <Button 
                onClick={() => setShowForm(!showForm)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Problem
              </Button>
            </div>
            
            {showForm && (
              <div className="animate-fade-in">
                <ProblemForm 
                  onSubmit={handleAddProblem} 
                  onCancel={() => setShowForm(false)}
                  problems={problems}
                />
              </div>
            )}
            
            <div className="animate-fade-in delay-200">
              <ProblemList problems={problems} onToggle={handleToggleProblem} />
            </div>
          </TabsContent>

          <TabsContent value="accounts" className="animate-fade-in">
            <LinkAccounts onProblemsUpdate={loadProblems} />
          </TabsContent>

          <TabsContent value="progress" className="animate-fade-in">
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-2">
                  Topic Progress
                </h2>
                <p className="text-slate-400">Track your mastery across different programming topics</p>
              </div>
              <TopicProgress problems={problems} />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="animate-fade-in">
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-2">
                    Performance Analytics
                  </h2>
                  <p className="text-slate-400">Visualize your coding journey with detailed insights</p>
                </div>
                <ResetStatsDialog onStatsReset={handleStatsReset} />
              </div>
              <ProgressChart problems={problems} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
