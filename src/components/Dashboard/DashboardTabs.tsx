
import { useState } from 'react';
import { Plus, Target, Link, TrendingUp, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProblemForm from '../ProblemForm'; // <-- Add this import
import ProblemList from '../ProblemList';
import LinkAccounts from '../LinkAccounts';
import TopicProgress from '../TopicProgress';
import ProgressChart from '../ProgressChart';
import ResetStatsDialog from '../ResetStatsDialog';
import { Problem } from '@/types/problem';

interface DashboardTabsProps {
  problems: Problem[];
  onAddProblem: (p: Omit<Problem, 'id' | 'dateAdded' | 'user_id'>) => Promise<void>;
  onToggleProblem: (id: number) => Promise<void>;
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  loadProblems: () => Promise<void>;
  onStatsReset: () => Promise<void>;
}

const DashboardTabs = ({
  problems,
  onAddProblem,
  onToggleProblem,
  showForm,
  setShowForm,
  loadProblems,
  onStatsReset
}: DashboardTabsProps) => (
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
            onSubmit={onAddProblem} 
            onCancel={() => setShowForm(false)}
            problems={problems}
          />
        </div>
      )}
      <div className="animate-fade-in delay-200">
        <ProblemList problems={problems} onToggle={onToggleProblem} />
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
          <ResetStatsDialog onStatsReset={onStatsReset} />
        </div>
        <ProgressChart problems={problems} />
      </div>
    </TabsContent>
  </Tabs>
);

export default DashboardTabs;
