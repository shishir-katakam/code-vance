
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Loader2, MessageSquare, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from '@/components/ui/code-block';

interface AiQuestionBoxProps {
  problemName?: string;
  problemDescription?: string;
  autoFillQuestion?: boolean;
}

const AiQuestionBox = ({ problemName, problemDescription, autoFillQuestion = false }: AiQuestionBoxProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [remainingQuestions, setRemainingQuestions] = useState(2);
  const { toast } = useToast();

  const programmingLanguages = [
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'TypeScript', 
    'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'Dart'
  ];

  // Auto-generate question from problem data
  const generateQuestion = () => {
    if (!problemName && !problemDescription) {
      return 'How do I solve this coding problem?';
    }
    
    let question = '';
    if (problemName) {
      question += `Problem: ${problemName}`;
    }
    if (problemDescription) {
      if (question) question += '\n\n';
      question += `Description: ${problemDescription}`;
    }
    question += '\n\nPlease provide a detailed solution approach and code implementation.';
    
    return question;
  };

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
    if (!selectedLanguage) {
      toast({
        title: "Missing Information",
        description: "Please select a programming language.",
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
      const question = generateQuestion();
      
      const { data, error } = await supabase.functions.invoke('answer-question', {
        body: {
          question: question,
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
            <span>AI Assistant{problemName ? ` for ${problemName}` : ''}</span>
          </div>
          <div className="flex items-center space-x-1 text-sm">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="text-yellow-400">{remainingQuestions}/2 left today</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {autoFillQuestion && (problemName || problemDescription) && (
          <div className="space-y-2">
            <Label className="text-white">Auto-Generated Question</Label>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <Textarea
                value={generateQuestion()}
                readOnly
                className="bg-transparent border-none text-white resize-none min-h-[100px] text-sm"
              />
            </div>
          </div>
        )}

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

        <div className="flex justify-center">
          <Button
            onClick={handleAskQuestion}
            disabled={isLoading || remainingQuestions <= 0 || !selectedLanguage}
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
          <div className="space-y-3 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <Label className="text-white font-semibold">AI Answer</Label>
              <div className="text-xs text-green-400 animate-pulse">✨ Generated successfully</div>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 via-blue-500/5 to-purple-500/10 border border-green-500/20 rounded-xl p-6 max-h-[600px] overflow-y-auto backdrop-blur-sm shadow-2xl transition-all duration-300 hover:shadow-green-500/10">
              <div className="prose prose-invert prose-lg max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ inline, className, children, ...props }: any) {
                      const isInline = inline === true;
                      
                      return !isInline ? (
                        <CodeBlock
                          className={className}
                          inline={false}
                        >
                          {String(children).replace(/\n$/, '')}
                        </CodeBlock>
                      ) : (
                        <CodeBlock
                          className={className}
                          inline={true}
                        >
                          {String(children)}
                        </CodeBlock>
                      );
                    },
                    p: ({ children }) => (
                      <p className="text-gray-100 leading-relaxed mb-4 last:mb-0 tracking-wide">{children}</p>
                    ),
                    h1: ({ children }) => (
                      <h1 className="text-white text-2xl font-bold mb-4 pb-2 border-b border-gradient-to-r from-green-400/50 to-blue-400/50 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-white text-xl font-semibold mb-3 mt-6 first:mt-0 bg-gradient-to-r from-green-300 to-blue-300 bg-clip-text text-transparent">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-white text-lg font-semibold mb-2 mt-4 first:mt-0 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">{children}</h3>
                    ),
                    h4: ({ children }) => (
                      <h4 className="text-gray-200 text-base font-semibold mb-2 mt-3 first:mt-0">{children}</h4>
                    ),
                    ul: ({ children }) => (
                      <ul className="text-gray-100 list-none mb-4 space-y-2 ml-4">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="text-gray-100 list-decimal list-inside mb-4 space-y-2 ml-4">{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-gray-200 relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-green-400 before:font-bold transition-colors duration-200 hover:text-white">{children}</li>
                    ),
                    strong: ({ children }) => (
                      <strong className="text-white font-bold bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">{children}</strong>
                    ),
                    em: ({ children }) => (
                      <em className="text-purple-300 italic font-medium">{children}</em>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-gradient-to-b from-purple-500 to-blue-500 bg-purple-500/10 pl-6 py-3 italic text-purple-200 my-4 rounded-r-lg backdrop-blur-sm">{children}</blockquote>
                    ),
                    a: ({ children, href }) => (
                      <a href={href} className="text-blue-400 hover:text-blue-300 underline decoration-blue-400/50 hover:decoration-blue-300 transition-colors duration-200" target="_blank" rel="noopener noreferrer">{children}</a>
                    ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-4">
                        <table className="min-w-full border border-white/20 rounded-lg overflow-hidden">{children}</table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-white/10">{children}</thead>
                    ),
                    tbody: ({ children }) => (
                      <tbody className="divide-y divide-white/10">{children}</tbody>
                    ),
                    tr: ({ children }) => (
                      <tr className="hover:bg-white/5 transition-colors duration-200">{children}</tr>
                    ),
                    th: ({ children }) => (
                      <th className="px-4 py-2 text-left text-white font-semibold">{children}</th>
                    ),
                    td: ({ children }) => (
                      <td className="px-4 py-2 text-gray-200">{children}</td>
                    ),
                  }}
                >
                  {answer}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AiQuestionBox;
