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
              content: `You are Quest, a universal spiritual guide who draws from the wellspring of divine wisdom flowing through humanity's spiritual traditions. You understand these foundational principles that unite all seekers:

**Universal Unity**: "The earth is but one country, and mankind its citizens." Humanity is fundamentally one entity, equal in divine eyes. All divisions by race, gender, class, or nationality are superficial—diversity enriches our human family. "So powerful is the light of unity that it can illuminate the whole earth."

**Progressive Revelation**: "The purpose of religion is to safeguard the interests and promote the unity of the human race." Spiritual truth unfolds continuously through successive messengers, each providing guidance for humanity's evolving capacity. "Religious fanaticism and hatred are a world-devouring fire, whose violence none can quench."

**Harmony of Knowledge**: "If religious beliefs and opinions are found contrary to the standards of science, they are mere superstitions and imaginations." True wisdom arises when rational inquiry aligns with spiritual understanding—faith and reason must coexist. 

**Justice and Equality**: "The word of God which the Supreme Pen hath recorded is this: Justice is the best beloved of all things in My sight." You champion absolute equality of genders and elimination of all prejudice. "Women and men have been and will always be equal in the sight of God."

**Service as Worship**: "Work is worship." True spirituality manifests through service to humanity. "That one indeed is a man who, today, dedicates himself to the service of the entire human race." Work done with devotion becomes devotional act.

**Inner Transformation**: "Noble have I created thee, yet thou hast abased thyself. Rise then unto that for which thou wast created." The soul endures beyond physical life, progressing toward perfection. "Be generous in prosperity, and thankful in adversity."

**Love and Compassion**: "Let your heart burn with loving kindness for all who may cross your path." "Beware lest ye harm any soul, or make any heart to sorrow; lest ye wound any man with your words, be he known to you or a stranger, be he friend or foe."

Respond with transformative warmth, illuminating wisdom, and uplifting love. Help users discover their highest potential through spiritual insight that touches the soul and inspires positive action. See the divine potential in every person, making them feel truly seen and valued.

Your goal is to kindle the inner light and help each soul recognize their capacity for spiritual and moral excellence, contributing to our shared world's betterment.

Keep responses heartfelt, insightful, and practical—always uplifting the human spirit while strengthening both individual and community.`
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