import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // ----- CORS pre-flight -----
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // ----- Auth -----
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')  ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) throw new Error('Invalid authentication token');

    // ----- Body -----
    const { address, city, state, zipCode } = await req.json();
    if (!address || !city || !state) throw new Error('Address, city, and state are required');

    // ----- Perplexity API -----
    const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!perplexityKey) throw new Error('Perplexity API key not configured');

    /* ------------------------------------------------------------------ *
     *  PROMPT – RETURNS SAME JSON SHAPE YOUR UI EXPECTS + PLATFORM DATA  *
     * ------------------------------------------------------------------ */
    const expertPrompt = `
PERSONA: You are Sarah Chen, a top-performing luxury real-estate analyst with 25+ years' experience and $500M+ closed volume.

MISSION: Produce an expert analysis for ${address}, ${city}, ${state}${zipCode ? ` (${zipCode})` : ''}.

PLATFORMS TO ANALYZE (in this order): Zillow → Redfin → Trulia  
For each, pull estimate, beds, baths, sq ft, year built, lot size, last sale.  
Then reconcile discrepancies (e.g., "Redfin is $12 k higher due to larger recorded sq ft").  
Create a compromise range.

CRITICAL RULES  
- No "contact agent" or filler.  
- Must include marketAnalysis and keyFeatures like previous version.  
- Be data-driven; cite platform facts when possible.

RETURN **ONLY** this JSON:

{
  "propertyDetails": {
    "estimatedPrice": "<compromise range>",
    "zillowEstimate": "<number or 'NA'>",
    "redfinEstimate": "<number or 'NA'>",
    "truliaEstimate": "<number or 'NA'>",
    "bedrooms": "<#>",
    "bathrooms": "<#>",
    "squareFeet": "<#>",
    "yearBuilt": "<year or 'NA'>",
    "lotSize": "<size or 'NA'>",
    "propertyType": "<Single Family / Townhouse / Condo / etc.>"
  },
  "marketAnalysis": "<3-4 sentences on trends, demand drivers, competitive advantages>",
  "keyFeatures": "<2-4 bullet-style features>",
  "neighborhoodHighlights": [
    "<schools>", "<employers>", "<amenities>", "<transport>", "<parks>", "<safety>"
  ],
  "areasToHighlight": [
    "<investment angle>", "<target buyer>", "<unique selling points>", "<timing>", "<lifestyle>"
  ]
}
`;

    const llmRes = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${perplexityKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-reasoning',
        temperature: 0.2,
        max_tokens: 3000,
        messages: [
          {
            role: 'system',
            content:
              'You are Sarah Chen, an elite real-estate analyst. Provide cross-referenced pricing from Zillow, Redfin, Trulia plus market analysis and key features in the exact JSON schema requested.',
          },
          { role: 'user', content: expertPrompt },
        ],
      }),
    });

    if (!llmRes.ok) throw new Error(`Perplexity API ${llmRes.status}: ${await llmRes.text()}`);

    const llmJSON = await llmRes.json();
    let aiText = llmJSON.choices[0]?.message?.content?.trim() ?? '';

    // ----- Strip markdown fences if present -----
    if (aiText.startsWith('```')) aiText = aiText.replace(/```[a-z]*\s*/g, '').replace(/```$/, '');

    // ----- Parse JSON -----
    let parsed;
    try {
      parsed = JSON.parse(aiText);
    } catch (e) {
      throw new Error('Failed to parse JSON from LLM');
    }

    /* ------------------------------------------------------------------ *
     *  SHAPE RESPONSE TO MATCH ORIGINAL FRONT-END INTERFACE              *
     * ------------------------------------------------------------------ */
    const out = {
      estimatedPrice: parsed.propertyDetails?.estimatedPrice,
      bedrooms:       parsed.propertyDetails?.bedrooms,
      bathrooms:      parsed.propertyDetails?.bathrooms,
      squareFeet:     parsed.propertyDetails?.squareFeet,
      yearBuilt:      parsed.propertyDetails?.yearBuilt,
      propertyType:   parsed.propertyDetails?.propertyType,
      keyFeatures:    parsed.keyFeatures,
      marketAnalysis: parsed.marketAnalysis,
      neighborhoodHighlights: parsed.neighborhoodHighlights,
      areasToHighlight:       parsed.areasToHighlight,
      /*  Pass through raw platform numbers in case you need them later  */
      zillowEstimate:  parsed.propertyDetails?.zillowEstimate,
      redfinEstimate:  parsed.propertyDetails?.redfinEstimate,
      truliaEstimate:  parsed.propertyDetails?.truliaEstimate,
      lotSize:         parsed.propertyDetails?.lotSize,
    };

    return new Response(JSON.stringify(out), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: 'Failed to research property', details: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    );
  }
}); 