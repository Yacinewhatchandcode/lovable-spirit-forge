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

    // Search for relevant Hidden Words based on the user's message
    let relevantHiddenWord = null;
    try {
      const { data: hiddenWords, error } = await supabase
        .from('hidden_words')
        .select('*')
        .or(`text.ilike.%${message}%,addressee.ilike.%${message}%,section_title.ilike.%${message}%`)
        .limit(1);

      if (!error && hiddenWords && hiddenWords.length > 0) {
        relevantHiddenWord = hiddenWords[0];
        console.log('Found relevant Hidden Word:', relevantHiddenWord);
      } else {
        // If no specific matches, get a random one for general context
        const { data: randomWords } = await supabase
          .from('hidden_words')
          .select('*')
          .limit(1);
        
        if (randomWords && randomWords.length > 0) {
          relevantHiddenWord = randomWords[0];
          console.log('Using random Hidden Word:', relevantHiddenWord);
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
            content: 'You are a wise spiritual guide offering compassionate guidance and insights. Respond with empathy, wisdom, and gentle encouragement. Keep responses thoughtful but concise.'
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