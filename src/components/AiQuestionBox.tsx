
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Loader2, MessageSquare, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

interface AiQuestionBoxProps {
  problemName?: string;
}

const AiQuestionBox = ({ problemName }: AiQuestionBoxProps) => {
  const [question, setQuestion] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [remainingQuestions, setRemainingQuestions] = useState(2);
  const { toast } = useToast();

  const programmingLanguages = [
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'TypeScript', 
    'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'Dart'
  ];

  useEffect(() => {
    checkDailyUsage();
  }, []);

  const checkDailyUsage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('daily_ai_usage')
        .select('question_answers_count')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (error) {
        console.error('Error checking usage:', error);
        return;
      }

      const used = data?.question_answers_count || 0;
      setRemainingQuestions(2 - used);
    } catch (error) {
      console.error('Error in checkDailyUsage:', error);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim() || !selectedLanguage) {
      toast({
        title: "Missing Information",
        description: "Please provide both a question and select a programming language.",
        variant: "destructive",
      });
      return;
    }

    if (remainingQuestions <= 0) {
      toast({
        title: "Daily Limit Reached",
        description: "You have used all 2 AI answers for today. Try again tomorrow!",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAnswer('');

    try {
      const { data, error } = await supabase.functions.invoke('answer-question', {
        body: {
          question: question.trim(),
          programmingLanguage: selectedLanguage,
          problemName: problemName || null
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.message || data.error);
      }

      setAnswer(data.answer);
      setRemainingQuestions(data.remainingQuestions);
      
      toast({
        title: "Answer Generated Successfully",
        description: `You have ${data.remainingQuestions} AI answer${data.remainingQuestions === 1 ? '' : 's'} remaining today.`,
      });
    } catch (error) {
      console.error('AI Question error:', error);
      
      if (error.message?.includes('Daily limit reached')) {
        toast({
          title: "Daily Limit Reached",
          description: "You have used all 2 AI answers for today. Try again tomorrow!",
          variant: "destructive",
        });
        setRemainingQuestions(0);
      } else {
        toast({
          title: "Failed to Get Answer",
          description: error.message || "Could not get AI answer. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-400" />
            <span>AI Question Assistant</span>
          </div>
          <div className="flex items-center space-x-1 text-sm">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="text-yellow-400">{remainingQuestions}/2 left today</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="aiQuestion" className="text-white">Your Question</Label>
            <Input
              id="aiQuestion"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
              placeholder="e.g., How do I reverse a linked list?"
              disabled={isLoading || remainingQuestions <= 0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="aiLanguage" className="text-white">Programming Language</Label>
            <Select 
              value={selectedLanguage}
              onValueChange={setSelectedLanguage}
              disabled={isLoading || remainingQuestions <= 0}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {programmingLanguages.map((lang) => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handleAskQuestion}
            disabled={isLoading || remainingQuestions <= 0 || !question.trim() || !selectedLanguage}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Getting Answer...
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4 mr-2" />
                Get AI Answer ({remainingQuestions} left)
              </>
            )}
          </Button>
        </div>

        {remainingQuestions <= 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <p className="text-yellow-300 text-sm text-center">
              ⚡ You've used all 2 AI answers for today. Come back tomorrow for more!
            </p>
          </div>
        )}

        {answer && (
          <div className="space-y-2">
            <Label className="text-white">AI Answer</Label>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <Textarea
                value={answer}
                readOnly
                className="bg-transparent border-none text-white placeholder:text-gray-400 resize-none min-h-[200px]"
                placeholder="AI answer will appear here..."
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AiQuestionBox;
