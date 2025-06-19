import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';

// Initialize OpenAI with Vision capabilities
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

// Contract type definitions
type ContractType = 'purchase' | 'listing' | 'lease';

// Contract analysis prompts for each type
const CONTRACT_PROMPTS = {
  purchase: `You are an expert real estate contract analyzer. Analyze this Purchase/Offer-to-Purchase agreement and extract the following key information in JSON format:

{
  "property_address": "Full property address",
  "purchase_price": "Dollar amount",
  "earnest_money": "Dollar amount",
  "closing_date": "Date in YYYY-MM-DD format",
  "buyer_name": "Full buyer name(s)",
  "seller_name": "Full seller name(s)",
  "financing_type": "Cash, Conventional, FHA, VA, etc.",
  "inspection_period": "Number of days",
  "appraisal_contingency": "Yes/No and details",
  "financing_contingency": "Yes/No and details",
  "key_deadlines": ["List of important dates"],
  "special_conditions": ["Any special terms or conditions"],
  "agent_info": {
    "buyer_agent": "Name and contact",
    "seller_agent": "Name and contact"
  }
}`,

  listing: `You are an expert real estate contract analyzer. Analyze this Listing Agreement and extract the following key information in JSON format:

{
  "property_address": "Full property address",
  "listing_price": "Dollar amount",
  "listing_period": "Start and end dates",
  "commission_rate": "Percentage",
  "seller_name": "Full seller name(s)",
  "listing_agent": "Agent name and contact",
  "property_type": "Single family, condo, etc.",
  "mls_info": "MLS details if mentioned",
  "marketing_terms": ["How property will be marketed"],
  "exclusions": ["Items excluded from sale"],
  "special_conditions": ["Any special terms"],
  "cancellation_terms": "How agreement can be cancelled"
}`,

  lease: `You are an expert real estate contract analyzer. Analyze this Lease/Rental Agreement and extract the following key information in JSON format:

{
  "property_address": "Full property address",
  "monthly_rent": "Dollar amount",
  "lease_term": "Duration and dates",
  "security_deposit": "Dollar amount",
  "tenant_name": "Full tenant name(s)",
  "landlord_name": "Full landlord name(s)",
  "utilities_included": ["List of included utilities"],
  "pet_policy": "Pet restrictions and fees",
  "maintenance_responsibilities": {
    "tenant": ["Tenant responsibilities"],
    "landlord": ["Landlord responsibilities"]
  },
  "rent_due_date": "Day of month",
  "late_fees": "Late fee structure",
  "renewal_terms": "Renewal options",
  "termination_conditions": ["How lease can be terminated"]
}`
};

export async function POST(request: NextRequest) {
  try {
    console.log('[PDF Analysis] Starting PDF contract analysis');
    
    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const contractType = formData.get('contractType') as ContractType;
    const fileName = formData.get('fileName') as string || file.name;

    if (!file) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }

    if (!contractType || !['purchase', 'listing', 'lease'].includes(contractType)) {
      return NextResponse.json({ error: 'Invalid contract type' }, { status: 400 });
    }

    console.log(`[PDF Analysis] Processing ${contractType} contract: ${fileName}`);
    console.log(`[PDF Analysis] File size: ${file.size} bytes`);

    // Convert PDF to base64 for Vision API
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    console.log(`[PDF Analysis] Converted to base64, sending to GPT-4o Vision`);

    // Get the appropriate prompt for this contract type
    const systemPrompt = CONTRACT_PROMPTS[contractType];

    // Send to GPT-4o Vision for analysis
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Use GPT-4o for vision capabilities
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `${systemPrompt}\n\nAnalyze this ${contractType} contract and return only the JSON object with the extracted information. Be thorough and accurate.`
            },
            {
              type: 'image_url',
              image_url: {
                url: dataUrl,
                detail: 'high' // High detail for better text extraction
              }
            }
          ]
        }
      ],
      max_tokens: 2000,
      temperature: 0.1 // Low temperature for consistent extraction
    });

    const analysisText = response.choices[0]?.message?.content;
    
    if (!analysisText) {
      throw new Error('No response from GPT-4o Vision');
    }

    console.log(`[PDF Analysis] Received response from GPT-4o Vision`);

    // Parse the JSON response
    let extractedData;
    try {
      // Clean the response to extract JSON
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      console.error('[PDF Analysis] JSON parsing error:', parseError);
      // Fallback: return the raw text in a structured format
      extractedData = {
        raw_analysis: analysisText,
        note: 'JSON parsing failed, returning raw analysis'
      };
    }

    // Calculate confidence score based on response completeness
    const expectedFields = Object.keys(CONTRACT_PROMPTS[contractType].match(/\{[\s\S]*\}/)?.[0] || '{}');
    const extractedFields = Object.keys(extractedData);
    const confidence = Math.min(95, Math.max(60, (extractedFields.length / Math.max(expectedFields.length, 8)) * 100));

    console.log(`[PDF Analysis] Analysis completed with ${confidence}% confidence`);

    // Optionally upload PDF to Supabase Storage for record keeping
    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('contracts')
        .upload(`pdfs/${Date.now()}-${fileName}`, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.warn('[PDF Analysis] Storage upload failed:', uploadError);
      } else {
        console.log('[PDF Analysis] PDF stored in Supabase:', uploadData.path);
      }
    } catch (storageError) {
      console.warn('[PDF Analysis] Storage error:', storageError);
      // Don't fail the whole request if storage fails
    }

    // Return the analysis results
    return NextResponse.json({
      success: true,
      extractedData,
      confidence: Math.round(confidence),
      analysisMethod: 'GPT-4o Vision',
      fileName,
      contractType,
      processingTime: Date.now()
    });

  } catch (error) {
    console.error('[PDF Analysis] Error processing PDF:', error);
    
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to analyze PDF contract',
      details: 'PDF analysis failed. Please try copying and pasting the text instead.'
    }, { status: 500 });
  }
} 