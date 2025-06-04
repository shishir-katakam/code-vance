
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

    // LeetCode GraphQL query to get solved problems
    const query = `
      query userProfileUserQuestionProgressV2($userSlug: String!) {
        userProfileUserQuestionProgressV2(userSlug: $userSlug) {
          numAcceptedQuestions {
            difficulty
            count
          }
          userSessionBeatsPercentage {
            difficulty
            percentage
          }
          numSubmissionQuestions {
            difficulty
            count
          }
        }
        allQuestionsCount {
          difficulty
          count
        }
        matchedUser(username: $userSlug) {
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
          problemsSolvedBeatsStats {
            difficulty
            percentage
          }
          submissionCalendar
          profile {
            realName
            aboutMe
            userAvatar
            location
            skillTags
            websites
            school
            company
            jobTitle
          }
        }
        recentSubmissionList(username: $userSlug) {
          title
          titleSlug
          timestamp
          statusDisplay
          lang
          __typename
        }
      }
    `

    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
      },
      body: JSON.stringify({
        query,
        variables: { userSlug: username }
      })
    })

    const data = await response.json()

    if (data.errors) {
      throw new Error('Failed to fetch LeetCode data')
    }

    // Get accepted submissions
    const recentSubmissions = data.data.recentSubmissionList.filter(
      (submission: any) => submission.statusDisplay === 'Accepted'
    )

    // For each accepted submission, get problem details
    const problems = []
    for (const submission of recentSubmissions.slice(0, 50)) { // Limit to 50 recent problems
      try {
        const problemQuery = `
          query questionTitle($titleSlug: String!) {
            question(titleSlug: $titleSlug) {
              questionId
              title
              content
              difficulty
              topicTags {
                name
                slug
              }
              codeSnippets {
                lang
                code
              }
            }
          }
        `

        const problemResponse = await fetch('https://leetcode.com/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Referer': 'https://leetcode.com',
          },
          body: JSON.stringify({
            query: problemQuery,
            variables: { titleSlug: submission.titleSlug }
          })
        })

        const problemData = await problemResponse.json()
        
        if (problemData.data && problemData.data.question) {
          const question = problemData.data.question
          
          problems.push({
            platform_problem_id: question.questionId,
            title: question.title,
            titleSlug: submission.titleSlug,
            difficulty: question.difficulty,
            topics: question.topicTags.map((tag: any) => tag.name),
            content: question.content,
            language: submission.lang,
            timestamp: submission.timestamp,
            url: `https://leetcode.com/problems/${submission.titleSlug}/`
          })
        }
      } catch (error) {
        console.error(`Error fetching problem ${submission.titleSlug}:`, error)
      }
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
