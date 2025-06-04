
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Problem {
  id: number;
  name: string;
  description: string;
  platform: string;
  topic: string;
  language: string;
  difficulty: string;
  completed: boolean;
  url?: string;
}

interface EditProblemModalProps {
  problem: Problem;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const EditProblemModal = ({ problem, isOpen, onClose, onSave }: EditProblemModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    platform: '',
    topic: '',
    language: '',
    difficulty: '',
    url: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const platforms = ['LeetCode', 'CodeChef', 'HackerRank', 'Codeforces', 'GeeksforGeeks', 'Other'];
  const difficulties = ['Easy', 'Medium', 'Hard'];
  const topics = [
    'Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming',
    'Sorting', 'Searching', 'Hash Tables', 'Stacks', 'Queues', 'Heaps',
    'Math', 'Greedy', 'Backtracking', 'Two Pointers', 'Sliding Window', 'Other'
  ];
  const languages = ['JavaScript', 'Python', 'Java', 'C++', 'C', 'Go', 'Rust', 'Other'];

  useEffect(() => {
    if (problem) {
      setFormData({
        name: problem.name,
        description: problem.description,
        platform: problem.platform,
        topic: problem.topic,
        language: problem.language,
        difficulty: problem.difficulty,
        url: problem.url || ''
      });
    }
  }, [problem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('problems')
        .update({
          name: formData.name,
          description: formData.description,
          platform: formData.platform,
          topic: formData.topic,
          language: formData.language,
          difficulty: formData.difficulty,
          url: formData.url || null
        })
        .eq('id', problem.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Problem updated successfully!",
      });

      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating problem:', error);
      toast({
        title: "Error",
        description: "Failed to update problem.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/90 border-white/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Problem</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Problem Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-black/60 border-white/30 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-black/60 border-white/30 text-white"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select value={formData.platform} onValueChange={(value) => setFormData({ ...formData, platform: value })}>
                <SelectTrigger className="bg-black/60 border-white/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/20">
                  {platforms.map((platform) => (
                    <SelectItem key={platform} value={platform} className="text-white hover:bg-white/10">
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
                <SelectTrigger className="bg-black/60 border-white/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/20">
                  {difficulties.map((difficulty) => (
                    <SelectItem key={difficulty} value={difficulty} className="text-white hover:bg-white/10">
                      {difficulty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Select value={formData.topic} onValueChange={(value) => setFormData({ ...formData, topic: value })}>
                <SelectTrigger className="bg-black/60 border-white/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/20">
                  {topics.map((topic) => (
                    <SelectItem key={topic} value={topic} className="text-white hover:bg-white/10">
                      {topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
                <SelectTrigger className="bg-black/60 border-white/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/20">
                  {languages.map((language) => (
                    <SelectItem key={language} value={language} className="text-white hover:bg-white/10">
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Problem URL (optional)</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="bg-black/60 border-white/30 text-white"
              placeholder="https://..."
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="ghost" onClick={onClose} type="button" className="text-gray-300">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProblemModal;
