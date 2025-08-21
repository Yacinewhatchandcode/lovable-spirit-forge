import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://lovable.dev',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history = [], excludeIds = [] } = await req.json();

    // Validate inputs
    if (!message || typeof message !== 'string' || message.length > 2000) {
      return new Response(
        JSON.stringify({ error: 'Invalid message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate excludeIds are UUIDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (excludeIds.some((id: any) => typeof id !== 'string' || !uuidRegex.test(id))) {
      return new Response(
        JSON.stringify({ error: 'Invalid excludeIds format' }),
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

    // Advanced semantic search for relevant Hidden Words
    let relevantHiddenWord: any = null;
    try {
      // 1) Try direct phrase match first
      let directQuery = supabase
        .from('hidden_words')
        .select('*')
        .ilike('text', `%${message}%`)
        .limit(1);

      if (excludeIds.length > 0) {
        const inList = `(${excludeIds.map((id: string) => `"${id}"`).join(',')})`;
        // @ts-ignore - postgrest filter
        directQuery = (directQuery as any).not('id', 'in', inList);
      }
      const directMatch = await directQuery;

      if (directMatch.data && directMatch.data.length > 0) {
        relevantHiddenWord = directMatch.data[0];
      } else {
        // 2) Build richer semantic terms from message
        const lowercaseMessage = message.toLowerCase();
        const baseTerms = Array.from(new Set(
          lowercaseMessage
            .replace(/[^a-z0-9\s'”\-]+/g, ' ')
            .split(/\s+/)
            .filter(w => w.length >= 3 && ![
              'the','and','for','with','that','this','have','from','your','you','are','but','not','was','were','has','had','his','her','she','him','our','their','them','who','what','when','where','why','how','can','will','shall','into','unto','upon','over','under','between','about','again','once','only'
            ].includes(w))
        ));

        // Add simple concept expansions
        const expansions: Record<string, string[]> = {
          love: ['beloved','heart','affection','devotion','adoration','lover','loving'],
          justice: ['fair','righteous','equity','right'],
          peace: ['calm','tranquil','serenity','quiet','rest'],
          soul: ['spirit','spiritual','essence','heart'],
          god: ['divine','lord','creator','beloved'],
          wisdom: ['knowledge','understand','understanding','know'],
          truth: ['reality','true','verity'],
          death: ['die','eternal','immortal','mortality'],
          friend: ['companion','brother','beloved'],
          world: ['earth','earthly','material','dust'],
        };
        const expanded = new Set<string>(baseTerms);
        for (const t of baseTerms) {
          if (expansions[t]) expansions[t].forEach(x => expanded.add(x));
        }
        const searchTerms = Array.from(expanded);

        if (searchTerms.length > 0) {
          const orConditions: string[] = [];
          for (const term of searchTerms) {
            const like = `%${term}%`;
            orConditions.push(`text.ilike.${like}`, `addressee.ilike.${like}`, `section_title.ilike.${like}`);
          }

          let semQuery = supabase
            .from('hidden_words')
            .select('*')
            .or(orConditions.join(','))
            .limit(50);

          if (excludeIds.length > 0) {
            const inList = `(${excludeIds.map((id: string) => `"${id}"`).join(',')})`;
            // @ts-ignore
            semQuery = (semQuery as any).not('id', 'in', inList);
          }

          const { data: semanticMatches } = await semQuery;

          if (semanticMatches && semanticMatches.length > 0) {
            // Rank candidates client-side by simple term frequency score
            const scored = semanticMatches.map((hw: any) => {
              const hay = `${hw.text} ${hw.addressee} ${hw.section_title ?? ''}`.toLowerCase();
              let score = 0;
              for (const t of searchTerms) {
                if (hay.includes(t)) score += 1;
              }
              // Prefer exact addressee/title hits slightly
              if (hw.addressee && searchTerms.some(t => hw.addressee.toLowerCase().includes(t))) score += 1.5;
              return { hw, score };
            });
            scored.sort((a: any, b: any) => b.score - a.score);
            relevantHiddenWord = scored[0].hw;
          }
        }

        // 3) Final fallback to a non-repeating random quote
        if (!relevantHiddenWord) {
          let fallbackQuery = supabase
            .from('hidden_words')
            .select('*')
            .limit(50);
          if (excludeIds.length > 0) {
            const inList = `(${excludeIds.map((id: string) => `"${id}"`).join(',')})`;
            // @ts-ignore
            fallbackQuery = (fallbackQuery as any).not('id', 'in', inList);
          }
          const { data: randomQuotes } = await fallbackQuery;
          if (randomQuotes && randomQuotes.length > 0) {
            const randomIndex = Math.floor(Math.random() * randomQuotes.length);
            relevantHiddenWord = randomQuotes[randomIndex];
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
            content: `You are a wise spiritual guide offering compassionate guidance and insights based on Bahá'í teachings and the Hidden Words.\n\n${relevantHiddenWord ? `Do not quote the full passage verbatim. Instead, you may gently reference that a relevant passage exists; the UI will present it after your answer. Passage context: (${relevantHiddenWord.addressee}, ${relevantHiddenWord.part} #${relevantHiddenWord.number}).` : ''}\n\nKeep your response thoughtful, empathetic, concise, and meaningful.`
          },
          ...history,
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