
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Brain } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProblemFormProps {
  onSubmit: (problem: any) => void;
  onCancel: () => void;
}

const ProblemForm = ({ onSubmit, onCancel }: ProblemFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    platform: '',
    topic: '',
    language: '',
    difficulty: '',
    completed: false
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const platforms = ['LeetCode', 'CodeChef', 'GeeksforGeeks', 'HackerRank', 'Codeforces', 'AtCoder'];
  const languages = ['Python', 'JavaScript', 'Java', 'C++', 'C', 'Go', 'Rust', 'TypeScript'];

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
          platform: formData.platform
        }
      });

      if (error) throw error;

      setFormData(prev => ({
        ...prev,
        topic: data.topic,
        difficulty: data.difficulty
      }));

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
    if (!formData.topic || !formData.difficulty) {
      toast({
        title: "Missing Analysis",
        description: "Please analyze the problem with AI first.",
        variant: "destructive",
      });
      return;
    }
    onSubmit(formData);
  };

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Add New Problem</CardTitle>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4 text-gray-400" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              <Select onValueChange={(value) => setFormData({ ...formData, platform: value })}>
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
              {isAnalyzing ? 'Analyzing with AI...' : 'Analyze with DeepSeek AI'}
            </Button>
          </div>

          {formData.topic && formData.difficulty && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="text-center text-white">
                <p className="text-sm text-gray-300">AI Analysis Result:</p>
                <p className="text-lg font-semibold">
                  <span className="text-purple-400">{formData.topic}</span> • 
                  <span className="text-pink-400 ml-2">{formData.difficulty}</span>
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="language" className="text-white">Programming Language</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, language: value })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((language) => (
                  <SelectItem key={language} value={language}>{language}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="ghost" onClick={onCancel} className="text-gray-300">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={!formData.topic || !formData.difficulty}
            >
              Add Problem
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProblemForm;
