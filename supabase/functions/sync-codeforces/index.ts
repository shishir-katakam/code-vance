
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

    const problems = []
    
    try {
      // Use Codeforces API to get user submissions
      const submissionsResponse = await fetch(`https://codeforces.com/api/user.status?handle=${username}&from=1&count=10000`)
      
      if (submissionsResponse.ok) {
        const data = await submissionsResponse.json()
        console.log('Codeforces API response received')
        
        if (data.status === 'OK' && data.result) {
          const submissions = data.result
          const solvedProblems = new Set()
          
          // Process accepted submissions
          for (const submission of submissions) {
            if (submission.verdict === 'OK') {
              const problemId = `${submission.problem.contestId}${submission.problem.index}`
              
              if (!solvedProblems.has(problemId)) {
                solvedProblems.add(problemId)
                
                // Map rating to difficulty
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
          
          console.log(`Found ${problems.length} solved problems from Codeforces API`)
        } else {
          throw new Error('Invalid API response')
        }
      } else {
        console.log(`Codeforces API request failed with status: ${submissionsResponse.status}`)
        throw new Error('API request failed')
      }
    } catch (error) {
      console.log('Codeforces API error:', error)
      throw new Error('Unable to fetch Codeforces data')
    }

    console.log(`Codeforces sync completed: ${problems.length} problems`)
    return new Response(JSON.stringify({ problems }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in sync-codeforces:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
