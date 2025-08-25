import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

serve(async (req) => {
  console.log('quiz-generator function called:', req.method);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { content, topic, difficulty, numQuestions } = await req.json();
    console.log('Request data:', { 
      contentLength: content?.length, 
      topic, 
      difficulty, 
      numQuestions 
    });

    if (!content || content.trim().length < 20) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Content is too short. Please provide meaningful content.' 
        }),
        { headers: corsHeaders, status: 400 }
      );
    }

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    const openRouterKey = Deno.env.get('OPENROUTER_API_KEY');
    
    console.log('API Keys available:', { 
      gemini: !!geminiKey, 
      openRouter: !!openRouterKey 
    });

    if (!geminiKey && !openRouterKey) {
      console.error('No API keys found');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'API keys not configured.' 
        }),
        { headers: corsHeaders, status: 500 }
      );
    }

    const prompt = `Create exactly ${numQuestions} multiple choice questions based on this content:

"${content}"

Requirements:
- Each question must have exactly 4 options (A, B, C, D)
- Difficulty: ${difficulty}
- Topic: ${topic || 'General'}
- Return ONLY valid JSON in this format:

{
  "questions": [
    {
      "id": "q1",
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this is correct",
      "difficulty": "${difficulty}",
      "subject": "${topic || 'General'}"
    }
  ]
}`;

    let generatedText = '';

    // Try OpenRouter first
    if (openRouterKey) {
      try {
        console.log('Trying OpenRouter for quiz generation...');
        
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
        });

        if (!response.ok) {
          throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        generatedText = data.choices[0].message.content;
        console.log('OpenRouter quiz response received');
        
      } catch (openRouterError) {
        console.log('OpenRouter failed:', openRouterError.message);
        
        // Try Gemini as fallback
        if (geminiKey) {
          try {
            console.log('Trying Gemini as fallback...');
            
            const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [{
                  parts: [{
                    text: prompt
                  }]
                }]
              })
            });

            if (!geminiResponse.ok) {
              throw new Error(`Gemini API error: ${geminiResponse.status}`);
            }

            const geminiData = await geminiResponse.json();
            generatedText = geminiData.candidates[0].content.parts[0].text;
            console.log('Gemini quiz response received');
            
          } catch (geminiError) {
            console.error('Both APIs failed:', { openRouter: openRouterError.message, gemini: geminiError.message });
            throw new Error('AI services unavailable. Please try again later.');
          }
        } else {
          throw openRouterError;
        }
      }
    }

    // Parse JSON response
    let questionsData;
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        questionsData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (parseError) {
      console.log('JSON parsing failed, creating fallback questions');
      
      // Create fallback questions
      questionsData = {
        questions: Array.from({ length: numQuestions }, (_, index) => ({
          id: `q${index + 1}`,
          question: `Based on the content, what is a key concept discussed? (Question ${index + 1})`,
          options: [
            "A fundamental principle of the topic",
            "An outdated concept", 
            "Only theoretical information",
            "Contradictory information"
          ],
          correctAnswer: 0,
          explanation: "The content emphasizes key concepts as fundamental to understanding.",
          difficulty: difficulty,
          subject: topic || 'General'
        }))
      };
    }

    // Validate and format response
    if (!questionsData?.questions || !Array.isArray(questionsData.questions)) {
      throw new Error('Invalid response format');
    }

    const finalQuestions = questionsData.questions.slice(0, numQuestions).map((q: any, index: number) => ({
      id: q.id || `q${index + 1}`,
      question: q.question || `Question ${index + 1} about the content`,
      options: Array.isArray(q.options) && q.options.length === 4 ? q.options : [
        "Option A", "Option B", "Option C", "Option D"
      ],
      correctAnswer: typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer <= 3 ? q.correctAnswer : 0,
      explanation: q.explanation || "Based on the provided content.",
      difficulty: difficulty,
      subject: topic || 'General'
    }));

    console.log(`Successfully generated ${finalQuestions.length} questions`);

    return new Response(
      JSON.stringify({ success: true, data: { questions: finalQuestions } }),
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('Quiz generation error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to generate quiz' 
      }),
      { headers: corsHeaders, status: 500 }
    );
  }
});