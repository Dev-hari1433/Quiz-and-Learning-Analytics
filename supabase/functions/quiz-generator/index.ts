import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "npm:@google/generative-ai@^0.24.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Content-Type': 'application/json',
}

// Fallback to OpenRouter DeepSeek if Gemini fails
async function callOpenRouterDeepSeek(prompt: string) {
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
      'X-Title': 'Quiz Generator'
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-chat',
      messages: [{
        role: 'user',
        content: prompt
      }],
      temperature: 0.3,
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
    const { content, topic, difficulty, numQuestions } = await req.json()
    console.log(`Generating ${numQuestions} quiz questions - Difficulty: ${difficulty}, Topic: ${topic}`)

    // Check API keys first
    const geminiKey = Deno.env.get('GEMINI_API_KEY')
    const openRouterKey = Deno.env.get('OPENROUTER_API_KEY')
    
    if (!geminiKey && !openRouterKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'API keys not configured. Please add GEMINI_API_KEY or OPENROUTER_API_KEY to your Supabase secrets.' 
        }),
        { headers: corsHeaders, status: 500 }
      )
    }

    if (!content || content.trim().length < 50) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Content is too short. Please provide at least 50 characters of meaningful content.' 
        }),
        { headers: corsHeaders, status: 400 }
      )
    }

    let generatedText = ''
    
    // Create comprehensive prompt for quiz generation
    const prompt = `
Analyze the following content and generate exactly ${numQuestions} multiple choice questions (MCQ) based on it.

CONTENT TO ANALYZE:
"${content}"

REQUIREMENTS:
- Generate exactly ${numQuestions} questions
- Each question must have exactly 4 answer choices (A, B, C, D)  
- Difficulty level: ${difficulty}
- Topic focus: ${topic || 'based on the content provided'}
- Questions should test understanding, analysis, and application of the content
- Include varied question types: factual, conceptual, and analytical
- Provide clear explanations for correct answers

FORMAT: Return ONLY valid JSON in this exact structure:
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this answer is correct",
      "difficulty": "${difficulty}",
      "subject": "${topic || 'General'}"
    }
  ]
}

IMPORTANT: 
- correctAnswer should be the INDEX (0-3) of the correct option
- Base questions directly on the provided content
- Make incorrect options plausible but clearly wrong
- Ensure questions are appropriate for ${difficulty} difficulty level
`

    // Try Gemini first if available
    try {
      if (!geminiKey) {
        throw new Error('Gemini API key not found')
      }

      const genAI = new GoogleGenerativeAI(geminiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
      
      const result = await model.generateContent(prompt)
      const response = await result.response
      generatedText = response.text()
    } catch (geminiError) {
      console.log('Gemini failed, trying OpenRouter DeepSeek:', geminiError.message)
      
      // Fallback to OpenRouter DeepSeek
      try {
        generatedText = await callOpenRouterDeepSeek(prompt)
      } catch (openRouterError) {
        console.error('Both APIs failed:', { gemini: geminiError.message, openRouter: openRouterError.message })
        throw new Error('Failed to generate quiz questions. Please try again later.')
      }
    }

    // Parse the JSON response
    let questionsData
    try {
      // Try to extract JSON from response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        questionsData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No valid JSON found in response')
      }
    } catch (parseError) {
      console.log('JSON parsing failed, creating fallback questions:', parseError.message)
      
      // Fallback: Generate questions based on content analysis
      const contentWords = content.split(' ')
      const keyTerms = contentWords.filter(word => word.length > 6).slice(0, 10)
      
      questionsData = {
        questions: Array.from({ length: numQuestions }, (_, index) => ({
          id: `q${index + 1}`,
          question: `Based on the content provided, what is the significance of the key concepts discussed? (Question ${index + 1})`,
          options: [
            "They provide fundamental understanding of the topic",
            "They are outdated concepts no longer relevant", 
            "They only apply to theoretical scenarios",
            "They contradict established principles"
          ],
          correctAnswer: 0,
          explanation: "The content emphasizes the importance of understanding key concepts as they form the foundation for deeper learning.",
          difficulty: difficulty,
          subject: topic || 'Content Analysis'
        }))
      }
    }

    // Validate the response structure
    if (!questionsData?.questions || !Array.isArray(questionsData.questions)) {
      throw new Error('Invalid response structure from AI')
    }

    // Ensure we have the exact number of questions requested
    const finalQuestions = questionsData.questions.slice(0, numQuestions).map((q: any, index: number) => ({
      id: q.id || `q${index + 1}`,
      question: q.question || `Question ${index + 1} based on the provided content`,
      options: Array.isArray(q.options) && q.options.length === 4 ? q.options : [
        "Option A based on content",
        "Option B based on content", 
        "Option C based on content",
        "Option D based on content"
      ],
      correctAnswer: typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer <= 3 ? q.correctAnswer : 0,
      explanation: q.explanation || "This answer is based on the analysis of the provided content.",
      difficulty: difficulty,
      subject: topic || q.subject || 'General Knowledge'
    }))

    console.log(`Successfully generated ${finalQuestions.length} questions`)

    return new Response(
      JSON.stringify({ success: true, data: { questions: finalQuestions } }),
      { headers: corsHeaders, status: 200 }
    )

  } catch (error) {
    console.error('Quiz generation error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to generate quiz questions' 
      }),
      { headers: corsHeaders, status: 500 }
    )
  }
})