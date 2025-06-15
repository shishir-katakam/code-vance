
import React from 'react';
import DashboardHeader from './DashboardHeader';
import StatsCards from './StatsCards';
import DashboardTabs from './DashboardTabs';
import Footer from '../Footer';

interface DashboardLayoutProps {
  userEmail?: string;
  stats: {
    total: number;
    completed: number;
    thisWeek: number;
  };
  problems: any[];
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  problemsTabKey: number;
  loadProblems: () => Promise<void>;
  onAddProblem: (p: any) => Promise<void>;
  onToggleProblem: (id: number) => Promise<void>;
  onStatsReset: () => Promise<void>;
  onLogout: () => void;
  onProblemsTabFocus: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  userEmail,
  stats,
  problems,
  showForm,
  setShowForm,
  problemsTabKey,
  loadProblems,
  onAddProblem,
  onToggleProblem,
  onStatsReset,
  onLogout,
  onProblemsTabFocus,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-60 h-60 md:w-80 md:h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-60 h-60 md:w-80 md:h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <DashboardHeader userEmail={userEmail} onLogout={onLogout} />

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
          onAddProblem={onAddProblem}
          onToggleProblem={onToggleProblem}
          showForm={showForm}
          setShowForm={setShowForm}
          loadProblems={loadProblems}
          onStatsReset={onStatsReset}
          onProblemsTabFocus={onProblemsTabFocus}
        />
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
