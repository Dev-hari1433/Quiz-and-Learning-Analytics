import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "npm:@google/generative-ai@^0.24.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, type, text } = await req.json()

    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      throw new Error('Gemini API key not found in environment variables')
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
      const content = response.text()

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
      const prompt = `
        Analyze the following text comprehensively:

        "${text}"

        Provide a detailed analysis including:
        1. A concise summary (2-3 sentences)
        2. 5 key points or insights from the text
        3. Overall sentiment (positive, negative, or neutral)
        4. Main topics and themes
        5. The complexity/reading level
        6. Any notable patterns or interesting observations

        Format your response as JSON with this structure:
        {
          "summary": "your summary here",
          "keyPoints": ["point 1", "point 2", "point 3", "point 4", "point 5"],
          "sentiment": "positive/negative/neutral",
          "topics": ["topic1", "topic2", "topic3"],
          "readingLevel": "beginner/intermediate/advanced",
          "observations": "any notable patterns or insights"
        }
      `

      const result = await model.generateContent(prompt)
      const response = await result.response
      const analysisText = response.text()

      // Try to parse JSON response, fallback to structured format
      let analysisData
      try {
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          analysisData = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('No JSON found')
        }
      } catch {
        // Fallback structured response
        const wordCount = text.split(' ').length
        const readingTime = Math.ceil(wordCount / 200)
        
        analysisData = {
          summary: analysisText.substring(0, 300),
          keyPoints: [
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

    throw new Error('Invalid request type')

  } catch (error) {
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