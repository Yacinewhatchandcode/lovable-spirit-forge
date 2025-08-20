import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    console.log('Received message:', message);

    if (!openRouterApiKey) {
      console.error('OpenRouter API key not found');
      return new Response(
        JSON.stringify({ error: 'OpenRouter API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Advanced semantic search for relevant Hidden Words
    let relevantHiddenWord = null;
    try {
      // First, try to find direct text matches for specific quotes
      const directMatch = await supabase
        .from('hidden_words')
        .select('*')
        .ilike('text', `%${message}%`)
        .limit(1);

      if (directMatch.data && directMatch.data.length > 0) {
        relevantHiddenWord = directMatch.data[0];
        console.log('Found direct text match:', relevantHiddenWord);
      } else {
        // If no direct match, do semantic search based on key concepts
        let searchTerms = [];
        const lowercaseMessage = message.toLowerCase();
        
        // Extract key spiritual concepts and map to relevant search terms
        if (lowercaseMessage.includes('love') || lowercaseMessage.includes('beloved') || lowercaseMessage.includes('heart')) {
          searchTerms = ['love', 'beloved', 'heart', 'affection'];
        } else if (lowercaseMessage.includes('justice') || lowercaseMessage.includes('fair') || lowercaseMessage.includes('right')) {
          searchTerms = ['justice', 'fair', 'righteous'];
        } else if (lowercaseMessage.includes('peace') || lowercaseMessage.includes('calm') || lowercaseMessage.includes('tranquil')) {
          searchTerms = ['peace', 'tranquil', 'serenity', 'calm'];
        } else if (lowercaseMessage.includes('soul') || lowercaseMessage.includes('spirit') || lowercaseMessage.includes('spiritual')) {
          searchTerms = ['soul', 'spirit', 'spiritual', 'essence'];
        } else if (lowercaseMessage.includes('god') || lowercaseMessage.includes('divine') || lowercaseMessage.includes('lord')) {
          searchTerms = ['God', 'divine', 'Lord', 'Creator'];
        } else if (lowercaseMessage.includes('wisdom') || lowercaseMessage.includes('knowledge') || lowercaseMessage.includes('understand')) {
          searchTerms = ['wisdom', 'knowledge', 'understand', 'know'];
        } else if (lowercaseMessage.includes('truth') || lowercaseMessage.includes('reality')) {
          searchTerms = ['truth', 'reality', 'true'];
        } else if (lowercaseMessage.includes('death') || lowercaseMessage.includes('die') || lowercaseMessage.includes('eternal')) {
          searchTerms = ['death', 'eternal', 'immortal', 'die'];
        } else if (lowercaseMessage.includes('friend') || lowercaseMessage.includes('companion')) {
          searchTerms = ['friend', 'companion', 'brother'];
        } else if (lowercaseMessage.includes('world') || lowercaseMessage.includes('earth') || lowercaseMessage.includes('material')) {
          searchTerms = ['world', 'earth', 'earthly', 'material'];
        }

        // If we have specific terms, search for them
        if (searchTerms.length > 0) {
          const semanticQuery = searchTerms.map(term => `text.ilike.%${term}%`).join(',');
          const { data: semanticMatches } = await supabase
            .from('hidden_words')
            .select('*')
            .or(semanticQuery)
            .limit(5);

          if (semanticMatches && semanticMatches.length > 0) {
            // Pick the most relevant one (could be improved with better ranking)
            relevantHiddenWord = semanticMatches[0];
            console.log('Found semantic match:', relevantHiddenWord);
          }
        }

        // Final fallback to a meaningful random quote
        if (!relevantHiddenWord) {
          const { data: randomQuotes } = await supabase
            .from('hidden_words')
            .select('*')
            .order('number')
            .limit(10);
          
          if (randomQuotes && randomQuotes.length > 0) {
            const randomIndex = Math.floor(Math.random() * randomQuotes.length);
            relevantHiddenWord = randomQuotes[randomIndex];
            console.log('Using meaningful random quote:', relevantHiddenWord);
          }
        }
      }
    } catch (dbError) {
      console.error('Error fetching Hidden Words:', dbError);
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lovable.dev',
        'X-Title': 'Spiritual Chat App',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b:free',
        messages: [
          {
            role: 'system',
            content: `You are a wise spiritual guide offering compassionate guidance and insights based on Bahá'í teachings and the Hidden Words. 

${relevantHiddenWord ? `Here is a relevant Hidden Words passage that relates to the user's question: "${relevantHiddenWord.text}" (${relevantHiddenWord.addressee}, ${relevantHiddenWord.part} #${relevantHiddenWord.number}). ` : ''}

When you provide spiritual guidance, naturally mention if there's a relevant Hidden Words passage by saying something like "This reminds me of a beautiful passage from the Hidden Words..." or "There's a profound quote from the Hidden Words that speaks to this..." 

Keep your response thoughtful, empathetic, and naturally flowing. Respond with empathy, wisdom, and gentle encouragement. Be concise but meaningful.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: `OpenRouter API error: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('OpenRouter response:', data);

    const aiResponse = data.choices?.[0]?.message?.content || 'I apologize, but I cannot provide a response at this moment. Please try again.';

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        hiddenWord: relevantHiddenWord 
      }),
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