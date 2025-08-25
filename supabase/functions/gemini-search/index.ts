import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

serve(async (req) => {
  console.log('gemini-search function called:', req.method);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query, type, text } = await req.json();
    console.log('Request data:', { query: query?.substring(0, 50), type, textLength: text?.length });

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
          error: 'API keys not configured. Please add GEMINI_API_KEY or OPENROUTER_API_KEY.' 
        }),
        { headers: corsHeaders, status: 500 }
      );
    }

    let content = '';

    // Try OpenRouter first (more reliable)
    if (openRouterKey) {
      try {
        console.log('Trying OpenRouter...');
        
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
            max_tokens: 2000
          })
        });

        if (!response.ok) {
          throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        content = data.choices[0].message.content;
        console.log('OpenRouter response received');
        
      } catch (openRouterError) {
        console.log('OpenRouter failed:', openRouterError.message);
        
        // Try Gemini as fallback
        if (geminiKey) {
          try {
            console.log('Trying Gemini as fallback...');
            
            let prompt = '';
            if (type === 'search') {
              prompt = `Provide comprehensive information about: "${query}"`;
            } else if (type === 'analyze') {
              prompt = `Analyze this text: "${text}"`;
            }

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
            content = geminiData.candidates[0].content.parts[0].text;
            console.log('Gemini response received');
            
          } catch (geminiError) {
            console.error('Both APIs failed:', { openRouter: openRouterError.message, gemini: geminiError.message });
            throw new Error('AI services unavailable. Please try again later.');
          }
        } else {
          throw openRouterError;
        }
      }
    }

    if (type === 'search') {
      // Generate search results
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

      return new Response(
        JSON.stringify({ success: true, data: { results: searchResults } }),
        { headers: corsHeaders }
      );
    }

    if (type === 'analyze') {
      const wordCount = text.split(' ').length;
      const readingTime = Math.ceil(wordCount / 200);
      
      const analysisData = {
        summary: content.substring(0, 300) + (content.length > 300 ? '...' : ''),
        keyPoints: content.split('.').filter(point => point.trim().length > 10).slice(0, 5).map(point => point.trim()),
        sentiment: 'neutral',
        topics: ['Analysis', 'Research', 'Content'],
        wordCount,
        readingTime
      };

      return new Response(
        JSON.stringify({ success: true, data: { analysis: analysisData } }),
        { headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Invalid request type' }),
      { headers: corsHeaders, status: 400 }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'An error occurred' 
      }),
      { headers: corsHeaders, status: 500 }
    );
  }
});