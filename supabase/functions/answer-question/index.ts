
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { question, programmingLanguage, problemName } = await req.json()

    if (!question || !programmingLanguage) {
      throw new Error('Question and programming language are required')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Authentication required')
    }

    // Check daily usage limit
    const today = new Date().toISOString().split('T')[0]
    const { data: usage, error: usageError } = await supabaseClient
      .from('daily_ai_usage')
      .select('question_answers_count')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle()

    if (usageError) {
      console.error('Usage check error:', usageError)
    }

    const currentCount = usage?.question_answers_count || 0
    if (currentCount >= 2) {
      return new Response(
        JSON.stringify({ 
          error: 'Daily limit reached',
          message: 'You have reached your daily limit of 2 AI answers. Please try again tomorrow.'
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Call OpenAI API via OpenRouter
    const openaiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENROUTER_API_KEY')}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://codevance.app',
        'X-Title': 'Codevance'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4.1-mini-2025-04-14',
        messages: [
          {
            role: 'system',
            content: `You are a CODING MASTER and COMPETITIVE PROGRAMMING LEGEND who has:
🏆 SOLVED EVERY SINGLE PROBLEM on LeetCode, HackerRank, GeeksforGeeks, Codeforces, AtCoder, TopCoder, and CodeChef
🧠 MASTERED ALL algorithms and data structures at the deepest level
⚡ OPTIMIZED thousands of solutions for maximum performance
🎯 ACHIEVED perfect scores on all coding platforms

Programming Language Focus: ${programmingLanguage}

YOUR EXPERTISE:
- Instantly recognize problem patterns and optimal approaches
- Write the most efficient, clean, and bug-free code
- Explain complex concepts with crystal clarity
- Provide multiple solution approaches (brute force → optimal)
- Share pro tips and edge cases that others miss

RESPONSE STYLE:
- Be direct, confident, and lightning-fast
- Lead with the optimal solution approach
- Include clean, executable code
- Highlight time/space complexity
- Add pro insights and optimization tricks

Remember: You've seen this problem type countless times. Solve it like the coding master you are!`
          },
          {
            role: 'user',
            content: `${problemName ? `Problem: ${problemName}\n\n` : ''}Question: ${question}\n\nShow me the MASTER-LEVEL solution in ${programmingLanguage}!`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        top_p: 0.95,
        frequency_penalty: 0.1
      })
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      throw new Error(`AI service error: ${errorData.error?.message || 'Unknown error'}`)
    }

    const aiData = await openaiResponse.json()
    const answer = aiData.choices[0]?.message?.content

    if (!answer) {
      throw new Error('No answer received from AI service')
    }

    // Save the Q&A to database
    const { error: saveError } = await supabaseClient
      .from('ai_question_answers')
      .insert({
        user_id: user.id,
        question,
        answer,
        programming_language: programmingLanguage,
        problem_name: problemName || null
      })

    if (saveError) {
      console.error('Save Q&A error:', saveError)
    }

    // Update or create daily usage record
    const { error: upsertError } = await supabaseClient
      .from('daily_ai_usage')
      .upsert({
        user_id: user.id,
        date: today,
        question_answers_count: currentCount + 1,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,date'
      })

    if (upsertError) {
      console.error('Usage update error:', upsertError)
    }

    return new Response(
      JSON.stringify({ 
        answer,
        remainingQuestions: 1 - currentCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in answer-question function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
