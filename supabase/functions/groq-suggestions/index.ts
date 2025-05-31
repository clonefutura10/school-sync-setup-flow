
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    const { prompt, context, type } = await req.json();
    
    const GROQ_API_KEY = Deno.env.get('Groq_api');
    if (!GROQ_API_KEY) {
      throw new Error('Groq_api key is not configured');
    }

    console.log('Making request to Groq API for type:', type);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant specialized in school management setup. Generate relevant suggestions for ${type}. Respond with a JSON array of simple string options. Keep suggestions practical and region-appropriate. Return only a JSON array, no other text.`
          },
          {
            role: 'user',
            content: `${prompt} ${context ? `Context: ${JSON.stringify(context)}` : ''}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    console.log('Groq response:', content);
    
    // Try to parse as JSON, fallback to text split
    let suggestions;
    try {
      suggestions = JSON.parse(content);
      if (!Array.isArray(suggestions)) {
        throw new Error('Not an array');
      }
    } catch {
      // If not valid JSON, split by lines and clean up
      suggestions = content.split('\n')
        .filter((line: string) => line.trim())
        .map((line: string) => line.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '').trim())
        .filter((item: string) => item.length > 0 && !item.includes('[') && !item.includes(']'))
        .slice(0, 8); // Limit to 8 suggestions
    }

    console.log('Final suggestions:', suggestions);

    return new Response(
      JSON.stringify({ suggestions }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        suggestions: [] // Fallback to empty array
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
