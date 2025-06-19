import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';

// Initialize OpenAI with Files API capabilities
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

// Contract type definitions
type ContractType = 'purchase' | 'listing' | 'lease';

// Specialized prompts for each contract type
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
  "monthly_rent": "$2,450.00",
  "lease_start_date": "2024-08-01",
  "lease_end_date": "2025-07-31",
  "lease_term_months": 12,
  "security_deposit": "$2,450.00",
  "tenant_name": "Full tenant name(s)",
  "landlord_name": "Full landlord name(s)",
  "utilities_included": ["Water", "Trash", "Sewer"],
  "pet_policy": "No pets allowed / Pets allowed with $XXX deposit / etc.",
  "late_fee": "$50.00",
  "rent_due_date": 1,
  "maintenance_responsibility": "Tenant handles minor repairs, landlord handles major repairs",
  "parking_included": true,
  "renewal_option": "60-day notice required for renewal",
  "early_termination_clause": "2 months rent penalty for early termination",
  "special_conditions": ["Any special terms or restrictions"]
}

IMPORTANT INSTRUCTIONS:
- Extract lease start and end dates in YYYY-MM-DD format (e.g., "2024-08-01")
- Look for phrases like "Term begins", "Lease commences", "From [date] to [date]", "Starting [date]", "Ending [date]"
- Calculate lease_term_months if not explicitly stated (difference between start and end dates)
- Extract monthly rent as dollar amount with currency symbol (e.g., "$2,450.00")
- Be precise with dates - this is critical information
- Extract specific dollar amounts for fees, not ranges
- Look for exact due dates (e.g., "1st of each month" = 1)`
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

    // Convert File to Buffer for OpenAI upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Create a File-like object for OpenAI
    const fileForUpload = new File([buffer], fileName, { type: file.type });
    
    console.log('[PDF Analysis] Uploading PDF to OpenAI Files API');
    
    // Upload PDF to OpenAI Files API
    const uploadedFile = await openai.files.create({
      file: fileForUpload,
      purpose: 'user_data'
    });

    console.log('[PDF Analysis] PDF uploaded successfully, analyzing with file ID:', uploadedFile.id);

    // Get the appropriate prompt for this contract type
    const systemPrompt = CONTRACT_PROMPTS[contractType];

    // Analyze the PDF using the file reference
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', 
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'file',
              file: {
                file_id: uploadedFile.id
              }
            },
            {
              type: 'text',
              text: `${systemPrompt}\n\nAnalyze this ${contractType} contract and return only the JSON object with the extracted information. Be thorough and accurate.`
            }
          ]
        }
      ],
      max_tokens: 2000,
      temperature: 0.1
    });

    // Clean up the uploaded file
    try {
      await openai.files.del(uploadedFile.id);
      console.log('[PDF Analysis] Cleaned up uploaded file');
    } catch (cleanupError) {
      console.warn('[PDF Analysis] Failed to cleanup file:', cleanupError);
    }

    const analysisText = response.choices[0]?.message?.content;
    
    if (!analysisText) {
      throw new Error('No response from GPT-4o');
    }

    console.log(`[PDF Analysis] Received response from GPT-4o`);

    // Parse the JSON response
    let extractedData;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      console.error('[PDF Analysis] JSON parsing error:', parseError);
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
      analysisMethod: 'GPT-4o Files API',
      fileName,
      contractType,
      processingTime: Date.now()
    });

  } catch (error) {
    console.error('[PDF Analysis] Error processing PDF:', error);
    
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to analyze PDF contract',
      details: 'Please try again or contact support if the issue persists.'
    }, { status: 500 });
  }
} 