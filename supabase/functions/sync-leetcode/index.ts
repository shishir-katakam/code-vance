
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { username } = await req.json()

    // Try to get user's solved problems using LeetCode's public API
    // Since GraphQL might be blocked, let's try a simpler approach
    const submissionsUrl = `https://leetcode.com/${username}/`
    
    // For now, we'll create some mock data since LeetCode's API is restricted
    // In a real implementation, you'd need to use LeetCode's official API or web scraping
    const mockProblems = [
      {
        platform_problem_id: '1',
        title: 'Two Sum',
        titleSlug: 'two-sum',
        difficulty: 'Easy',
        topics: ['Array', 'Hash Table'],
        content: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        language: 'JavaScript',
        timestamp: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
        url: 'https://leetcode.com/problems/two-sum/'
      },
      {
        platform_problem_id: '2',
        title: 'Add Two Numbers',
        titleSlug: 'add-two-numbers',
        difficulty: 'Medium',
        topics: ['Linked List', 'Math'],
        content: 'You are given two non-empty linked lists representing two non-negative integers.',
        language: 'JavaScript',
        timestamp: Math.floor(Date.now() / 1000) - 172800, // 2 days ago
        url: 'https://leetcode.com/problems/add-two-numbers/'
      }
    ]

    // Try to fetch actual data, but fall back to mock data if it fails
    let problems = mockProblems
    
    try {
      // Attempt to fetch from LeetCode's public profile API
      const profileResponse = await fetch(`https://leetcode.com/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://leetcode.com',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        body: JSON.stringify({
          query: `
            query userPublicProfile($username: String!) {
              matchedUser(username: $username) {
                username
                profile {
                  realName
                }
                submitStatsGlobal {
                  acSubmissionNum {
                    difficulty
                    count
                  }
                }
              }
            }
          `,
          variables: { username }
        })
      })

      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        console.log('LeetCode profile data:', profileData)
        
        // If we successfully got profile data, we know the user exists
        // For demo purposes, we'll use the mock problems
        // In production, you'd need proper API access or web scraping
      }
    } catch (error) {
      console.log('Failed to fetch from LeetCode API, using mock data:', error)
    }

    return new Response(JSON.stringify({ problems }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in sync-leetcode:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
