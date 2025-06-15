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
import useDashboardSession from './Dashboard/useDashboardSession';
import { useProblems } from './Dashboard/useProblems';

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
  // Authentication/session state comes from new hook
  const { user, isLoading } = useDashboardSession(onLogout);

  // Problem state and handlers from hook
  const {
    problems,
    showForm,
    setShowForm,
    problemsTabKey,
    loadProblems,
    handleAddProblem,
    handleToggleProblem,
    handleProblemsTabFocus,
    handleStatsReset
  } = useProblems(user);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-white text-lg md:text-xl font-medium animate-pulse text-center">Loading your dashboard...</div>
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
        <div className="absolute -top-40 -right-40 w-60 h-60 md:w-80 md:h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-60 h-60 md:w-80 md:h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <DashboardHeader userEmail={user?.email} onLogout={async () => {
        await supabase.auth.signOut();
        if (onLogout) onLogout();
      }} />

      {/* Stats cards */}
      <div className="relative container mx-auto px-4 md:px-6 py-6 md:py-8 flex-1">
        <StatsCards
          total={stats.total}
          completed={stats.completed}
          thisWeek={stats.thisWeek}
        />

        {/* Tabs and content */}
        <DashboardTabs
          key={problemsTabKey}
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
