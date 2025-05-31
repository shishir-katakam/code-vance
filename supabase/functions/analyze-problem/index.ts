
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
    const { problemName, description, platform } = await req.json();

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
            content: `You are an expert coding problem analyzer. Analyze the given problem and return ONLY a JSON object with the following structure:
{
  "topic": "one of: Arrays, Strings, Trees, Graphs, Dynamic Programming, Sorting, Searching, Linked Lists, Stacks, Queues, Hash Tables, Heaps, Recursion, Backtracking, Greedy, Math, Bit Manipulation, Two Pointers, Sliding Window",
  "difficulty": "one of: Easy, Medium, Hard"
}

Base your analysis on the problem name, description, and typical difficulty levels from ${platform || 'coding platforms'}. Return ONLY the JSON object, no additional text.`
          },
          {
            role: 'user',
            content: `Problem Name: ${problemName}\nDescription: ${description}\nPlatform: ${platform || 'Unknown'}`
          }
        ],
        max_tokens: 150,
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
      analysis = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      // Fallback to default values if parsing fails
      analysis = { topic: 'Arrays', difficulty: 'Medium' };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-problem function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      topic: 'Arrays', // fallback
      difficulty: 'Medium' // fallback
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
