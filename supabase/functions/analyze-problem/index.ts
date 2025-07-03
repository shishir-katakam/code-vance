
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced programming-focused classification logic
const classifyProblemFallback = (problemName: string, description: string) => {
  const text = (problemName + ' ' + description).toLowerCase();
  
  // Sorting algorithms (HIGHEST PRIORITY for programming problems)
  if (text.includes('sort') || text.includes('merge sort') || text.includes('quick sort') ||
      text.includes('bubble sort') || text.includes('insertion sort') || text.includes('heap sort') ||
      text.includes('radix sort') || text.includes('counting sort') || text.includes('bucket sort') ||
      text.includes('selection sort') || text.includes('sorted') || text.includes('ordering')) {
    return { topic: 'Sorting', difficulty: 'Medium' };
  }
  
  // Functions/Methods (HIGH PRIORITY)
  if (text.includes('function') || text.includes('method') || text.includes('procedure') ||
      text.includes('implement') || text.includes('write a function') || text.includes('create a function') ||
      text.includes('def ') || text.includes('function(') || text.includes('return') ||
      text.includes('parameter') || text.includes('argument') || text.includes('call') ||
      text.includes('invoke') || text.includes('execute')) {
    return { topic: 'Functions', difficulty: 'Easy' };
  }
  
  // Algorithms (HIGH PRIORITY)
  if (text.includes('algorithm') || text.includes('solve') || text.includes('approach') ||
      text.includes('step') || text.includes('process') || text.includes('logic') ||
      text.includes('pseudocode') || text.includes('flowchart')) {
    return { topic: 'Algorithms', difficulty: 'Medium' };
  }
  
  // Dynamic Programming
  if (text.includes('optimal') || text.includes('dynamic programming') || text.includes('dp') ||
      text.includes('memoization') || text.includes('tabulation') || text.includes('overlapping subproblems') ||
      text.includes('optimal substructure') || text.includes('fibonacci') || text.includes('knapsack') ||
      text.includes('longest common subsequence') || text.includes('edit distance')) {
    return { topic: 'Dynamic Programming', difficulty: 'Hard' };
  }
  
  // Searching algorithms
  if (text.includes('search') || text.includes('find') || text.includes('binary search') ||
      text.includes('linear search') || text.includes('look for') || text.includes('locate') ||
      text.includes('exists') || text.includes('contains') || text.includes('index of')) {
    return { topic: 'Searching', difficulty: 'Medium' };
  }
  
  // Arrays (programming context)
  if (text.includes('array') || text.includes('list') || text.includes('element') ||
      text.includes('index') || text.includes('subarray') || text.includes('matrix') ||
      text.includes('2d array') || text.includes('multidimensional')) {
    return { topic: 'Arrays', difficulty: 'Medium' };
  }
  
  // Strings (programming context)
  if (text.includes('string') || text.includes('char') || text.includes('character') ||
      text.includes('substring') || text.includes('palindrome') || text.includes('anagram') ||
      text.includes('pattern') || text.includes('text processing') || text.includes('parsing')) {
    return { topic: 'Strings', difficulty: 'Medium' };
  }
  
  // Trees
  if (text.includes('tree') || text.includes('binary tree') || text.includes('node') ||
      text.includes('root') || text.includes('leaf') || text.includes('traversal') ||
      text.includes('bst') || text.includes('binary search tree') || text.includes('avl') ||
      text.includes('red-black') || text.includes('trie')) {
    return { topic: 'Trees', difficulty: 'Medium' };
  }
  
  // Graphs
  if (text.includes('graph') || text.includes('vertex') || text.includes('edge') ||
      text.includes('path') || text.includes('cycle') || text.includes('connected') ||
      text.includes('shortest path') || text.includes('bfs') || text.includes('dfs') ||
      text.includes('dijkstra') || text.includes('bellman-ford') || text.includes('kruskal')) {
    return { topic: 'Graphs', difficulty: 'Hard' };
  }
  
  // Linked Lists
  if (text.includes('linked list') || text.includes('singly linked') || text.includes('doubly linked') ||
      text.includes('node') && text.includes('next') || text.includes('head') && text.includes('tail') ||
      text.includes('pointer') || text.includes('reference')) {
    return { topic: 'Linked Lists', difficulty: 'Medium' };
  }
  
  // Stacks and Queues
  if (text.includes('stack') || text.includes('queue') || text.includes('lifo') || text.includes('fifo') ||
      text.includes('push') || text.includes('pop') || text.includes('enqueue') || text.includes('dequeue') ||
      text.includes('bracket') || text.includes('parentheses') || text.includes('balanced')) {
    return { topic: 'Stacks', difficulty: 'Medium' };
  }
  
  // Hash Tables
  if (text.includes('hash') || text.includes('dictionary') || text.includes('map') ||
      text.includes('key-value') || text.includes('lookup') || text.includes('frequency') ||
      text.includes('count') || text.includes('occurrence')) {
    return { topic: 'Hash Tables', difficulty: 'Medium' };
  }
  
  // Recursion
  if (text.includes('recursive') || text.includes('recursion') || text.includes('base case') ||
      text.includes('recursive call') || text.includes('divide and conquer') ||
      text.includes('factorial') || text.includes('tower of hanoi')) {
    return { topic: 'Recursion', difficulty: 'Medium' };
  }
  
  // Bit Manipulation
  if (text.includes('bit') || text.includes('binary') || text.includes('bitwise') ||
      text.includes('xor') || text.includes('and') || text.includes('or') || text.includes('shift') ||
      text.includes('complement') || text.includes('mask')) {
    return { topic: 'Bit Manipulation', difficulty: 'Medium' };
  }
  
  // Greedy Algorithms
  if (text.includes('greedy') || text.includes('local optimum') || text.includes('choice') ||
      text.includes('activity selection') || text.includes('fractional knapsack') ||
      text.includes('huffman coding')) {
    return { topic: 'Greedy', difficulty: 'Medium' };
  }
  
  // Math problems (only if clearly mathematical, not coding)
  if ((text.includes('calculate') || text.includes('compute') || text.includes('formula')) &&
      !text.includes('code') && !text.includes('program') && !text.includes('algorithm')) {
    return { topic: 'Math', difficulty: 'Easy' };
  }
  
  // Default to Algorithms for any programming problem
  return { topic: 'Algorithms', difficulty: 'Easy' };
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
              content: `You are an expert PROGRAMMING problem analyzer. Focus ONLY on coding/algorithmic concepts, NOT general academic subjects.

PRIORITY CLASSIFICATION (in order):
1. Sorting: Any sorting algorithm, ordering data, sorted arrays (bubble, merge, quick, etc.)
2. Functions: Function implementation, method creation, parameters, return values
3. Searching: Binary search, linear search, finding elements in data structures
4. Algorithms: General algorithmic approaches, problem-solving methods
5. Arrays: Array manipulation, indexing, subarray problems, matrix operations
6. Strings: String manipulation, character processing, pattern matching
7. Dynamic Programming: Optimization with overlapping subproblems, memoization
8. Trees: Binary trees, tree traversal, BST operations, tree construction
9. Graphs: Graph traversal, shortest path, connectivity, BFS/DFS
10. Linked Lists: Node operations, list manipulations, pointers
11. Stacks: LIFO operations, bracket matching, expression evaluation
12. Queues: FIFO operations, BFS, scheduling problems
13. Hash Tables: Hash maps, frequency counting, fast lookups
14. Recursion: Recursive solutions, divide and conquer, base cases
15. Backtracking: Constraint satisfaction, exploring possibilities
16. Greedy: Local optimization choices, greedy strategies
17. Bit Manipulation: Bitwise operations, binary representations
18. Two Pointers: Two pointer technique for arrays/strings
19. Sliding Window: Window pattern for subarrays/substrings
20. Heaps: Priority queues, heap operations, top-k problems

IMPORTANT RULES:
- If problem mentions "sort" or "sorting" → ALWAYS classify as "Sorting"
- If problem asks to "implement function" or "write function" → ALWAYS classify as "Functions"  
- If problem involves "search" or "find" → ALWAYS classify as "Searching"
- If problem mentions "add numbers" but requires programming → classify as "Functions" NOT "Math"
- If problem mentions "spell check" with functions → classify as "Functions" NOT "Strings"
- ONLY use "Math" if it's pure mathematical calculations without programming logic

DIFFICULTY RULES:
- Easy: Basic implementation, simple logic, straightforward approach
- Medium: Requires algorithmic thinking, moderate complexity, multiple steps
- Hard: Complex algorithms, advanced data structures, optimization required
- Advanced: Expert-level problems requiring deep algorithmic knowledge

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
