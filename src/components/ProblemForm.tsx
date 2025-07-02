import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Brain, TrendingUp, Target, Link, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AiQuestionBox from './AiQuestionBox';

interface Problem {
  id: number;
  topic: string;
  language: string;
  difficulty: string;
  completed: boolean;
}

interface ProblemFormProps {
  onSubmit: (problem: any) => void;
  onCancel: () => void;
  problems: Problem[];
}

const ProblemForm = ({ onSubmit, onCancel, problems }: ProblemFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    platform: '',
    topic: '',
    difficulty: '',
    url: '',
    completed: false
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [urlInput, setUrlInput] = useState('');
  const { toast } = useToast();

  const platforms = ['LeetCode', 'CodeChef', 'GeeksforGeeks', 'HackerRank', 'Codeforces', 'AtCoder'];
  const topics = ['Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 'Greedy', 'Backtracking', 'Stacks', 'Queues', 'Hash Tables', 'Sorting', 'Searching', 'Math', 'Bit Manipulation'];
  const difficulties = ['Easy', 'Medium', 'Hard'];

  const calculateTopicProgress = (topic: string) => {
    const topicProblems = problems.filter(p => p.topic === topic);
    if (topicProblems.length === 0) return 0;
    const completed = topicProblems.filter(p => p.completed).length;
    return Math.round((completed / topicProblems.length) * 100);
  };

  const extractFromUrl = async () => {
    if (!urlInput.trim()) {
      toast({
        title: "Missing URL",
        description: "Please provide a problem URL to extract details.",
        variant: "destructive",
      });
      return;
    }

    setIsExtracting(true);
    try {
      const { data, error } = await supabase.functions.invoke('extract-problem-details', {
        body: { url: urlInput.trim() }
      });

      if (error) throw error;

      setFormData({
        name: data.name,
        description: data.description,
        platform: data.platform,
        topic: data.topic,
        difficulty: data.difficulty,
        url: data.url,
        completed: false
      });

      toast({
        title: "Details Extracted Successfully",
        description: `All problem details extracted from ${data.platform}. Ready to add!`,
      });
    } catch (error) {
      console.error('Extraction error:', error);
      toast({
        title: "Extraction Failed",
        description: "Could not extract problem details. Please try manual entry.",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const analyzeWithAI = async () => {
    if (!formData.name || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please provide problem name and description before analyzing.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-problem', {
        body: {
          problemName: formData.name,
          description: formData.description,
          platform: formData.platform,
          currentProblems: problems
        }
      });

      if (error) throw error;

      setFormData(prev => ({
        ...prev,
        topic: data.topic,
        difficulty: data.difficulty
      }));

      setAnalysis(data);

      toast({
        title: "Analysis Complete",
        description: `Detected: ${data.topic} (${data.difficulty})`,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the problem. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.topic || !formData.difficulty) {
      toast({
        title: "Missing Required Fields",
        description: "Please extract from URL or fill all required fields manually.",
        variant: "destructive",
      });
      return;
    }
    onSubmit(formData);
  };

  const topicProgress = analysis ? calculateTopicProgress(analysis.topic) : 0;

  return (
    <div className="space-y-6">
      {/* Problem Form - Now First */}
      <Card className="bg-black/40 border-white/10 backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Add New Problem</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4 text-gray-400" />
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="url" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 bg-white/5">
              <TabsTrigger value="url" className="text-white data-[state=active]:bg-purple-600">From URL</TabsTrigger>
              <TabsTrigger value="manual" className="text-white data-[state=active]:bg-purple-600">Manual Entry</TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="problemUrl" className="text-white">Problem URL</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="problemUrl"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                      placeholder="https://leetcode.com/problems/two-sum/"
                    />
                    <Button
                      type="button"
                      onClick={extractFromUrl}
                      disabled={isExtracting}
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    >
                      {isExtracting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Link className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400">
                    Paste any problem URL and click extract - all details will be filled automatically!
                  </p>
                </div>

                {(formData.name && formData.description && formData.platform) && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2 flex items-center">
                      <span className="text-green-400 mr-2">✓</span>
                      Problem Details Extracted Successfully
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                      <div>
                        <p><strong>Name:</strong> {formData.name}</p>
                        <p><strong>Platform:</strong> {formData.platform}</p>
                        <p><strong>Difficulty:</strong> {formData.difficulty}</p>
                      </div>
                      <div>
                        <p><strong>Topic:</strong> {formData.topic}</p>
                        <p className="mt-2"><strong>Description:</strong></p>
                        <p className="text-xs text-gray-400 mt-1">{formData.description.substring(0, 100)}...</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-green-500/20">
                      <Button 
                        onClick={handleSubmit}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        Add Problem to Collection
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="manual" className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">Problem Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                      placeholder="e.g., Two Sum"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="platform" className="text-white">Platform</Label>
                    <Select 
                      value={formData.platform}
                      onValueChange={(value) => setFormData({ ...formData, platform: value })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {platforms.map((platform) => (
                          <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                    placeholder="Brief description of the problem..."
                    rows={3}
                    required
                  />
                </div>

                <div className="flex justify-center">
                  <Button
                    type="button"
                    onClick={analyzeWithAI}
                    disabled={isAnalyzing || !formData.name || !formData.description}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    {isAnalyzing ? 'Analyzing with AI...' : 'Analyze with AI (Optional)'}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="topic" className="text-white">Topic</Label>
                    <Select 
                      value={formData.topic} 
                      onValueChange={(value) => setFormData({ ...formData, topic: value })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select topic" />
                      </SelectTrigger>
                      <SelectContent>
                        {topics.map((topic) => (
                          <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="difficulty" className="text-white">Difficulty</Label>
                    <Select 
                      value={formData.difficulty} 
                      onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        {difficulties.map((difficulty) => (
                          <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url" className="text-white">Problem URL (Optional)</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                    placeholder="https://leetcode.com/problems/two-sum/"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="ghost" onClick={onCancel} className="text-gray-300">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Add Problem
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {analysis && (
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="text-center text-white mb-3">
                  <p className="text-sm text-gray-300">AI Analysis Result:</p>
                  <p className="text-lg font-semibold">
                    <span className="text-purple-400">{analysis.topic}</span> • 
                    <span className="text-pink-400 ml-2">{analysis.difficulty}</span>
                  </p>
                </div>
                
                {/* Topic Progress */}
                <div className="bg-black/20 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300 flex items-center">
                      <Target className="h-4 w-4 mr-1" />
                      {analysis.topic} Progress
                    </span>
                    <span className="text-sm font-medium text-purple-400">{topicProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${topicProgress}%` }}
                    ></div>
                  </div>
                </div>

                {/* AI Recommendation */}
                <div className={`rounded-lg p-3 border ${
                  analysis.recommendation === 'should_focus' 
                    ? 'bg-yellow-500/10 border-yellow-500/30' 
                    : 'bg-green-500/10 border-green-500/30'
                }`}>
                  <div className="flex items-start space-x-2">
                    <TrendingUp className={`h-4 w-4 mt-0.5 ${
                      analysis.recommendation === 'should_focus' 
                        ? 'text-yellow-400' 
                        : 'text-green-400'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-white">
                        {analysis.recommendation === 'should_focus' 
                          ? '🎯 Keep Practicing This Topic' 
                          : '✨ Ready for Next Topic'}
                      </p>
                      <p className="text-xs text-gray-300 mt-1">{analysis.reason}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* AI Question Box - Now Below Problem Form */}
      <AiQuestionBox problemName={formData.name || undefined} />
    </div>
  );
};

export default ProblemForm;
