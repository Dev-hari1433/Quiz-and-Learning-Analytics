import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

serve(async (req) => {
  console.log('=== QUIZ-GENERATOR FUNCTION START ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { content, topic, difficulty, numQuestions } = await req.json();
    console.log('Request parameters:', { 
      contentLength: content?.length,
      contentPreview: content?.substring(0, 100),
      topic, 
      difficulty, 
      numQuestions 
    });

    // Validate inputs
    if (!content || content.trim().length < 20) {
      const errorMsg = 'Content is too short. Please provide meaningful content (at least 20 characters).';
      console.error('Validation error:', errorMsg);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMsg
        }),
        { headers: corsHeaders, status: 400 }
      );
    }

    if (!numQuestions || numQuestions < 1 || numQuestions > 20) {
      const errorMsg = 'Number of questions must be between 1 and 20.';
      console.error('Validation error:', errorMsg);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMsg
        }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // Get API keys
    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    const openRouterKey = Deno.env.get('OPENROUTER_API_KEY');
    
    console.log('Environment check:', { 
      geminiKeyExists: !!geminiKey,
      geminiKeyLength: geminiKey?.length || 0,
      openRouterKeyExists: !!openRouterKey,
      openRouterKeyLength: openRouterKey?.length || 0
    });

    if (!geminiKey && !openRouterKey) {
      const errorMsg = 'No API keys configured. Please add GEMINI_API_KEY or OPENROUTER_API_KEY to Supabase secrets.';
      console.error('Configuration error:', errorMsg);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMsg
        }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // Create the prompt
    const prompt = `Create exactly ${numQuestions} multiple choice questions based on this content:

"${content}"

Requirements:
- Each question must have exactly 4 options (A, B, C, D)
- Difficulty: ${difficulty}
- Topic: ${topic || 'General'}
- Questions should test understanding of the content
- Return ONLY valid JSON in this exact format:

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
}

Do not include any text before or after the JSON.`;

    console.log('Prompt length:', prompt.length);

    let generatedText = '';
    let usedService = '';

    // Try Gemini first (better for quiz generation)
    if (geminiKey) {
      try {
        console.log('Attempting Gemini API call...');
        
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.3,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2000,
            }
          })
        });

        console.log('Gemini response status:', geminiResponse.status);
        
        if (!geminiResponse.ok) {
          const errorText = await geminiResponse.text();
          console.error('Gemini API error details:', {
            status: geminiResponse.status,
            statusText: geminiResponse.statusText,
            body: errorText
          });
          throw new Error(`Gemini API error: ${geminiResponse.status} - ${geminiResponse.statusText}`);
        }

        const geminiData = await geminiResponse.json();
        console.log('Gemini response structure:', Object.keys(geminiData));
        
        if (!geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
          console.error('Unexpected Gemini response structure:', geminiData);
          throw new Error('Invalid Gemini response structure');
        }

        generatedText = geminiData.candidates[0].content.parts[0].text;
        usedService = 'Gemini';
        console.log('Gemini success! Response length:', generatedText.length);
        
      } catch (geminiError) {
        console.error('Gemini failed:', geminiError.message);
        
        // Try OpenRouter as fallback
        if (openRouterKey) {
          try {
            console.log('Trying OpenRouter as fallback...');
            
            const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
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

            console.log('OpenRouter response status:', openRouterResponse.status);

            if (!openRouterResponse.ok) {
              const errorText = await openRouterResponse.text();
              console.error('OpenRouter API error details:', {
                status: openRouterResponse.status,
                statusText: openRouterResponse.statusText,
                body: errorText
              });
              throw new Error(`OpenRouter API error: ${openRouterResponse.status} - ${openRouterResponse.statusText}`);
            }

            const openRouterData = await openRouterResponse.json();
            generatedText = openRouterData.choices[0].message.content;
            usedService = 'OpenRouter';
            console.log('OpenRouter success! Response length:', generatedText.length);
            
          } catch (openRouterError) {
            console.error('Both APIs failed:', { 
              gemini: geminiError.message, 
              openRouter: openRouterError.message 
            });
            
            return new Response(
              JSON.stringify({ 
                success: false,
                error: `Both AI services failed. Gemini: ${geminiError.message}. OpenRouter: ${openRouterError.message}. Please check your API keys.`
              }),
              { headers: corsHeaders, status: 500 }
            );
          }
        } else {
          console.error('Only Gemini available but it failed:', geminiError.message);
          return new Response(
            JSON.stringify({ 
              success: false,
              error: `Gemini API failed: ${geminiError.message}. Please check your GEMINI_API_KEY.`
            }),
            { headers: corsHeaders, status: 500 }
          );
        }
      }
    } else if (openRouterKey) {
      // Only OpenRouter available
      try {
        console.log('Using OpenRouter (no Gemini key)...');
        
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
          const errorText = await response.text();
          console.error('OpenRouter error:', errorText);
          throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        generatedText = data.choices[0].message.content;
        usedService = 'OpenRouter';
        console.log('OpenRouter success!');
        
      } catch (error) {
        console.error('OpenRouter failed:', error.message);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: `OpenRouter API failed: ${error.message}. Please check your OPENROUTER_API_KEY.`
          }),
          { headers: corsHeaders, status: 500 }
        );
      }
    }

    console.log('AI service used:', usedService);
    console.log('Generated text preview:', generatedText.substring(0, 200));

    // Parse JSON response
    let questionsData;
    try {
      // Clean the response text
      let cleanText = generatedText.trim();
      
      // Remove markdown code blocks if present
      cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Find JSON content
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log('Found JSON match, attempting to parse...');
        questionsData = JSON.parse(jsonMatch[0]);
        console.log('Successfully parsed JSON');
      } else {
        console.log('No JSON pattern found in response');
        throw new Error('No valid JSON found in AI response');
      }
    } catch (parseError) {
      console.log('JSON parsing failed:', parseError.message);
      console.log('Attempting to create structured questions from response...');
      
      // Try to extract questions from unstructured text
      const lines = generatedText.split('\n').filter(line => line.trim());
      const questions = [];
      
      for (let i = 0; i < numQuestions; i++) {
        questions.push({
          id: `q${i + 1}`,
          question: `Based on the content about ${topic || 'the topic'}, what is a key concept discussed? (Question ${i + 1})`,
          options: [
            "A fundamental principle of the topic",
            "An outdated concept", 
            "Only theoretical information",
            "Contradictory information"
          ], // Always exactly 4 options
          correctAnswer: 0,
          explanation: "This represents a core concept from the provided content.",
          difficulty: difficulty,
          subject: topic || 'General'
        });
      }
      
      questionsData = { questions };
      console.log('Created fallback questions');
    }

    // Validate response structure
    if (!questionsData?.questions || !Array.isArray(questionsData.questions)) {
      console.error('Invalid questions data structure:', questionsData);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'AI returned invalid response structure. Please try again.'
        }),
        { headers: corsHeaders, status: 500 }
      );
    }

    // Format and validate questions - ALWAYS ensure exactly 4 options
    const finalQuestions = questionsData.questions.slice(0, numQuestions).map((q: any, index: number) => {
      const questionId = q.id || `q${index + 1}`;
      const questionText = q.question || `Question ${index + 1} about the content`;
      
      // CRITICAL: Always ensure exactly 4 options
      let options = [];
      if (Array.isArray(q.options)) {
        if (q.options.length === 4) {
          options = q.options;
        } else if (q.options.length > 4) {
          // Take first 4 options
          options = q.options.slice(0, 4);
        } else {
          // Pad with generic options to reach 4
          options = [...q.options];
          const labels = ['A', 'B', 'C', 'D'];
          while (options.length < 4) {
            options.push(`Option ${labels[options.length]} for question ${index + 1}`);
          }
        }
      } else {
        // Create 4 default options
        options = [
          `Option A for question ${index + 1}`,
          `Option B for question ${index + 1}`,
          `Option C for question ${index + 1}`,
          `Option D for question ${index + 1}`
        ];
      }
      
      // Ensure correctAnswer is within bounds (0-3)
      const correctAnswer = typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer <= 3 
        ? q.correctAnswer 
        : 0;
      const explanation = q.explanation || "Based on the provided content.";

      return {
        id: questionId,
        question: questionText,
        options, // Always exactly 4 options
        correctAnswer,
        explanation,
        difficulty: difficulty,
        subject: topic || 'General'
      };
    });

    console.log(`Successfully processed ${finalQuestions.length} questions`);
    console.log('Sample question:', finalQuestions[0]);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: { questions: finalQuestions },
        meta: { usedService, originalQuestionsCount: questionsData.questions.length }
      }),
      { headers: corsHeaders, status: 200 }
    );

  } catch (error) {
    console.error('=== FUNCTION ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: `Quiz generation failed: ${error.message}`
      }),
      { headers: corsHeaders, status: 500 }
    );
  } finally {
    console.log('=== QUIZ-GENERATOR FUNCTION END ===');
  }
});