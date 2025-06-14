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

    // Validate and parse URL
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch (err) {
      throw new Error('Invalid URL format')
    }

    const platform = detectPlatform(parsedUrl.hostname)
    let problemDetails

    if (platform === 'LeetCode') {
      // Robust slug parsing for LeetCode
      // Must extract between /problems/ and next slash (or to end)
      let slug = ''
      const slugMatch = parsedUrl.pathname.match(/\/problems\/([^\/\s]+)(?:\/|$)/)
      if (slugMatch) {
        slug = slugMatch[1]
      } else {
        throw new Error('Invalid LeetCode problem URL format: Could not find a problem slug in ' + parsedUrl.pathname)
      }
      console.log('Extracted LeetCode slug:', slug)

      // LeetCode GraphQL API request for data
      const query = `
        query getQuestionDetail($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
            title
            translatedTitle
            titleSlug
            questionId
            isPaidOnly
            difficulty
            topicTags {
              name
              slug
            }
            content
          }
        }
      `
      const gqlBody = {
        operationName: "getQuestionDetail",
        variables: { titleSlug: slug },
        query,
      }

      const response = await fetch("https://leetcode.com/graphql", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "referer": "https://leetcode.com/",
          "origin": "https://leetcode.com",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
        body: JSON.stringify(gqlBody),
      })

      if (!response.ok) {
        throw new Error(`LeetCode GraphQL API fetch error: ${response.status}, ${await response.text()}`)
      }

      const result = await response.json()
      if (!result?.data?.question) {
        throw new Error(`Could not fetch problem from LeetCode API for slug "${slug}"`)
      }
      const q = result.data.question

      // Pick topics: join all main topic tags names with comma
      let topic = ''
      if (q.topicTags && q.topicTags.length > 0) {
        topic = q.topicTags.map(tag => tag.name).join(', ')
      }

      // Strip HTML from LeetCode content
      function stripHtml(html: string): string {
        if (!html) return ''
        return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      }

      problemDetails = {
        name: q.title,
        description: stripHtml(q.content).substring(0, 480) + (q.content.length > 480 ? "..." : ""),
        difficulty: capitalizeFirst(q.difficulty ? q.difficulty.toLowerCase() : ""),
        topic: topic,
        platform: "LeetCode",
        url: url
      }

      console.log('Extracted problem details from LeetCode:', problemDetails)

    } else if (platform === 'GeeksforGeeks') {
      // Extract problem slug (after /problems/ or /problem-of-the-day/ or /, fallback)
      let slug = '';
      let title = '';
      let difficulty = '';
      let topic = '';
      let description = '';
      try {
        let match = parsedUrl.pathname.match(/\/problems?\/([^\/#?\s]+)/);
        if (!match) match = parsedUrl.pathname.match(/\/problem-of-the-day\/([^\/#?\s]+)/);
        if (match) slug = match[1];

        // Fetch problem HTML page
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'text/html',
          }
        });
        if (!response.ok) throw new Error('Failed to fetch GFG problem page');
        const html = await response.text();

        // Extract title
        let titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i) || html.match(/<title[^>]*>([^<]+)<\/title>/i);
        title = titleMatch ? titleMatch[1].replace(/\s*-\s*GeeksforGeeks.*/i, '').trim() : slug;
        // Description: usually inside <div class="problem-statement"> or <div id="problemStatement">
        let descMatch = html.match(/<div[^>]+(?:class="problem-statement"|id="problemStatement")[^>]*>([\s\S]+?)<\/div>/i);
        if (!descMatch) {
          // Try main content inside <article>
          descMatch = html.match(/<article[^>]*>([\s\S]+?)<\/article>/i);
        }
        if (descMatch) {
          description = descMatch[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        } else {
          // Fallback to meta description
          let metaMatch = html.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i);
          if (metaMatch) description = metaMatch[1];
        }
        // Difficulty: look for 'Difficulty: <span>' or keywords in the page
        let diffMatch = html.match(/Difficulty:\s*<\/strong>\s*([^<\n]+)/i);
        if (!diffMatch) diffMatch = html.match(/difficulty[^>]*>\s*([^<]+)/i);
        difficulty = diffMatch ? capitalizeFirst(diffMatch[1].trim().toLowerCase()) : '';
        // Topic: look for <a ...> tag with /tags/ or meta keywords
        let topicMatch = html.match(/<a[^>]+href="\/tags\/[^"]+"[^>]*>([^<]+)<\/a>/i);
        if (topicMatch) {
          topic = topicMatch[1].trim();
        } else {
          // Try to guess from meta keywords
          let metaKeywords = html.match(/<meta[^>]+name="keywords"[^>]+content="([^"]*)"/i);
          if (metaKeywords) {
            topic = metaKeywords[1].split(',')[0].trim();
          }
        }
        // Final fallback
        if (!description) description = `GeeksforGeeks problem: ${title}. Practice coding and improve your skills.`;
        if (!topic) topic = guessTopic(title);

        problemDetails = {
          name: title,
          description: description.substring(0, 480) + (description.length > 480 ? "..." : ""),
          difficulty: difficulty || 'Medium',
          topic: topic,
          platform: "GeeksforGeeks",
          url: url,
        };
        console.log('Extracted GeeksforGeeks details:', problemDetails);

      } catch (err) {
        console.error('GFG extraction failed:', err);
        throw new Error('Failed to extract GeeksforGeeks problem details.');
      }

    } else if (platform === 'HackerRank') {
      let title = '', description = '', difficulty = '', topic = '';
      try {
        // Fetch problem page
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'text/html',
          }
        });
        if (!response.ok) throw new Error('Failed to fetch HackerRank problem page');
        const html = await response.text();

        // Extract title from <title> or <h1>
        let titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i) || html.match(/<title[^>]*>([^<]+)/i);
        title = titleMatch ? titleMatch[1].replace(/\s*\|\s*HackerRank.*$/i, '').trim() : '';
        // Description: <div class="challenge_problem_statement"> or <div class="problem-statement">
        let descMatch = html.match(/<div[^>]*class="challenge_problem_statement"[^>]*>([\s\S]+?)<\/div>/i) ||
          html.match(/<div[^>]*class="problem-statement"[^>]*>([\s\S]+?)<\/div>/i);
        if (descMatch) {
          description = descMatch[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        } else {
          // Fallback to <meta name="description">
          let metaMatch = html.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i);
          if (metaMatch) description = metaMatch[1];
        }
        // Difficulty from JavaScript JSON blob or in the HTML somewhere
        let diffMatch = html.match(/Difficulty:<\/b>\s*([A-Za-z]+)/) ||
                        html.match(/"difficulty":"([A-Za-z]+)"/) ||
                        html.match(/difficulty[^>]*>([^<]+)/i);
        difficulty = diffMatch ? capitalizeFirst(diffMatch[1].toLowerCase()) : '';
        // Topic: look for breadcrumbs/tags or guess from title
        let topicMatch = html.match(/<a[^>]+href="\/domains\/[\w-\/]+"[^>]*>([^<]+)<\/a>/i);
        if (topicMatch) topic = topicMatch[1].trim();
        if (!topic) topic = guessTopic(title);

        problemDetails = {
          name: title || 'HackerRank Challenge',
          description: description.substring(0, 480) + (description.length > 480 ? "..." : ""),
          difficulty: difficulty || 'Medium',
          topic: topic,
          platform: "HackerRank",
          url: url,
        };
        console.log('Extracted HackerRank details:', problemDetails);

      } catch (err) {
        console.error('HackerRank extraction failed:', err);
        throw new Error('Failed to extract HackerRank problem details.');
      }

    } else if (platform === 'Codeforces') {
      let title = '', description = '', difficulty = '', topic = '';
      try {
        // Fetch problem page
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'text/html',
          }
        });
        if (!response.ok) throw new Error('Failed to fetch Codeforces problem page');
        const html = await response.text();

        // Title: <div class="title"> or <title>
        let titleMatch = html.match(/<div[^>]*class="title"[^>]*>([^<]+)<\/div>/i) ||
          html.match(/<title[^>]*>([^<]+)<\/title>/i);
        title = titleMatch ? titleMatch[1].replace(/\s*-\s*Codeforces.*$/i, '').trim() : '';
        // Description: <div class="problem-statement">
        let descMatch = html.match(/<div[^>]*class="problem-statement"[^>]*>([\s\S]+?)<\/div>/i);
        if (descMatch) {
          description = descMatch[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        } else {
          // Fallback: the first <div class="problem-description">
          let altDesc = html.match(/<div[^>]*class="problem-description"[^>]*>([\s\S]+?)<\/div>/i);
          if (altDesc) {
            description = altDesc[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
          }
        }
        // Difficulty: not public on Codeforces, guess from contest (div1=hard, div2=medium, div3=easy)
        let contestInfo = html.match(/(Div\. ?[123])/i);
        if (contestInfo) {
          const div = contestInfo[1].toLowerCase();
          if (div.includes('1')) difficulty = 'Hard';
          else if (div.includes('2')) difficulty = 'Medium';
          else if (div.includes('3')) difficulty = 'Easy';
        }
        // Topic: look for tag-box or guess
        let topicMatch = html.match(/<span[^>]*class="tag-box[^"]*"[^>]*>([^<]+)<\/span>/i);
        topic = topicMatch ? topicMatch[1].trim() : guessTopic(title);

        problemDetails = {
          name: title || 'Codeforces Problem',
          description: description.substring(0, 480) + (description.length > 480 ? "..." : ""),
          difficulty: difficulty || 'Medium',
          topic: topic,
          platform: "Codeforces",
          url: url,
        };
        console.log('Extracted Codeforces details:', problemDetails);

      } catch (err) {
        console.error('Codeforces extraction failed:', err);
        throw new Error('Failed to extract Codeforces problem details.');
      }

    } else if (platform === 'CodeChef') {
      let title = '', description = '', difficulty = '', topic = '';
      try {
        // Fetch problem page
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'text/html',
          }
        });
        if (!response.ok) throw new Error('Failed to fetch CodeChef problem page');
        const html = await response.text();

        // Title: <title> or <h1>
        let titleMatch = html.match(/<title[^>]*>([^<]+)/i) ||
                         html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
        title = titleMatch ? titleMatch[1].replace(/\s*-?\s*CodeChef.*$/i, '').trim() : '';
        // Description: <div class="problem-statement">, <section> etc
        let descMatch = html.match(/<div[^>]*class="problem-statement"[^>]*>([\s\S]+?)<\/div>/i) ||
                        html.match(/<section[^>]*>([\s\S]+?)<\/section>/i);
        if (descMatch) {
          description = descMatch[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        } else {
          // Fallback: meta description
          let metaMatch = html.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i);
          if (metaMatch) description = metaMatch[1];
        }
        // Difficulty: usually shown as "Difficulty: Easy/Medium/Hard" on page
        let diffMatch = html.match(/Difficulty:\s*<\/strong>\s*([^<\n]+)/i) ||
                        html.match(/"difficulty":"([A-Za-z]+)"/) ||
                        html.match(/difficulty[^>]*>([^<]+)/i);
        difficulty = diffMatch ? capitalizeFirst(diffMatch[1].toLowerCase()) : '';
        // Topic: look for <a ...> tag with /tags/ or meta keywords
        let topicMatch = html.match(/<a[^>]+href="\/tags\/[^"]+"[^>]*>([^<]+)<\/a>/i);
        if (topicMatch) topic = topicMatch[1].trim();
        if (!topic) topic = guessTopic(title);

        problemDetails = {
          name: title || 'CodeChef Problem',
          description: description.substring(0, 480) + (description.length > 480 ? "..." : ""),
          difficulty: difficulty || 'Medium',
          topic: topic,
          platform: "CodeChef",
          url: url,
        };
        console.log('Extracted CodeChef details:', problemDetails);

      } catch (err) {
        console.error('CodeChef extraction failed:', err);
        throw new Error('Failed to extract CodeChef problem details.');
      }
    } else {
      // Generic extraction for other supported platforms
      let html = ""
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
          }
        })
        if (!response.ok) {
          throw new Error(`Failed to fetch problem page: ${response.status}`)
        }
        html = await response.text()
        console.log(`Fetched HTML content, length: ${html.length}`)
      } catch (error) {
        console.error('Error fetching problem details:', error)
        throw new Error('Unable to fetch problem details from the provided URL')
      }

      problemDetails = extractProblemDetails(html, platform, url)
    }

    return new Response(JSON.stringify(problemDetails), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in extract-problem-details:', error)
    return new Response(
      JSON.stringify({ error: error.message ?? 'Something went wrong' }),
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
    console.log('Processing LeetCode URL...')
    
    // Extract problem name from URL path as fallback
    const urlPath = new URL(url).pathname
    const problemSlug = urlPath.split('/').filter(p => p)[1] // Get the problem slug
    
    // Extract title - multiple approaches
    let titleMatch = html.match(/<title[^>]*>([^<]+)/i)
    if (titleMatch) {
      let title = titleMatch[1].trim()
      // Clean up LeetCode title
      title = title.replace(/\s*-\s*LeetCode.*$/i, '').trim()
      title = title.replace(/^\d+\.\s*/, '').trim() // Remove number prefix
      details.name = title
    }
    
    // If title extraction failed, use URL slug
    if (!details.name && problemSlug) {
      details.name = problemSlug.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    }

    // Extract difficulty - multiple patterns
    const difficultyPatterns = [
      /class="[^"]*text-difficulty-[^"]*"[^>]*>([^<]+)/gi,
      /"difficulty"\s*:\s*"([^"]+)"/gi,
      /Difficulty[^:]*:[^>]*>([^<]+)/gi,
      /class="[^"]*difficulty[^"]*"[^>]*>([^<]+)/gi
    ]
    
    for (const pattern of difficultyPatterns) {
      const match = html.match(pattern)
      if (match) {
        const difficulty = match[1].trim().toLowerCase()
        if (difficulty.includes('easy')) details.difficulty = 'Easy'
        else if (difficulty.includes('medium')) details.difficulty = 'Medium'
        else if (difficulty.includes('hard')) details.difficulty = 'Hard'
        if (details.difficulty) break
      }
    }

    // Extract description - look for problem statement
    const descPatterns = [
      /<div[^>]*class="[^"]*elfjS[^"]*"[^>]*>(.*?)<\/div>/s,
      /<div[^>]*class="[^"]*content[^"]*"[^>]*>(.*?)<\/div>/s,
      /<p[^>]*class="[^"]*mb-3[^"]*"[^>]*>(.*?)<\/p>/s,
      /"content"\s*:\s*"([^"]+)"/gi
    ]
    
    for (const pattern of descPatterns) {
      const match = html.match(pattern)
      if (match) {
        let desc = match[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
        if (desc.length > 50) {
          details.description = desc.substring(0, 200) + '...'
          break
        }
      }
    }

    // Extract topics/tags
    const topicPatterns = [
      /"topicTags"\s*:\s*\[(.*?)\]/s,
      /class="[^"]*topic-tag[^"]*"[^>]*>([^<]+)/gi,
      /data-topic="([^"]+)"/gi
    ]
    
    const topicMappings = {
      'array': 'Arrays',
      'string': 'Strings',
      'hash-table': 'Hash Tables',
      'dynamic-programming': 'Dynamic Programming',
      'math': 'Math',
      'two-pointers': 'Arrays',
      'binary-search': 'Searching',
      'tree': 'Trees',
      'depth-first-search': 'Trees',
      'breadth-first-search': 'Trees',
      'graph': 'Graphs',
      'backtracking': 'Backtracking',
      'stack': 'Stacks',
      'heap': 'Queues',
      'greedy': 'Greedy',
      'bit-manipulation': 'Bit Manipulation',
      'linked-list': 'Linked Lists',
      'sorting': 'Sorting'
    }
    
    for (const pattern of topicPatterns) {
      const matches = html.match(pattern)
      if (matches) {
        const topicText = matches[1] || matches[0]
        const lowerTopic = topicText.toLowerCase()
        
        // Find matching topic
        for (const [key, value] of Object.entries(topicMappings)) {
          if (lowerTopic.includes(key)) {
            details.topic = value
            break
          }
        }
        if (details.topic) break
      }
    }

    // Enhanced topic detection from problem name
    if (!details.topic && details.name) {
      const name = details.name.toLowerCase()
      if (name.includes('parentheses') || name.includes('bracket') || name.includes('valid')) {
        details.topic = 'Stacks'
      } else if (name.includes('substring') || name.includes('string')) {
        details.topic = 'Strings'
      } else if (name.includes('array') || name.includes('sum') || name.includes('numbers')) {
        details.topic = 'Arrays'
      } else if (name.includes('tree') || name.includes('binary')) {
        details.topic = 'Trees'
      } else if (name.includes('dynamic') || name.includes('dp')) {
        details.topic = 'Dynamic Programming'
      }
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
    details.difficulty = 'Medium'
    details.topic = 'Arrays'
  }

  // Enhanced fallbacks
  if (!details.name) {
    const urlPath = new URL(url).pathname
    const problemSlug = urlPath.split('/').filter(p => p)[1]
    if (problemSlug) {
      details.name = problemSlug.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    } else {
      details.name = 'Unknown Problem'
    }
  }
  
  if (!details.description) {
    details.description = `Problem from ${platform}: ${details.name}. Click the URL to view full problem statement.`
  }
  
  if (!details.difficulty) {
    details.difficulty = 'Medium'
  }
  
  if (!details.topic) {
    // Smart topic detection based on problem name
    const name = details.name.toLowerCase()
    if (name.includes('parentheses') || name.includes('bracket') || name.includes('stack')) {
      details.topic = 'Stacks'
    } else if (name.includes('substring') || name.includes('string') || name.includes('palindrome')) {
      details.topic = 'Strings'
    } else if (name.includes('tree') || name.includes('binary') || name.includes('node')) {
      details.topic = 'Trees'
    } else if (name.includes('graph') || name.includes('path') || name.includes('connected')) {
      details.topic = 'Graphs'
    } else if (name.includes('dynamic') || name.includes('dp') || name.includes('climb') || name.includes('coin')) {
      details.topic = 'Dynamic Programming'
    } else if (name.includes('sort') || name.includes('merge') || name.includes('quick')) {
      details.topic = 'Sorting'
    } else if (name.includes('search') || name.includes('find') || name.includes('binary')) {
      details.topic = 'Searching'
    } else if (name.includes('hash') || name.includes('map') || name.includes('duplicate')) {
      details.topic = 'Hash Tables'
    } else if (name.includes('linked') || name.includes('list') || name.includes('reverse')) {
      details.topic = 'Linked Lists'
    } else {
      details.topic = 'Arrays'
    }
  }

  console.log('Final extracted details:', details)
  return details
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function guessTopic(title?: string) {
  if (!title) return "Arrays";
  const name = title.toLowerCase();
  if (name.includes("parenthes") || name.includes("bracket") || name.includes("stack")) return "Stacks";
  if (name.includes("substring") || name.includes("string") || name.includes("palindrome")) return "Strings";
  if (name.includes("tree") || name.includes("binary") || name.includes("node")) return "Trees";
  if (name.includes("graph") || name.includes("path") || name.includes("connected")) return "Graphs";
  if (name.includes("dynamic") || name.includes("dp") || name.includes("climb") || name.includes("coin")) return "Dynamic Programming";
  if (name.includes("sort") || name.includes("merge") || name.includes("quick")) return "Sorting";
  if (name.includes("search") || name.includes("find") || name.includes("binary")) return "Searching";
  if (name.includes("hash") || name.includes("map") || name.includes("duplicate")) return "Hash Tables";
  if (name.includes("linked") || name.includes("list") || name.includes("reverse")) return "Linked Lists";
  if (name.includes("greedy")) return "Greedy";
  if (name.includes("math") || name.includes("number")) return "Math";
  if (name.includes("backtrack")) return "Backtracking";
  if (name.includes("queue") || name.includes("heap")) return "Queues";
  return "Arrays";
}
