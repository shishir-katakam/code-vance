
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');

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

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://codetracker.lovable.app',
        'X-Title': 'CodeTracker',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are an expert coding problem analyzer. Analyze the given problem carefully and classify it accurately.

IMPORTANT: Distinguish between:
- Simple arithmetic/basic operations (Easy difficulty, Math topic)
- Complex algorithmic problems (Medium/Hard difficulty, specific algorithm topics)

For example:
- "sum of two numbers" or "adding two numbers" = Easy Math problem (basic arithmetic)
- "Two Sum array problem" or "find two numbers that add to target" = Medium Arrays problem (algorithm)

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
            content: `Problem Name: ${problemName}\nDescription: ${description}\nPlatform: ${platform || 'Unknown'}\n\nPlease classify this problem accurately. If it's about basic arithmetic operations (like adding, subtracting numbers), classify it as Math/Easy. Only use Arrays topic for problems involving array data structures and algorithms.`
          }
        ],
        max_tokens: 200,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
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
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      // Fallback to default values if parsing fails
      analysis = { 
        topic: 'Math', 
        difficulty: 'Easy',
        recommendation: 'should_focus',
        reason: 'Continue practicing to strengthen fundamentals'
      };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-problem function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      topic: 'Math',
      difficulty: 'Easy',
      recommendation: 'should_focus',
      reason: 'Continue practicing to strengthen fundamentals'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
