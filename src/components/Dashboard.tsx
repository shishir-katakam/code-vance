
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, BarChart3, Target, Code2, LogOut } from 'lucide-react';
import ProblemList from './ProblemList';
import ProblemForm from './ProblemForm';
import TopicProgress from './TopicProgress';
import ProgressChart from './ProgressChart';
import useLocalStorage from '@/hooks/useLocalStorage';

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
}

// Default sample problems
const defaultProblems: Problem[] = [
  {
    id: 1,
    name: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    platform: "LeetCode",
    topic: "Arrays",
    language: "Python",
    difficulty: "Easy",
    completed: false,
    dateAdded: "2024-01-15"
  },
  {
    id: 2,
    name: "Valid Parentheses",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    platform: "LeetCode",
    topic: "Stacks",
    language: "JavaScript",
    difficulty: "Easy",
    completed: true,
    dateAdded: "2024-01-16"
  },
  {
    id: 3,
    name: "Merge Two Sorted Lists",
    description: "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a one sorted list.",
    platform: "LeetCode",
    topic: "Linked Lists",
    language: "Java",
    difficulty: "Easy",
    completed: false,
    dateAdded: "2024-01-17"
  },
  {
    id: 4,
    name: "Binary Tree Inorder Traversal",
    description: "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
    platform: "LeetCode",
    topic: "Trees",
    language: "C++",
    difficulty: "Easy",
    completed: true,
    dateAdded: "2024-01-18"
  },
  {
    id: 5,
    name: "Maximum Subarray",
    description: "Given an integer array nums, find the contiguous subarray which has the largest sum and return its sum.",
    platform: "LeetCode",
    topic: "Dynamic Programming",
    language: "Python",
    difficulty: "Medium",
    completed: false,
    dateAdded: "2024-01-19"
  }
];

const Dashboard = () => {
  // Use localStorage for persistent storage
  const [problems, setProblems] = useLocalStorage<Problem[]>('codetracker-problems', defaultProblems);
  const [showForm, setShowForm] = useState(false);

  const handleAddProblem = (newProblem: Omit<Problem, 'id' | 'dateAdded'>) => {
    const problem: Problem = {
      ...newProblem,
      id: Date.now(), // Simple ID generation
      dateAdded: new Date().toISOString().split('T')[0]
    };
    setProblems([...problems, problem]);
    setShowForm(false);
  };

  const handleToggleProblem = (id: number) => {
    setProblems(problems.map(problem => 
      problem.id === id 
        ? { ...problem, completed: !problem.completed }
        : problem
    ));
  };

  const handleLogout = () => {
    // Clear all stored data and redirect to landing
    localStorage.removeItem('codetracker-problems');
    window.location.reload();
  };

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Code2 className="h-8 w-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">CodeTracker</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">Welcome back!</span>
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

      <div className="container mx-auto px-6 py-8">
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
          <TabsList className="grid w-full grid-cols-3 bg-black/40 border-white/10">
            <TabsTrigger value="problems" className="data-[state=active]:bg-purple-600">Problems</TabsTrigger>
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

          <TabsContent value="progress">
            <TopicProgress problems={problems} />
          </TabsContent>

          <TabsContent value="analytics">
            <ProgressChart problems={problems} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
