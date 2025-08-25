import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "npm:@google/generative-ai@^0.24.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Fallback to OpenRouter DeepSeek if Gemini fails
async function callOpenRouterDeepSeek(prompt: string, type: string) {
  const openRouterKey = Deno.env.get('OPENROUTER_API_KEY')
  if (!openRouterKey) {
    throw new Error('OpenRouter API key not found')
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openRouterKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://lovable.dev',
      'X-Title': 'Smart Research'
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-chat',
      messages: [{
        role: 'user',
        content: prompt
      }],
      temperature: 0.7,
      max_tokens: 2000
    })
  })

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, type, text } = await req.json()
    console.log(`Processing request - Type: ${type}, Query: ${query?.substring(0, 50)}...`)

    let content = ''
    
    // Try Gemini first
    try {
      const apiKey = Deno.env.get('GEMINI_API_KEY')
      if (!apiKey) {
        throw new Error('Gemini API key not found')
      }

      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

      if (type === 'search') {
        const prompt = `
          Search the web and provide comprehensive information about: "${query}"
          
          Please provide:
          1. A detailed overview and definition
          2. Current facts, statistics, and developments
          3. Key concepts and important points
          4. Real-world applications and examples
          5. Recent news or updates if relevant
          6. Related topics worth exploring
          
          Structure your response in a clear, informative way that would help someone learn about this topic.
          Focus on accuracy and provide the most up-to-date information available.
        `

        const result = await model.generateContent(prompt)
        const response = await result.response
        content = response.text()
      } else if (type === 'analyze') {
        const prompt = `Analyze the following text comprehensively: "${text}"`
        const result = await model.generateContent(prompt)
        const response = await result.response
        content = response.text()
      }
    } catch (geminiError) {
      console.log('Gemini failed, trying OpenRouter DeepSeek:', geminiError.message)
      
      // Fallback to OpenRouter DeepSeek
      try {
        if (type === 'search') {
          const prompt = `Provide comprehensive web search information about: "${query}". Include current facts, key concepts, applications, and recent developments.`
          content = await callOpenRouterDeepSeek(prompt, type)
        } else if (type === 'analyze') {
          const prompt = `Analyze this text comprehensively: "${text}". Provide summary, key points, sentiment, and topics.`
          content = await callOpenRouterDeepSeek(prompt, type)
        }
      } catch (openRouterError) {
        console.error('Both APIs failed:', { gemini: geminiError.message, openRouter: openRouterError.message })
        throw new Error('Both Gemini and OpenRouter APIs failed. Please try again later.')
      }
    }

    if (type === 'search') {
      // Format as search results
      const searchResults = [
        {
          title: `Complete Guide: ${query}`,
          url: '#ai-research',
          content: content,
          favicon: '🤖'
        },
        {
          title: `Key Facts about ${query}`,
          url: '#ai-facts',  
          content: content.substring(0, 400) + '...',
          favicon: '📊'
        },
        {
          title: `Latest Information on ${query}`,
          url: '#ai-latest',
          content: content.substring(400, 800) + '...',
          favicon: '🔥'
        }
      ]

      return new Response(
        JSON.stringify({ results: searchResults }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    if (type === 'analyze') {
      // Try to parse JSON response, fallback to structured format
      let analysisData
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          analysisData = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('No JSON found in response')
        }
      } catch (parseError) {
        console.log('JSON parsing failed, creating structured response:', parseError.message)
        // Fallback structured response
        const wordCount = text.split(' ').length
        const readingTime = Math.ceil(wordCount / 200)
        
        analysisData = {
          summary: content.substring(0, 300) + (content.length > 300 ? '...' : ''),
          keyPoints: content.split('\n').filter(line => line.trim()).slice(0, 5).map(line => line.trim()) || [
            "Key insight extracted from the text",
            "Important concept or theme identified", 
            "Notable pattern or trend observed",
            "Significant conclusion or takeaway",
            "Relevant contextual information"
          ],
          sentiment: 'neutral',
          topics: ['Analysis', 'Research', 'Content'],
          readingLevel: wordCount > 1000 ? 'advanced' : wordCount > 500 ? 'intermediate' : 'beginner',
          observations: 'Text analyzed using AI-powered natural language processing'
        }
      }

      // Add calculated metrics
      const wordCount = text.split(' ').length
      const readingTime = Math.ceil(wordCount / 200)
      
      const finalResult = {
        ...analysisData,
        wordCount,
        readingTime
      }

      return new Response(
        JSON.stringify({ analysis: finalResult }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid request type. Use "search" or "analyze".' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred while processing your request' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})