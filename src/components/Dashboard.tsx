
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import ProblemForm from '@/components/ProblemForm';
import ProgressChart from '@/components/ProgressChart';
import ProblemList from '@/components/ProblemList';
import TopicProgress from '@/components/TopicProgress';
import { Plus, BarChart3, BookOpen, Target } from 'lucide-react';

const Dashboard = () => {
  const [showAddProblem, setShowAddProblem] = useState(false);
  const [problems, setProblems] = useState([
    {
      id: 1,
      name: "Two Sum",
      description: "Given an array of integers, return indices of the two numbers such that they add up to a specific target.",
      platform: "LeetCode",
      topic: "Arrays",
      language: "Python",
      difficulty: "Easy",
      completed: true,
      dateAdded: "2024-01-15"
    },
    {
      id: 2,
      name: "Binary Tree Inorder Traversal",
      description: "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
      platform: "LeetCode",
      topic: "Trees",
      language: "Python",
      difficulty: "Medium",
      completed: false,
      dateAdded: "2024-01-16"
    }
  ]);

  const addProblem = (problem: any) => {
    const newProblem = {
      ...problem,
      id: problems.length + 1,
      dateAdded: new Date().toISOString().split('T')[0]
    };
    setProblems([...problems, newProblem]);
    setShowAddProblem(false);
  };

  const toggleProblem = (id: number) => {
    setProblems(problems.map(problem => 
      problem.id === id ? { ...problem, completed: !problem.completed } : problem
    ));
  };

  const stats = {
    totalProblems: problems.length,
    completedProblems: problems.filter(p => p.completed).length,
    currentStreak: 5,
    topicsStudied: [...new Set(problems.map(p => p.topic))].length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-black/40 border-white/10 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Problems</CardTitle>
              <Target className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalProblems}</div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Completed</CardTitle>
              <BarChart3 className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.completedProblems}</div>
              <p className="text-xs text-gray-400">
                {Math.round((stats.completedProblems / stats.totalProblems) * 100)}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Current Streak</CardTitle>
              <svg className="h-4 w-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.currentStreak}</div>
              <p className="text-xs text-gray-400">days in a row</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Topics Studied</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.topicsStudied}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Add Problem Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Your Problems</h2>
              <Button 
                onClick={() => setShowAddProblem(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Problem
              </Button>
            </div>

            {/* Problem Form */}
            {showAddProblem && (
              <ProblemForm 
                onSubmit={addProblem}
                onCancel={() => setShowAddProblem(false)}
              />
            )}

            {/* Problem List */}
            <ProblemList problems={problems} onToggle={toggleProblem} />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Progress Chart */}
            <ProgressChart problems={problems} />
            
            {/* Topic Progress */}
            <TopicProgress problems={problems} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
