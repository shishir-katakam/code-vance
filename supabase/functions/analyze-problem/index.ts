
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openaiApiKey = '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';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { problemName, description, platform, currentProblems } = await req.json();

    console.log('Analyzing problem:', { problemName, description, platform });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert coding problem analyzer. Analyze the given problem carefully and classify it accurately based on the actual content and requirements.

CLASSIFICATION RULES:
- Math: Basic arithmetic, mathematical formulas, number theory, geometry calculations
- Arrays: Problems involving array manipulation, searching, sorting arrays, subarray problems
- Strings: String manipulation, pattern matching, string algorithms
- Trees: Binary trees, tree traversal, tree construction problems
- Graphs: Graph traversal, shortest path, graph algorithms
- Dynamic Programming: Optimization problems with overlapping subproblems
- Sorting: Sorting algorithms and related problems
- Searching: Search algorithms, binary search variations
- Linked Lists: Linked list operations and manipulations
- Stacks/Queues: Stack and queue data structure problems
- Hash Tables: Hash map/set problems, frequency counting
- Heaps: Priority queue, heap operations
- Recursion: Recursive solutions, divide and conquer
- Backtracking: Constraint satisfaction, exploring all possibilities
- Greedy: Greedy algorithms, local optimization
- Bit Manipulation: Bitwise operations
- Two Pointers: Two pointer technique problems
- Sliding Window: Sliding window pattern problems

DIFFICULTY RULES:
- Easy: Basic implementation, simple logic, straightforward approach
- Medium: Requires algorithmic thinking, moderate complexity, multiple steps
- Hard: Complex algorithms, advanced data structures, optimization required

Current user's problem history: ${JSON.stringify(currentProblems)}

Return ONLY a JSON object with this structure:
{
  "topic": "one of: Math, Arrays, Strings, Trees, Graphs, Dynamic Programming, Sorting, Searching, Linked Lists, Stacks, Queues, Hash Tables, Heaps, Recursion, Backtracking, Greedy, Bit Manipulation, Two Pointers, Sliding Window",
  "difficulty": "one of: Easy, Medium, Hard",
  "recommendation": "should_focus or move_to_next",
  "reason": "brief explanation why focus or move on (max 50 words)"
}

Base recommendation on:
- If topic progress < 60%, suggest "should_focus"
- If topic progress >= 80% and mostly easy problems, suggest "move_to_next"
- If struggling with medium/hard problems, suggest "should_focus"
- Consider difficulty progression and completion rate`
          },
          {
            role: 'user',
            content: `Problem Name: ${problemName}
Description: ${description}
Platform: ${platform || 'Unknown'}

Analyze this problem carefully. Look at the problem name and description to determine what algorithmic concepts, data structures, or mathematical operations are required. Classify the topic based on the PRIMARY skill needed to solve this problem.`
          }
        ],
        max_tokens: 200,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    console.log('AI Response:', content);

    // Parse the JSON response
    let analysis;
    try {
      // Remove any markdown formatting if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      analysis = JSON.parse(cleanContent);
      
      // Validate the response has required fields
      if (!analysis.topic || !analysis.difficulty || !analysis.recommendation) {
        throw new Error('Invalid response structure');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content, parseError);
      // Fallback - try to determine from problem name/description
      let fallbackTopic = 'Math';
      let fallbackDifficulty = 'Easy';
      
      const problemText = (problemName + ' ' + description).toLowerCase();
      
      if (problemText.includes('array') || problemText.includes('list') || problemText.includes('element')) {
        fallbackTopic = 'Arrays';
        fallbackDifficulty = 'Medium';
      } else if (problemText.includes('string') || problemText.includes('character') || problemText.includes('substring')) {
        fallbackTopic = 'Strings';
        fallbackDifficulty = 'Medium';
      } else if (problemText.includes('tree') || problemText.includes('binary') || problemText.includes('node')) {
        fallbackTopic = 'Trees';
        fallbackDifficulty = 'Medium';
      } else if (problemText.includes('graph') || problemText.includes('vertex') || problemText.includes('edge')) {
        fallbackTopic = 'Graphs';
        fallbackDifficulty = 'Hard';
      } else if (problemText.includes('dynamic') || problemText.includes('optimization') || problemText.includes('subsequence')) {
        fallbackTopic = 'Dynamic Programming';
        fallbackDifficulty = 'Hard';
      } else if (problemText.includes('sort') || problemText.includes('order')) {
        fallbackTopic = 'Sorting';
        fallbackDifficulty = 'Medium';
      }
      
      analysis = { 
        topic: fallbackTopic, 
        difficulty: fallbackDifficulty,
        recommendation: 'should_focus',
        reason: 'Problem analyzed using fallback classification'
      };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-problem function:', error);
    
    // Smart fallback based on problem content
    const { problemName = '', description = '' } = await req.json().catch(() => ({}));
    const problemText = (problemName + ' ' + description).toLowerCase();
    
    let errorTopic = 'Math';
    let errorDifficulty = 'Easy';
    
    if (problemText.includes('array') || problemText.includes('list')) {
      errorTopic = 'Arrays';
      errorDifficulty = 'Medium';
    } else if (problemText.includes('string')) {
      errorTopic = 'Strings';
      errorDifficulty = 'Medium';
    }
    
    return new Response(JSON.stringify({ 
      error: error.message,
      topic: errorTopic,
      difficulty: errorDifficulty,
      recommendation: 'should_focus',
      reason: 'Error occurred during analysis, using fallback classification'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
