
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { username } = await req.json()
    console.log(`Starting Codeforces sync for username: ${username}`)

    const submissionsResponse = await fetch(`https://codeforces.com/api/user.status?handle=${username}&from=1&count=10000`)
    
    if (!submissionsResponse.ok) {
        console.log(`Codeforces API request failed for user ${username} with status: ${submissionsResponse.status}`);
        // Return 200 with an error payload for graceful frontend handling
        return new Response(JSON.stringify({ error: `Codeforces API is temporarily unavailable. Please try again later.` }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
        });
    }

    const data = await submissionsResponse.json();
    console.log('Codeforces API response received');
    
    if (data.status === 'FAILED') {
        console.log(`Codeforces user not found: ${username}`);
        // Return 200 with an error payload for graceful frontend handling
        return new Response(JSON.stringify({ error: `User with handle '${username}' not found on Codeforces.` }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
        });
    }

    if (data.status !== 'OK' || !data.result) {
        // This case handles users with no submissions, which is valid.
        console.log(`Codeforces user ${username} has no submissions or API returned an unexpected status: ${data.status}`);
        return new Response(JSON.stringify({ problems: [] }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
    
    const problems = []
    const submissions = data.result
    const solvedProblems = new Set()
    
    for (const submission of submissions) {
      if (submission.verdict === 'OK') {
        const problemId = `${submission.problem.contestId}${submission.problem.index}`
        
        if (!solvedProblems.has(problemId)) {
          solvedProblems.add(problemId)
          
          let difficulty = 'Medium'
          const rating = submission.problem.rating || 1200
          if (rating < 1200) difficulty = 'Easy'
          else if (rating < 1800) difficulty = 'Medium'
          else difficulty = 'Hard'
          
          problems.push({
            platform_problem_id: problemId,
            title: submission.problem.name,
            titleSlug: submission.problem.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            difficulty: difficulty,
            topics: submission.problem.tags || ['Implementation'],
            content: `Codeforces problem: ${submission.problem.name}`,
            language: submission.programmingLanguage || 'C++',
            timestamp: submission.creationTimeSeconds,
            url: `https://codeforces.com/problemset/problem/${submission.problem.contestId}/${submission.problem.index}`
          })
        }
      }
    }
    
    console.log(`Found ${problems.length} solved problems from Codeforces for ${username}`)
    
    return new Response(JSON.stringify({ problems }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in sync-codeforces:', error)
    return new Response(
      JSON.stringify({ error: `An internal error occurred: ${error.message}` }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

