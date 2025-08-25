import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

serve(async (req) => {
  console.log('=== GEMINI-SEARCH FUNCTION START ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query, type, text } = await req.json();
    console.log('Request data:', { 
      query: query?.substring(0, 100), 
      type, 
      textLength: text?.length 
    });

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
      console.error('ERROR:', errorMsg);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMsg
        }),
        { headers: corsHeaders, status: 400 }
      );
    }

    let content = '';
    let usedService = '';

    // Try Gemini first (more reliable for this use case)
    if (geminiKey) {
      try {
        console.log('Attempting Gemini API call...');
        
        let prompt = '';
        if (type === 'search') {
          prompt = `Provide comprehensive information about: "${query}". Include key facts, concepts, applications, and recent developments. Keep response under 1500 characters.`;
        } else if (type === 'analyze') {
          prompt = `Analyze this text comprehensively: "${text}". Provide summary, key points, sentiment, and topics. Keep response under 1500 characters.`;
        } else {
          throw new Error(`Invalid request type: ${type}`);
        }

        console.log('Gemini prompt length:', prompt.length);

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
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1000,
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

        content = geminiData.candidates[0].content.parts[0].text;
        usedService = 'Gemini';
        console.log('Gemini success! Content length:', content.length);
        
      } catch (geminiError) {
        console.error('Gemini failed:', geminiError.message);
        
        // Try OpenRouter as fallback
        if (openRouterKey) {
          try {
            console.log('Trying OpenRouter as fallback...');
            
            let prompt = '';
            if (type === 'search') {
              prompt = `Provide comprehensive information about: "${query}". Include key facts, concepts, applications, and recent developments.`;
            } else if (type === 'analyze') {
              prompt = `Analyze this text comprehensively: "${text}". Provide summary, key points, sentiment, and topics.`;
            }

            const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
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
                max_tokens: 1000
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
            content = openRouterData.choices[0].message.content;
            usedService = 'OpenRouter';
            console.log('OpenRouter success! Content length:', content.length);
            
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
        
        let prompt = '';
        if (type === 'search') {
          prompt = `Provide comprehensive information about: "${query}". Include key facts, concepts, applications, and recent developments.`;
        } else if (type === 'analyze') {
          prompt = `Analyze this text comprehensively: "${text}". Provide summary, key points, sentiment, and topics.`;
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
            max_tokens: 1000
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('OpenRouter error:', errorText);
          throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        content = data.choices[0].message.content;
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

    // Process the response based on type
    if (type === 'search') {
      const searchResults = [
        {
          title: `${query} - Wikipedia`,
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(query.replace(/\s+/g, '_'))}`,
          content: content.substring(0, 150) + '...',
          favicon: '📚'
        },
        {
          title: `${query} - GitHub`,
          url: `https://github.com/search?q=${encodeURIComponent(query)}`,
          content: content.substring(150, 300) + '...',
          favicon: '📖'
        },
        {
          title: `${query} - Stack Overflow`,
          url: `https://stackoverflow.com/search?q=${encodeURIComponent(query)}`,
          content: content.substring(300, 450) + '...',
          favicon: '💬'
        },
        {
          title: `${query} - YouTube`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
          content: content.substring(450, 600) + '...',
          favicon: '📺'
        },
        {
          title: `${query} - Reddit`,
          url: `https://www.reddit.com/search/?q=${encodeURIComponent(query)}`,
          content: content.substring(600, 750) + '...',
          favicon: '🗨️'
        }
      ];

      console.log('Returning search results, count:', searchResults.length);
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: { results: searchResults },
          meta: { usedService }
        }),
        { headers: corsHeaders, status: 200 }
      );
    }

    if (type === 'analyze') {
      const words = text.split(/\s+/).filter(word => word.length > 0);
      const wordCount = words.length;
      const readingTime = Math.ceil(wordCount / 200);
      
      // Extract key points from the AI response
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
      const keyPoints = sentences.slice(0, 5).map(point => point.trim());
      
      const analysisData = {
        summary: content.substring(0, 300) + (content.length > 300 ? '...' : ''),
        keyPoints,
        sentiment: 'neutral',
        topics: ['Analysis', 'Research', 'Content'],
        wordCount,
        readingTime
      };

      console.log('Returning analysis results');
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: { analysis: analysisData },
          meta: { usedService }
        }),
        { headers: corsHeaders, status: 200 }
      );
    }

    console.error('Invalid request type:', type);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Invalid request type: ${type}. Expected 'search' or 'analyze'.` 
      }),
      { headers: corsHeaders, status: 400 }
    );

  } catch (error) {
    console.error('=== FUNCTION ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: `Function error: ${error.message}`
      }),
      { headers: corsHeaders, status: 500 }
    );
  } finally {
    console.log('=== GEMINI-SEARCH FUNCTION END ===');
  }
});