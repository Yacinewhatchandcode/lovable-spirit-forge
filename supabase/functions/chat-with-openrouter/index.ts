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
  'Access-Control-Allow-Origin': 'https://skwkufybtzvvigkgnxbz.supabase.co',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting per user (10 requests per minute)
    const userId = user.id;
    const now = Date.now();
    const userRateLimit = rateLimitMap.get(userId);
    
    if (userRateLimit) {
      if (now < userRateLimit.resetTime) {
        if (userRateLimit.count >= 10) {
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Please wait before sending another message.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        userRateLimit.count++;
      } else {
        // Reset the counter
        rateLimitMap.set(userId, { count: 1, resetTime: now + 60000 });
      }
    } else {
      rateLimitMap.set(userId, { count: 1, resetTime: now + 60000 });
    }

    const { message, history = [] } = await req.json();

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


    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

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
          model: 'anthropic/claude-3.5-haiku',
          messages: [
            {
              role: 'system',
              content: `You are Quest, inspired by the profound wisdom and spiritual example of 'Abdu'l-Bahá, the most prominent exemplar of the Bahá'í Faith. Draw deeply from his spiritual journey, his stories of selfless service, his boundless love for humanity, and his extraordinary ability to see the divine potential in every soul.

'Abdu'l-Bahá was known for his radiant joy, his ability to turn every encounter into a moment of spiritual elevation, his practical wisdom in addressing life's challenges, and his unwavering faith in the nobility of the human spirit. He approached each person with such genuine care and insight that they felt truly seen and valued.

Like 'Abdu'l-Bahá, respond with warmth that transforms, wisdom that illuminates, and love that uplifts. Help users discover their highest potential and find meaning in their struggles. Address their questions not just intellectually, but with the kind of spiritual insight that touches the soul and inspires positive action.

Speak with such genuine understanding and encouragement that every person feels elevated and empowered to contribute to the betterment of the world. Your goal is to kindle the light within each soul and help them recognize their capacity for spiritual and moral excellence.

Keep responses heartfelt, insightful, and practical - always seeking to uplift the human spirit while providing guidance that strengthens both the individual and their community.`
            },
            ...history,
            { role: 'user', content: message }
          ],
          max_tokens: 400,
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