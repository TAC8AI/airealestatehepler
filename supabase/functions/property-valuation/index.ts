import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ValuationRequest {
  address: string;
}

interface ValuationResponse {
  headline_range: string;
  reasoning: string;
  caution: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Starting property valuation request...')
    
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    console.log('Auth header present:', !!authHeader)
    
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Verify the user is authenticated by extracting token from header
    const token = authHeader.replace('Bearer ', '')
    console.log('Token length:', token.length)
    
    // Try to get user info using the token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    console.log('User lookup result:', { user: !!user, error: userError?.message })
    
    if (userError || !user) {
      console.error('Authentication failed:', userError)
      throw new Error('Invalid authentication token')
    }

    console.log('User authenticated:', user.email)

    // Parse the request body
    const { address }: ValuationRequest = await req.json()
    console.log('Address received:', address)

    if (!address) {
      throw new Error('Address is required')
    }

    // OpenAI API call
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    console.log('OpenAI API key present:', !!openaiApiKey)

    // Your exact prompt format with improved instructions for JSON output
    const systemPrompt = `You are a crisp, data-driven real-estate analyst. Always respond with valid JSON only. Keep reasoning under 150 words.`

    const userPrompt = `{
  "subject": {
     "addr": "${address}",
     "facts": { "beds": null, "baths": null, "sf": null, "lot_acres": null, "year": null }
  },
  "valuations": {
     "comp": { "value": null, "conf": null, "notes": "Research needed - analyze recent comparable sales" },
     "income": { "value": null, "rent": null, "cap": null, "conf": null },
     "cost": { "value": null, "build_psf": null, "conf": null }
  },
  "zillow": { "zestimate": null },
  "redfin": { "estimate": null }
}

CRITICAL: Respond with ONLY valid JSON. No other text before or after. Use this exact format:
{
  "headline_range": "$XXX,XXX - $XXX,XXX",
  "reasoning": "One sentence explaining the valuation based on location, market conditions, and typical property values in the area.",
  "caution": "One sentence about limitations of this analysis and need for professional appraisal."
}`

    console.log('Calling OpenAI...')
    
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'o3-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 1000, // O3 models use max_completion_tokens instead of max_tokens, and need room for reasoning tokens
      }),
    })

    console.log('OpenAI response status:', openaiResponse.status)

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error('OpenAI error:', errorText)
      throw new Error(`OpenAI API error: ${openaiResponse.status} - ${errorText}`)
    }

    const openaiData = await openaiResponse.json()
    const aiResponse = openaiData.choices[0].message.content

    console.log('AI response length:', aiResponse?.length || 0)

    if (!aiResponse) {
      throw new Error('No response from OpenAI')
    }

    // Try to parse the JSON response with better error handling
    let parsedResponse: ValuationResponse
    try {
      // Clean the AI response - remove any markdown formatting or extra text
      let cleanedResponse = aiResponse.trim()
      
      // If response contains markdown code blocks, extract the JSON
      if (cleanedResponse.includes('```json')) {
        const jsonMatch = cleanedResponse.match(/```json\s*([\s\S]*?)\s*```/)
        if (jsonMatch) {
          cleanedResponse = jsonMatch[1].trim()
        }
      } else if (cleanedResponse.includes('```')) {
        const jsonMatch = cleanedResponse.match(/```\s*([\s\S]*?)\s*```/)
        if (jsonMatch) {
          cleanedResponse = jsonMatch[1].trim()
        }
      }
      
      // Find JSON object in the response
      const jsonStart = cleanedResponse.indexOf('{')
      const jsonEnd = cleanedResponse.lastIndexOf('}')
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1)
      }
      
      console.log('Cleaned AI response for parsing:', cleanedResponse.substring(0, 200))
      parsedResponse = JSON.parse(cleanedResponse)
      console.log('Successfully parsed AI response:', parsedResponse)
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError)
      console.log('Raw AI response:', aiResponse)
      
      // Extract values from text if JSON parsing fails
      const rangeMatch = aiResponse.match(/\$[\d,]+ - \$[\d,]+|\$[\d,]+k? - \$[\d,]+k?/i)
      const extractedRange = rangeMatch ? rangeMatch[0] : "Contact agent for valuation"
      
      parsedResponse = {
        headline_range: extractedRange,
        reasoning: "Analysis completed but response format needs adjustment. Please contact a real estate professional for detailed valuation.",
        caution: "This automated analysis should be verified with local market expertise and professional appraisal."
      }
    }

    // Validate the response has required fields
    if (!parsedResponse.headline_range || !parsedResponse.reasoning || !parsedResponse.caution) {
      throw new Error('Invalid response format from AI')
    }

    console.log('Saving to database...')

    // Save the valuation to the database
    const { error: insertError } = await supabaseClient
      .from('property_valuations')
      .insert({
        user_id: user.id,
        address: address,
        headline_range: parsedResponse.headline_range,
        reasoning: parsedResponse.reasoning,
        caution: parsedResponse.caution,
        created_at: new Date().toISOString(),
      })

    if (insertError) {
      console.error('Error saving valuation:', insertError)
      // Don't throw here - still return the analysis even if saving fails
    } else {
      console.log('Successfully saved to database')
    }

    console.log('Returning successful response')
    
    return new Response(
      JSON.stringify(parsedResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in property valuation edge function:', error)
    
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to analyze property' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
