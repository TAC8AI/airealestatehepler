import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Fixed: Use server-side environment variable
});

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
        
        // Save to contracts table with only existing columns
        const { data: contractData, error: contractError } = await supabase
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

// Helper function to save to specific contract tables
async function saveToSpecificTable(
  contractType: string, 
  extractedData: any, 
  userId: string, 
  contractId: string, 
  fileName: string, 
  confidence: number
) {
  const commonFields = {
    user_id: userId,
    contract_id: contractId,
    title: fileName,
    confidence_score: confidence,
    analysis_method: 'GPT-4o Files API'
  };

  switch (contractType) {
    case 'purchase':
      const { error: purchaseError } = await supabase
        .from('purchase_contracts')
        .insert({
          ...commonFields,
          property_address: extractedData.property_address,
          purchase_price: extractedData.purchase_price ? parseFloat(extractedData.purchase_price.toString().replace(/[^0-9.]/g, '')) : null,
          earnest_money: extractedData.earnest_money ? parseFloat(extractedData.earnest_money.toString().replace(/[^0-9.]/g, '')) : null,
          closing_date: extractedData.closing_date,
          offer_date: extractedData.offer_date,
          acceptance_deadline: extractedData.acceptance_deadline,
          buyer_name: extractedData.buyer_name,
          seller_name: extractedData.seller_name,
          financing_type: extractedData.financing_type,
          down_payment_percent: extractedData.down_payment_percent ? parseFloat(extractedData.down_payment_percent.toString()) : null,
          loan_amount: extractedData.loan_amount ? parseFloat(extractedData.loan_amount.toString().replace(/[^0-9.]/g, '')) : null,
          inspection_period: extractedData.inspection_period ? parseInt(extractedData.inspection_period.toString()) : null,
          appraisal_contingency: extractedData.appraisal_contingency,
          financing_contingency: extractedData.financing_contingency,
          sale_of_other_home_contingency: extractedData.sale_of_other_home_contingency,
          buyer_agent: extractedData.buyer_agent,
          seller_agent: extractedData.seller_agent,
          buyer_brokerage: extractedData.buyer_brokerage,
          seller_brokerage: extractedData.seller_brokerage,
          special_conditions: extractedData.special_conditions,
          key_deadlines: extractedData.key_deadlines
        });
      
      if (purchaseError) throw purchaseError;
      break;

    case 'listing':
      const { error: listingError } = await supabase
        .from('listing_agreements')
        .insert({
          ...commonFields,
          property_address: extractedData.property_address,
          listing_price: extractedData.listing_price ? parseFloat(extractedData.listing_price.toString().replace(/[^0-9.]/g, '')) : null,
          commission_rate: extractedData.commission_rate ? parseFloat(extractedData.commission_rate.toString()) : null,
          buyer_agent_commission: extractedData.buyer_agent_commission ? parseFloat(extractedData.buyer_agent_commission.toString()) : null,
          listing_start_date: extractedData.listing_start_date,
          listing_end_date: extractedData.listing_end_date,
          exclusive_or_open: extractedData.exclusive_or_open,
          seller_name: extractedData.seller_name,
          listing_agent: extractedData.listing_agent,
          brokerage_name: extractedData.brokerage_name,
          mls_permission: extractedData.mls_permission,
          marketing_terms: extractedData.marketing_terms,
          exclusions: extractedData.exclusions,
          inclusions: extractedData.inclusions,
          showing_instructions: extractedData.showing_instructions,
          lockbox_permission: extractedData.lockbox_permission,
          sign_permission: extractedData.sign_permission,
          cancellation_terms: extractedData.cancellation_terms,
          special_conditions: extractedData.special_conditions
        });
      
      if (listingError) throw listingError;
      break;

    case 'lease':
      const { error: leaseError } = await supabase
        .from('lease_agreements')
        .insert({
          ...commonFields,
          property_address: extractedData.property_address,
          monthly_rent: extractedData.monthly_rent ? parseFloat(extractedData.monthly_rent.toString().replace(/[^0-9.]/g, '')) : null,
          security_deposit: extractedData.security_deposit ? parseFloat(extractedData.security_deposit.toString().replace(/[^0-9.]/g, '')) : null,
          lease_start_date: extractedData.lease_start_date,
          lease_end_date: extractedData.lease_end_date,
          lease_term_months: extractedData.lease_term_months ? parseInt(extractedData.lease_term_months.toString()) : null,
          tenant_name: extractedData.tenant_name,
          landlord_name: extractedData.landlord_name,
          property_manager: extractedData.property_manager,
          rent_due_date: extractedData.rent_due_date ? parseInt(extractedData.rent_due_date.toString()) : null,
          late_fee_amount: extractedData.late_fee_amount ? parseFloat(extractedData.late_fee_amount.toString().replace(/[^0-9.]/g, '')) : null,
          late_fee_grace_period: extractedData.late_fee_grace_period ? parseInt(extractedData.late_fee_grace_period.toString()) : null,
          utilities_included: extractedData.utilities_included,
          pet_deposit: extractedData.pet_deposit ? parseFloat(extractedData.pet_deposit.toString().replace(/[^0-9.]/g, '')) : null,
          special_conditions: extractedData.special_conditions
        });
      
      if (leaseError) throw leaseError;
      break;
  }
} 