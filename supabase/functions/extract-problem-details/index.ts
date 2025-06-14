
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
    const { url } = await req.json()
    console.log(`Extracting problem details from URL: ${url}`)

    if (!url || typeof url !== 'string') {
      throw new Error('Valid URL is required')
    }

    // Validate URL format
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      throw new Error('Invalid URL format')
    }

    const platform = detectPlatform(parsedUrl.hostname)
    
    let problemDetails
    
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch problem page: ${response.status}`)
      }

      const html = await response.text()
      problemDetails = extractProblemDetails(html, platform, url)
      
    } catch (error) {
      console.error('Error fetching problem details:', error)
      throw new Error('Unable to fetch problem details from the provided URL')
    }

    return new Response(JSON.stringify(problemDetails), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in extract-problem-details:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

function detectPlatform(hostname: string): string {
  if (hostname.includes('leetcode.com')) return 'LeetCode'
  if (hostname.includes('geeksforgeeks.org')) return 'GeeksforGeeks'
  if (hostname.includes('hackerrank.com')) return 'HackerRank'
  if (hostname.includes('codeforces.com')) return 'Codeforces'
  if (hostname.includes('codechef.com')) return 'CodeChef'
  if (hostname.includes('atcoder.jp')) return 'AtCoder'
  return 'Other'
}

function extractProblemDetails(html: string, platform: string, url: string) {
  const details = {
    name: '',
    description: '',
    difficulty: '',
    topic: '',
    platform: platform,
    url: url
  }

  if (platform === 'LeetCode') {
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+(?:LeetCode|Solution))/i) ||
                     html.match(/data-cy="question-title"[^>]*>([^<]+)/i) ||
                     html.match(/"questionTitle":"([^"]+)"/i) ||
                     html.match(/class="[^"]*title[^"]*"[^>]*>([^<]+)/i)
    
    if (titleMatch) {
      details.name = titleMatch[1].replace(/\s*-\s*LeetCode.*$/i, '').trim()
    }

    // Extract difficulty
    const difficultyMatch = html.match(/"difficulty":"([^"]+)"/i) ||
                           html.match(/class="[^"]*difficulty[^"]*"[^>]*>([^<]+)/i) ||
                           html.match(/Difficulty:\s*<[^>]*>([^<]+)/i)
    
    if (difficultyMatch) {
      details.difficulty = capitalizeFirst(difficultyMatch[1].toLowerCase())
    }

    // Extract description
    const descMatch = html.match(/"content":"([^"]+)"/i) ||
                     html.match(/class="[^"]*content[^"]*"[^>]*>([^<]+)/i)
    
    if (descMatch) {
      details.description = descMatch[1].substring(0, 200).replace(/\\n/g, ' ').trim() + '...'
    }

    // Extract topics
    const topicsMatch = html.match(/"topicTags":\[([^\]]+)\]/i) ||
                       html.match(/Topics?[^:]*:([^<]+)/i)
    
    if (topicsMatch) {
      const topicString = topicsMatch[1]
      if (topicString.includes('Array')) details.topic = 'Arrays'
      else if (topicString.includes('String')) details.topic = 'Strings'
      else if (topicString.includes('Tree')) details.topic = 'Trees'
      else if (topicString.includes('Graph')) details.topic = 'Graphs'
      else if (topicString.includes('Dynamic')) details.topic = 'Dynamic Programming'
      else if (topicString.includes('Hash')) details.topic = 'Hash Tables'
      else details.topic = 'Arrays' // Default
    }

  } else if (platform === 'GeeksforGeeks') {
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)/i) ||
                     html.match(/class="[^"]*problem[^"]*title[^"]*"[^>]*>([^<]+)/i)
    
    if (titleMatch) {
      details.name = titleMatch[1].replace(/\s*-\s*GeeksforGeeks.*$/i, '').trim()
    }

    // Extract difficulty
    const difficultyMatch = html.match(/Difficulty:\s*<[^>]*>([^<]+)/i) ||
                           html.match(/class="[^"]*difficulty[^"]*"[^>]*>([^<]+)/i)
    
    if (difficultyMatch) {
      details.difficulty = capitalizeFirst(difficultyMatch[1].toLowerCase())
    }

    // Basic description from title or meta
    details.description = `GeeksforGeeks problem: ${details.name}. Practice coding and improve your skills.`

  } else if (platform === 'HackerRank') {
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)/i) ||
                     html.match(/class="[^"]*challenge[^"]*title[^"]*"[^>]*>([^<]+)/i)
    
    if (titleMatch) {
      details.name = titleMatch[1].replace(/\s*\|\s*HackerRank.*$/i, '').trim()
    }

    // Extract difficulty
    const difficultyMatch = html.match(/Difficulty:\s*([^<\n]+)/i) ||
                           html.match(/class="[^"]*difficulty[^"]*"[^>]*>([^<]+)/i)
    
    if (difficultyMatch) {
      details.difficulty = capitalizeFirst(difficultyMatch[1].toLowerCase())
    }

    details.description = `HackerRank challenge: ${details.name}. Solve coding problems and improve your programming skills.`

  } else {
    // Generic extraction for other platforms
    const titleMatch = html.match(/<title[^>]*>([^<]+)/i)
    if (titleMatch) {
      details.name = titleMatch[1].trim()
    }
    
    details.description = `Coding problem from ${platform}: ${details.name}`
    details.difficulty = 'Medium' // Default difficulty
    details.topic = 'Arrays' // Default topic
  }

  // Fallbacks if extraction failed
  if (!details.name) {
    const urlPath = new URL(url).pathname
    details.name = urlPath.split('/').pop()?.replace(/[-_]/g, ' ') || 'Unknown Problem'
  }
  
  if (!details.description) {
    details.description = `Problem from ${platform}: ${details.name}`
  }
  
  if (!details.difficulty) {
    details.difficulty = 'Medium'
  }
  
  if (!details.topic) {
    details.topic = 'Arrays'
  }

  return details
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
