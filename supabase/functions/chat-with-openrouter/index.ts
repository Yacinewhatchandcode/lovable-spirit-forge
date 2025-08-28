import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

// Rate limiting storage (in-memory for this function instance)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history = [], mode = 'insights', isAdmin = false } = await req.json();

    // Validate inputs
    if (!message || typeof message !== 'string' || message.length > 2000) {
      return new Response(
        JSON.stringify({ error: 'Invalid message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate history array length and structure
    if (!Array.isArray(history) || history.length > 20) {
      return new Response(
        JSON.stringify({ error: 'Invalid conversation history' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!openRouterApiKey) {
      console.error('OpenRouter API key not found');
      return new Response(
        JSON.stringify({ error: 'OpenRouter API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }


    // Web search for Bahá'í quotations in insights mode
    let searchResults = '';
    if (mode === 'insights') {
      try {
        // Try multiple search strategies for better results
        const searchStrategies = [
          `site:bahai.org "${message}" quotations`,
          `Bahá'í Faith "${message}" teachings writings`,
          `"Bahá'u'lláh" "${message}" quotations`,
          `Bahá'í principles "${message}" guidance`
        ];

        let combinedResults = [];

        for (const strategy of searchStrategies) {
          try {
            const searchResponse = await fetch(
              `https://html.duckduckgo.com/html/?q=${encodeURIComponent(strategy)}`,
              {
                method: 'GET',
                headers: {
                  'User-Agent': 'Mozilla/5.0 (compatible; BahaiSearchBot/1.0)'
                },
                signal: controller.signal,
              }
            );

            if (searchResponse.ok) {
              const html = await searchResponse.text();
              // Extract relevant text snippets from HTML (simplified parsing)
              const snippets = html.match(/<a[^>]*class="result__snippet"[^>]*>([^<]*)<\/a>/g) || [];
              const textSnippets = snippets.map(s => s.replace(/<[^>]*>/g, '')).filter(s => s.length > 20);

              if (textSnippets.length > 0) {
                combinedResults.push(...textSnippets.slice(0, 2));
              }
            }
          } catch (strategyError) {
            console.log(`Search strategy failed: ${strategy}`);
          }
        }

        if (combinedResults.length > 0) {
          searchResults = `Web search results for "${message}":\n${combinedResults.slice(0, 5).map((result, i) => `${i + 1}. ${result}`).join('\n')}`;
        } else {
          // Fallback to general search
          const fallbackResponse = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(`Bahá'í Faith ${message}`)}&format=json&no_html=1`, {
            signal: controller.signal,
          });

          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            if (fallbackData.AbstractText) {
              searchResults = `General search results for "${message}": ${fallbackData.AbstractText}`;
            }
          }
        }

        console.log('Search results compiled:', searchResults ? 'Found results' : 'No results found');
      } catch (searchError) {
        console.log('Web search failed, continuing without search results:', searchError.message);
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // Increased timeout for search

    let response: Response;
    try {
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://lovable.dev',
          'X-Title': 'Spiritual Chat App',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `You are a spiritual guide specializing in Bahá'í Faith teachings. Follow these rules:
— Keep language simple, kind, easy to understand.
— If the question cannot be answered from the Writings, respond with: There is no direct statement in the Writings on this matter.
${isAdmin ? '— Include source citations in square brackets [Source: Book Name, Page/Paragraph]' : '— Do not include citations, names, or sources in user-facing text. Do not use the word Bahá\'í anywhere.'}

When mode is "insights":
— Extract and present authentic Bahá'í quotations from the provided web search results.
— Return only passages from the Writings, at least two per topic, organized with markdown headings (###).
— Wrap every word from the Writings in bold markdown.
— Focus on finding genuine Bahá'í quotations about the user's query.
— If no relevant quotations are found in search results, search your knowledge for appropriate passages.
${isAdmin ? '— Include source citation in square brackets after each passage.' : '— Add one short literary line per topic wrapped in italics.'}

When mode is "perspective":
— Produce a short synthesis in clear sections using only the most recent Insights content in the conversation.
— Weave together the quotations from Insights into a coherent spiritual guidance.
— Do not include quotations or sources in the synthesis - only the wisdom and teachings.
— Focus on practical application and understanding of the spiritual principles.`
            },
            ...history,
            {
              role: 'user',
              content: `Mode: ${mode}. Admin: ${isAdmin}. User message: ${message}${searchResults ? '\n\nWeb Search Results:\n' + searchResults : ''}`
            }
          ],
          max_tokens: 1000,
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status);
      return new Response(
        JSON.stringify({ error: `OpenRouter API error: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'I apologize, but I cannot provide a response at this moment. Please try again.';

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chat-with-openrouter function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});