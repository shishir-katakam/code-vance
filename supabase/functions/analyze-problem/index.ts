
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced fallback classification logic
const classifyProblemFallback = (problemName: string, description: string) => {
  const text = (problemName + ' ' + description).toLowerCase();
  
  // Check for advanced/hard patterns first
  if (text.includes('optimal') || text.includes('dynamic programming') || text.includes('dp') ||
      text.includes('graph') || text.includes('shortest path') || text.includes('minimum spanning tree') ||
      text.includes('maximum flow') || text.includes('segment tree') || text.includes('fenwick') ||
      text.includes('trie') || text.includes('suffix') || text.includes('lru cache') ||
      text.includes('n-queens') || text.includes('backtrack') || text.includes('minimax')) {
    
    if (text.includes('advanced') || text.includes('complex') || text.includes('optimize') ||
        text.includes('multiple constraints') || text.includes('time limit') || text.includes('space limit')) {
      return { topic: 'Dynamic Programming', difficulty: 'Advanced' };
    }
    return { topic: 'Dynamic Programming', difficulty: 'Hard' };
  }
  
  // Math problems
  if (text.includes('sum') || text.includes('add') || text.includes('subtract') || 
      text.includes('multiply') || text.includes('divide') || text.includes('number') ||
      text.includes('calculate') || text.includes('math') || text.includes('arithmetic')) {
    return { topic: 'Math', difficulty: 'Easy' };
  }
  
  // Array problems
  if (text.includes('array') || text.includes('element') || text.includes('index') ||
      text.includes('subarray') || text.includes('matrix') || text.includes('sort') ||
      text.includes('search in array') || text.includes('find element')) {
    if (text.includes('maximum') || text.includes('minimum') || text.includes('optimize')) {
      return { topic: 'Arrays', difficulty: 'Hard' };
    }
    return { topic: 'Arrays', difficulty: 'Medium' };
  }
  
  // String problems
  if (text.includes('string') || text.includes('character') || text.includes('substring') ||
      text.includes('palindrome') || text.includes('anagram') || text.includes('pattern') ||
      text.includes('text') || text.includes('word')) {
    return { topic: 'Strings', difficulty: 'Medium' };
  }
  
  // Tree problems
  if (text.includes('tree') || text.includes('binary tree') || text.includes('node') ||
      text.includes('root') || text.includes('leaf') || text.includes('traversal') ||
      text.includes('bst') || text.includes('binary search tree')) {
    if (text.includes('balance') || text.includes('optimize') || text.includes('serialize')) {
      return { topic: 'Trees', difficulty: 'Hard' };
    }
    return { topic: 'Trees', difficulty: 'Medium' };
  }
  
  // Graph problems
  if (text.includes('graph') || text.includes('vertex') || text.includes('edge') ||
      text.includes('path') || text.includes('cycle') || text.includes('connected') ||
      text.includes('shortest path') || text.includes('bfs') || text.includes('dfs')) {
    return { topic: 'Graphs', difficulty: 'Hard' };
  }
  
  // Linked List problems
  if (text.includes('linked list') || text.includes('node') && text.includes('next') ||
      text.includes('reverse') && text.includes('list') || text.includes('merge') && text.includes('list')) {
    return { topic: 'Linked Lists', difficulty: 'Medium' };
  }
  
  // Stack/Queue problems
  if (text.includes('stack') || text.includes('queue') || text.includes('bracket') ||
      text.includes('parentheses') || text.includes('valid') && text.includes('bracket') ||
      text.includes('push') || text.includes('pop')) {
    return { topic: 'Stacks', difficulty: 'Medium' };
  }
  
  // Default fallback
  return { topic: 'Math', difficulty: 'Easy' };
};

const calculateRecommendation = (topic: string, currentProblems: any[]) => {
  const topicProblems = currentProblems.filter(p => p.topic === topic);
  if (topicProblems.length === 0) {
    return { recommendation: 'should_focus', reason: 'First problem in this topic - build foundation' };
  }
  
  const completed = topicProblems.filter(p => p.completed).length;
  const progress = Math.round((completed / topicProblems.length) * 100);
  
  if (progress < 60) {
    return { recommendation: 'should_focus', reason: `${progress}% progress - keep practicing to build mastery` };
  } else if (progress >= 80) {
    const easyProblems = topicProblems.filter(p => p.difficulty === 'Easy').length;
    if (easyProblems > topicProblems.length * 0.7) {
      return { recommendation: 'move_to_next', reason: 'Strong foundation built - ready for new challenges' };
    }
  }
  
  return { recommendation: 'should_focus', reason: 'Continue building expertise in this area' };
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { problemName, description, platform, currentProblems } = await req.json();

    console.log('Analyzing problem:', { problemName, description, platform });

    // Try OpenRouter API first with timeout
    let analysis;
    try {
      if (!openRouterApiKey) {
        throw new Error('OpenRouter API key not configured');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://qtlaxxfcwghxxmtqthne.supabase.co',
          'X-Title': 'Code Journey AI Tracker',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-r1-0528:free',
          messages: [
            {
              role: 'system',
              content: `You are an expert coding problem analyzer. Classify problems based on their PRIMARY algorithmic requirement.

CLASSIFICATION RULES:
- Math: Basic arithmetic, mathematical formulas, number theory, simple calculations
- Arrays: Array manipulation, searching/sorting arrays, subarray problems, matrix operations
- Strings: String manipulation, pattern matching, text processing, character operations
- Trees: Binary trees, tree traversal, tree construction, BST operations
- Graphs: Graph traversal, shortest path, graph algorithms, connectivity
- Dynamic Programming: Optimization with overlapping subproblems, memoization
- Sorting: Sorting algorithms and related problems
- Searching: Search algorithms, binary search variations
- Linked Lists: Linked list operations and manipulations
- Stacks: Stack operations, bracket matching, expression evaluation
- Queues: Queue operations, BFS, scheduling problems
- Hash Tables: Hash map/set problems, frequency counting, fast lookups
- Heaps: Priority queue, heap operations, top-k problems
- Recursion: Recursive solutions, divide and conquer
- Backtracking: Constraint satisfaction, exploring all possibilities
- Greedy: Greedy algorithms, local optimization choices
- Bit Manipulation: Bitwise operations, bit tricks
- Two Pointers: Two pointer technique for arrays/strings
- Sliding Window: Sliding window pattern for subarrays/substrings

DIFFICULTY RULES:
- Easy: Basic implementation, simple logic, straightforward approach
- Medium: Requires algorithmic thinking, moderate complexity, multiple steps
- Hard: Complex algorithms, advanced data structures, optimization required
- Advanced: Expert-level problems requiring deep algorithmic knowledge and optimization

Return ONLY a JSON object:
{
  "topic": "exact topic name from list above",
  "difficulty": "Easy|Medium|Hard|Advanced"
}`
            },
            {
              role: 'user',
              content: `Problem: ${problemName}
Description: ${description}

Analyze this problem and determine the PRIMARY skill/topic needed to solve it.`
            }
          ],
          max_tokens: 100,
          temperature: 0.1
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content.trim();
      
      console.log('AI Response:', content);

      // Parse the JSON response
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanContent);
      
      if (!parsed.topic || !parsed.difficulty) {
        throw new Error('Invalid response structure');
      }

      analysis = parsed;
      console.log('Successfully parsed AI analysis:', analysis);

    } catch (apiError) {
      console.error('OpenRouter API failed, using fallback:', apiError);
      
      // Use enhanced fallback classification
      const fallback = classifyProblemFallback(problemName, description);
      analysis = fallback;
      console.log('Using fallback classification:', analysis);
    }

    // Calculate recommendation based on user's progress
    const recommendation = calculateRecommendation(analysis.topic, currentProblems || []);
    
    const finalResult = {
      ...analysis,
      ...recommendation
    };

    console.log('Final analysis result:', finalResult);

    return new Response(JSON.stringify(finalResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-problem function:', error);
    
    // Ultimate fallback with problem text analysis
    let fallbackResult;
    try {
      const { problemName = '', description = '' } = await req.json().catch(() => ({}));
      const fallback = classifyProblemFallback(problemName, description);
      fallbackResult = {
        ...fallback,
        recommendation: 'should_focus',
        reason: 'Analysis using pattern matching - review suggested classification'
      };
    } catch {
      fallbackResult = {
        topic: 'Math',
        difficulty: 'Easy',
        recommendation: 'should_focus',
        reason: 'Default classification - please verify topic and difficulty'
      };
    }
    
    return new Response(JSON.stringify(fallbackResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
