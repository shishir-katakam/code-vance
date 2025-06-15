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
import DashboardLayout from './Dashboard/DashboardLayout';
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
    <DashboardLayout
      userEmail={user?.email}
      stats={stats}
      problems={problems}
      showForm={showForm}
      setShowForm={setShowForm}
      problemsTabKey={problemsTabKey}
      loadProblems={loadProblems}
      onAddProblem={handleAddProblem}
      onToggleProblem={handleToggleProblem}
      onStatsReset={handleStatsReset}
      onLogout={async () => {
        await supabase.auth.signOut();
        if (onLogout) onLogout();
      }}
    />
  );
};

export default Dashboard;
