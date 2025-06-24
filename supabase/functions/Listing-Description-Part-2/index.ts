import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

async function generateMLSDescription(propertyDetails: any) {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You're an expert real estate storyteller, crafting listings that feel personal and genuine—never salesy.`
        },
        {
          role: 'user',
          content: `Write an MLS listing that:
- Opens with a captivating, visual hook—like describing the feeling when you first step inside.
- Highlights key property features naturally woven into a short, engaging narrative.
- Includes subtle references to local lifestyle, neighborhood charm, and community vibe.
- Uses relatable language (no jargon or buzzwords).
- Ends by gently encouraging curiosity, compelling the reader to schedule a viewing.
Length: About 150–200 words, warm and authentic.

Property Details:
Title: ${propertyDetails.title}
Address: ${propertyDetails.address}
Price: ${propertyDetails.price}
Unique Features: ${propertyDetails.features}
Neighborhood highlights: ${propertyDetails.highlights.join(', ')}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'Unable to generate MLS description.';
}

async function generateSocialMediaContent(propertyDetails: any, platform: string) {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) throw new Error('OpenAI API key not configured');

  // —— NEW ENHANCED PLATFORM PROMPTS ——  
  const platformPrompts: Record<string, string> = {
    facebook: `
Imagine you're a popular local Realtor posting about a home you genuinely love to your Facebook followers. Write a short, friendly post:
- Conversational tone—like you're personally recommending to friends
- One standout anecdote or feature
- 40–70 words, quick to read and share
- Max one casual emoji
- CTA: "Drop me a DM to see it in person!"

Property:
• ${propertyDetails.title}
• ${propertyDetails.features.split(',')[0]}
• ${propertyDetails.price}
`.trim(),
    instagram: `
You're a savvy real estate influencer on Instagram. Craft an authentic caption:
- Striking visual hook
- 2–3 punchy highlights (bullet points or short lines)
- Effortlessly cool, zero sales pitch
- CTA: "Shoot me a DM to check it out 🔥"
- 3–4 hyper-relevant hashtags
- Max one emoji

Property:
• ${propertyDetails.title}
• ${propertyDetails.features.split(',').slice(0, 3).join(', ')}
• ${propertyDetails.price}
`.trim(),
    linkedin: `
You're a credible real estate professional on LinkedIn. Write 100–150 words for investors:
- Immediate investment appeal (ROI, growth stat)
- 1–2 crisp market/economic numbers
- Feature highlights as investor benefits
- Professional tone, no fluff
- CTA: "Message me to discuss the financials"

Property:
• ${propertyDetails.title}
• ${propertyDetails.description}
• Investment highlights: ${propertyDetails.highlights.filter((h: string) => h.toLowerCase().includes('investment') || h.toLowerCase().includes('roi')).join(', ')}
`.trim()
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a social media marketing expert specializing in real estate. Create platform-specific content that drives engagement and leads.'
        },
        {
          role: 'user',
          content: platformPrompts[platform]
        }
      ],
      temperature: 0.7,
      max_tokens: 400
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || `Unable to generate ${platform} content.`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }

  try {
    console.log('Starting listing generation request...');
    
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // 🔥 KEY FIX: Use SERVICE_ROLE_KEY to bypass RLS
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify the user is authenticated
    const token = authHeader.replace('Bearer ', '');
    console.log('Token length:', token.length);

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    console.log('User lookup result:', {
      user: !!user,
      error: userError?.message
    });

    if (userError || !user) {
      console.error('Authentication failed:', userError);
      throw new Error('Invalid authentication token');
    }

    console.log('User authenticated:', user.email);

    // Parse the request body
    const { propertyDetails } = await req.json();
    console.log('Property details received for:', propertyDetails?.title);

    if (!propertyDetails) {
      throw new Error('Property details are required');
    }

    console.log('Generating all content...');

    // Generate all content in parallel for better performance
    const [mls, facebook, instagram, linkedin] = await Promise.all([
      generateMLSDescription(propertyDetails),
      generateSocialMediaContent(propertyDetails, 'facebook'),
      generateSocialMediaContent(propertyDetails, 'instagram'),
      generateSocialMediaContent(propertyDetails, 'linkedin')
    ]);

    console.log('Saving to database...');

    // Save the listing to the database (using SERVICE_ROLE_KEY bypasses RLS)
    const { error: insertError } = await supabaseClient.from('listings').insert({
      user_id: user.id,
      title: propertyDetails.title,
      property_details: propertyDetails,
      mls_description: mls,
      facebook_content: facebook,
      instagram_content: instagram,
      linkedin_content: linkedin,
      created_at: new Date().toISOString()
    });

    if (insertError) {
      console.error('Error saving listing:', insertError);
      // Don't throw here - still return the generated content even if saving fails
    } else {
      console.log('Listing saved successfully');
    }

    console.log('Listing generation completed successfully');

    return new Response(JSON.stringify({
      mls,
      facebook,
      instagram,
      linkedin
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });

  } catch (error: any) {
    console.error('Error in listing generation:', error);
    return new Response(JSON.stringify({
      error: 'Failed to generate listing content',
      details: error.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
}); 