import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

// Debug logging for environment variables
console.log('[PDF Analysis API] Debug - Environment variables check:');
console.log('[PDF Analysis API] NEXT_PUBLIC_OPENAI_API_KEY:', process.env.NEXT_PUBLIC_OPENAI_API_KEY ? 'SET' : 'NOT SET');
console.log('[PDF Analysis API] NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('[PDF Analysis API] SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');

let openai: OpenAI;
let supabaseAdmin: any;

try {
  console.log('[PDF Analysis API] Initializing OpenAI client...');
  openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, // Reverted: Use the key that was working
  });
  console.log('[PDF Analysis API] OpenAI client initialized successfully');
} catch (error) {
  console.error('[PDF Analysis API] Failed to initialize OpenAI client:', error);
  throw error;
}

try {
  console.log('[PDF Analysis API] Initializing Supabase admin client...');
  // Create admin Supabase client for server-side operations (bypasses RLS)
  supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key bypasses RLS
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
  console.log('[PDF Analysis API] Supabase admin client initialized successfully');
} catch (error) {
  console.error('[PDF Analysis API] Failed to initialize Supabase admin client:', error);
  throw error;
}

export async function POST(request: NextRequest) {
  try {
    console.log('[PDF Analysis API] Starting PDF analysis request');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const contractType = formData.get('contractType') as string;
    const fileName = formData.get('fileName') as string;
    const userId = formData.get('userId') as string;

    if (!file || !contractType) {
      return NextResponse.json(
        { error: 'Missing required fields: file and contractType are required' },
        { status: 400 }
      );
    }

    console.log(`[PDF Analysis API] Processing ${fileName} as ${contractType} contract`);

    // Check if we have user ID for database saving
    if (userId) {
      console.log('[PDF Analysis API] User ID provided for database saving:', userId);
    } else {
      console.log('[PDF Analysis API] No user ID provided, proceeding without saving to database');
    }

    // Upload file to OpenAI
    const uploadedFile = await openai.files.create({
      file: file,
      purpose: 'assistants',
    });

    console.log('[PDF Analysis API] File uploaded to OpenAI:', uploadedFile.id);

    // Create assistant for contract analysis
    const assistant = await openai.beta.assistants.create({
      name: `${contractType} Contract Analyzer`,
      instructions: getContractAnalysisPrompt(contractType),
      model: 'gpt-4o',
      tools: [{ type: 'file_search' }],
      tool_resources: {
        file_search: {
          vector_stores: [
            {
              file_ids: [uploadedFile.id],
            },
          ],
        },
      },
    });

    console.log('[PDF Analysis API] Assistant created:', assistant.id);

    // Create thread and run analysis
    const thread = await openai.beta.threads.create({
      messages: [
        {
          role: 'user',
          content: `Please analyze this ${contractType} contract and extract all relevant information according to your instructions. Return the results in the specified JSON format.`,
        },
      ],
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
    });

    // Poll for completion
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes max

    while (runStatus.status !== 'completed' && attempts < maxAttempts) {
      if (runStatus.status === 'failed' || runStatus.status === 'cancelled') {
        throw new Error(`Analysis failed: ${runStatus.status}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      attempts++;
    }

    if (runStatus.status !== 'completed') {
      throw new Error('Analysis timed out');
    }

    // Get the response
    const messages = await openai.beta.threads.messages.list(thread.id);
    const lastMessage = messages.data[0];
    
    if (!lastMessage || !lastMessage.content[0] || lastMessage.content[0].type !== 'text') {
      throw new Error('No analysis result received');
    }

    const analysisText = lastMessage.content[0].text.value;
    
    // Parse JSON response
    let extractedData;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        extractedData = JSON.parse(analysisText);
      }
    } catch (parseError) {
      console.error('[PDF Analysis API] Failed to parse JSON:', analysisText);
      throw new Error('Failed to parse analysis results');
    }

    // Calculate confidence score
    const confidence = calculateConfidenceScore(extractedData, contractType);

    // Save to database if user ID is provided
    let savedToDatabase = false;
    let contractId = null;

    if (userId) {
      try {
        console.log('[PDF Analysis API] Saving contract to database...');
        
        // Save to contracts table using admin client (bypasses RLS)
        const { data: contractData, error: contractError } = await supabaseAdmin
          .from('contracts')
          .insert({
            user_id: userId,
            title: fileName,
            contract_type: contractType,
            summary: `AI analysis of ${contractType} contract: ${fileName}`,
            extracted_data: extractedData,
            confidence_score: confidence,
            original_content: `PDF analysis of ${fileName}`,
            file_name: fileName
          })
          .select()
          .single();

        if (contractError) {
          console.error('[PDF Analysis API] Error saving to contracts table:', contractError);
          throw contractError;
        }

        contractId = contractData.id;
        console.log('[PDF Analysis API] Contract saved to contracts table successfully:', contractId);
        
        savedToDatabase = true;
        console.log('[PDF Analysis API] Database save completed successfully');

      } catch (dbError) {
        console.error('[PDF Analysis API] Database save error:', dbError);
        // Don't fail the entire request if database save fails
        savedToDatabase = false;
      }
    }

    // Cleanup
    try {
      await openai.beta.assistants.del(assistant.id);
      await openai.files.del(uploadedFile.id);
    } catch (cleanupError) {
      console.warn('[PDF Analysis API] Cleanup warning:', cleanupError);
    }

    console.log('[PDF Analysis API] Analysis completed successfully');

    return NextResponse.json({
      success: true,
      extractedData,
      confidence,
      analysisMethod: 'GPT-4o Files API',
      fileName,
      contractType,
      processingTime: Date.now(),
      savedToDatabase,
      contractId
    });

  } catch (error: any) {
    console.error('[PDF Analysis API] Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'PDF analysis failed',
      details: 'Please try again or use the text input option'
    }, { status: 500 });
  }
}

function getContractAnalysisPrompt(contractType: string): string {
  const basePrompt = `You are a real estate legal expert specializing in contract analysis. Analyze the uploaded PDF contract and extract key information in JSON format.

CRITICAL REQUIREMENTS:
1. Extract ONLY ACTUAL information from the contract - NEVER generate fake data
2. Be thorough and specific - include exact numbers, dates, names, and detailed conditions
3. Format response as valid JSON with no additional text
4. If information isn't found, use null or state "Information not provided in contract"
5. NEVER invent property details, party names, dates, or any other information`;

  switch (contractType) {
    case 'purchase':
      return `${basePrompt}

For PURCHASE/OFFER-TO-PURCHASE contracts, extract these fields in JSON format:
{
  "property_address": "exact address from contract",
  "purchase_price": "exact dollar amount",
  "earnest_money": "earnest money deposit amount", 
  "closing_date": "YYYY-MM-DD format",
  "offer_date": "YYYY-MM-DD format",
  "acceptance_deadline": "YYYY-MM-DD format",
  "buyer_name": "buyer's full name",
  "seller_name": "seller's full name",
  "financing_type": "cash/conventional/FHA/VA/etc",
  "down_payment_percent": "percentage as number",
  "loan_amount": "loan amount if specified",
  "inspection_period": "number of days",
  "appraisal_contingency": "details of appraisal contingency",
  "financing_contingency": "details of financing contingency",
  "sale_of_other_home_contingency": true/false,
  "buyer_agent": "buyer's agent name",
  "seller_agent": "seller's agent name",
  "buyer_brokerage": "buyer's brokerage name",
  "seller_brokerage": "seller's brokerage name",
  "special_conditions": ["array of special conditions"],
  "key_deadlines": ["array of important dates and deadlines"]
}`;

    case 'listing':
      return `${basePrompt}

For LISTING AGREEMENT contracts, extract these fields in JSON format:
{
  "property_address": "exact address from contract",
  "listing_price": "listing price amount",
  "commission_rate": "commission percentage",
  "buyer_agent_commission": "co-op commission percentage",
  "listing_start_date": "YYYY-MM-DD format",
  "listing_end_date": "YYYY-MM-DD format",
  "exclusive_or_open": "exclusive/open/etc",
  "seller_name": "seller's full name",
  "listing_agent": "listing agent name",
  "brokerage_name": "brokerage company name",
  "mls_permission": true/false,
  "marketing_terms": ["array of marketing permissions"],
  "exclusions": ["items excluded from sale"],
  "inclusions": ["items included in sale"],
  "showing_instructions": "showing and access instructions",
  "lockbox_permission": true/false,
  "sign_permission": true/false,
  "cancellation_terms": "cancellation clause details",
  "special_conditions": ["array of special conditions"]
}`;

    case 'lease':
      return `${basePrompt}

For LEASE/RENTAL AGREEMENT contracts, extract these fields in JSON format:
{
  "property_address": "exact address from contract",
  "monthly_rent": "monthly rent amount",
  "security_deposit": "security deposit amount",
  "lease_start_date": "YYYY-MM-DD format",
  "lease_end_date": "YYYY-MM-DD format",
  "lease_term_months": "number of months",
  "tenant_name": "tenant's full name",
  "landlord_name": "landlord's full name",
  "property_manager": "property manager name if applicable",
  "rent_due_date": "day of month rent is due",
  "late_fee_amount": "late fee amount",
  "late_fee_grace_period": "grace period in days",
  "utilities_included": ["utilities included in rent"],
  "utilities_tenant_responsible": ["utilities tenant pays"],
  "pets_allowed": true/false,
  "pet_policy": "pet policy details",
  "pet_deposit": "pet deposit amount",
  "parking_spaces": "number of parking spaces",
  "smoking_allowed": true/false,
  "renewal_options": "renewal clause details",
  "termination_notice_days": "required notice period",
  "special_conditions": ["array of special lease conditions"]
}`;

    default:
      return basePrompt;
  }
}

function calculateConfidenceScore(extractedData: any, contractType: string): number {
  const requiredFields = {
    purchase: ['property_address', 'purchase_price', 'buyer_name', 'seller_name'],
    listing: ['property_address', 'listing_price', 'seller_name', 'listing_agent'],
    lease: ['property_address', 'monthly_rent', 'tenant_name', 'landlord_name']
  };

  const required = requiredFields[contractType as keyof typeof requiredFields] || [];
  const totalFields = Object.keys(extractedData).length;
  const filledRequired = required.filter(field => 
    extractedData[field] && 
    extractedData[field] !== null && 
    extractedData[field] !== "Information not provided in contract"
  ).length;

  const baseScore = totalFields > 0 ? (filledRequired / required.length) * 70 : 0;
  const completenessBonus = Math.min(totalFields * 2, 30);
  
  return Math.min(Math.round(baseScore + completenessBonus), 100);
}

