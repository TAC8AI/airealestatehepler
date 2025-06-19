/**
 * Battle-tested Real Estate Contract Analysis
 * Smart model selection: GPT-4 for small docs, Gemini for large docs, with fallbacks
 */

import { openai } from './openai';
import { analyzeWithGemini } from './gemini.js';

// Contract types supported by the system
export type ContractType = 'purchase' | 'listing' | 'lease';

// Token limits for smart model selection
const GPT4_TOKEN_LIMIT = 120000; // Conservative limit for GPT-4 (128k max)
const GEMINI_CHUNK_SIZE = 800000; // ~600k tokens for Gemini
const CHARS_PER_TOKEN = 4; // Rough estimate

// Helper to estimate token count
function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

// Helper to chunk large documents
function chunkDocument(text: string, maxChunkSize: number): string[] {
  if (text.length <= maxChunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  let currentPos = 0;
  
  while (currentPos < text.length) {
    let chunkEnd = Math.min(currentPos + maxChunkSize, text.length);
    
    // Try to break at paragraph or sentence boundaries
    if (chunkEnd < text.length) {
      const paragraphBreak = text.lastIndexOf('\n\n', chunkEnd);
      const sentenceBreak = text.lastIndexOf('. ', chunkEnd);
      
      if (paragraphBreak > currentPos + maxChunkSize * 0.8) {
        chunkEnd = paragraphBreak + 2;
      } else if (sentenceBreak > currentPos + maxChunkSize * 0.8) {
        chunkEnd = sentenceBreak + 2;
      }
    }
    
    chunks.push(text.slice(currentPos, chunkEnd));
    currentPos = chunkEnd;
  }
  
  return chunks;
}

// Battle-tested schemas that agents actually use
interface PurchaseContractData {
  buyer: string;
  seller: string;
  property_legal_description: string;
  offer_price: number;
  earnest_money_amount: number;
  important_dates: {
    offer_date: string;
    acceptance_deadline: string;
    closing_date: string;
  };
  contingencies: {
    inspection: boolean;
    financing: boolean;
    appraisal: boolean;
    sale_of_other_home: boolean;
    other: string | null;
  };
  financing_terms: {
    loan_type: string | null;
    down_payment_pct: number | null;
  };
  brokerages: {
    buy_side: string | null;
    list_side: string | null;
  };
  seller_disclosures_attached: boolean;
}

interface ListingContractData {
  seller: string;
  brokerage_name: string;
  listing_agent: string | null;
  property_address: string;
  list_price: number | null;
  commission_pct: number | null;
  co_op_pct: number | null;
  agreement_start_date: string | null;
  expiration_date: string | null;
  exclusive_or_open: 'exclusive' | 'open' | 'other' | 'unknown';
  mls_marketing_permission: boolean | null;
}

interface LeaseContractData {
  landlord: string;
  tenant: string;
  property_address: string;
  lease_term_start: string;
  lease_term_end: string;
  monthly_rent: number;
  security_deposit: number | null;
  late_fee_policy: string | null;
  utilities_responsibility: string | null;
  maintenance_responsibility: string | null;
  pet_policy: string | null;
  options_to_renew: {
    has_option: boolean;
    details: string | null;
  };
}

// Battle-tested prompts from proven implementations
const CONTRACT_PROMPTS = {
  purchase: {
    system: `You are a contract-analysis assistant that outputs **only** valid JSON.`,
    user: `You will be given the full text of a RESIDENTIAL PURCHASE / OFFER-TO-PURCHASE agreement.
Return a JSON object that follows this schema exactly:

{
  "buyer": "<string>",
  "seller": "<string>",
  "property_legal_description": "<string>",
  "offer_price": "<number USD>",
  "earnest_money_amount": "<number USD>",
  "important_dates": {
    "offer_date": "<YYYY-MM-DD>",
    "acceptance_deadline": "<YYYY-MM-DD>",
    "closing_date": "<YYYY-MM-DD>"
  },
  "contingencies": {
    "inspection": <bool>,
    "financing": <bool>,
    "appraisal": <bool>,
    "sale_of_other_home": <bool>,
    "other": "<string|null>"
  },
  "financing_terms": {
    "loan_type": "<string|null>",
    "down_payment_pct": "<number|null>"
  },
  "brokerages": {
    "buy_side": "<string|null>",
    "list_side": "<string|null>"
  },
  "seller_disclosures_attached": <bool>
}

If any field is missing, use null.

CONTRACT_TEXT:
<<<
`
  },

  listing: {
    system: `Return JSON only.`,
    user: `Extract the following fields from this LISTING AGREEMENT:

schema: {
  "seller": "<string>",
  "brokerage_name": "<string>",
  "listing_agent": "<string|null>",
  "property_address": "<string>",
  "list_price": "<number USD|null>",
  "commission_pct": "<number pct|null>",
  "co_op_pct": "<number pct|null>",
  "agreement_start_date": "<YYYY-MM-DD|null>",
  "expiration_date": "<YYYY-MM-DD|null>",
  "exclusive_or_open": "<'exclusive'|'open'|'other'|'unknown'>",
  "mls_marketing_permission": <bool|null>
}

CONTRACT_TEXT:
<<<
`
  },

  lease: {
    system: `Output ONLY the JSON block.`,
    user: `Given a RESIDENTIAL LEASE AGREEMENT, produce:

{
  "landlord": "<string>",
  "tenant": "<string>",
  "property_address": "<string>",
  "lease_term_start": "<YYYY-MM-DD>",
  "lease_term_end": "<YYYY-MM-DD>",
  "monthly_rent": "<number USD>",
  "security_deposit": "<number USD|null>",
  "late_fee_policy": "<string|null>",
  "utilities_responsibility": "<string|null>",
  "maintenance_responsibility": "<string|null>",
  "pet_policy": "<string|null>",
  "options_to_renew": {
    "has_option": <bool>,
    "details": "<string|null>"
  }
}

CONTRACT_TEXT:
<<<
`
  }
};

/**
 * Analyze using GPT-4 with chunking for large documents
 */
async function analyzeWithGPT4(
  systemPrompt: string,
  userPrompt: string,
  contractText: string
): Promise<string> {
  const estimatedTokens = estimateTokenCount(systemPrompt + userPrompt + contractText);
  
  if (estimatedTokens <= GPT4_TOKEN_LIMIT) {
    // Single request analysis
    console.log(`[GPT-4] Processing single request (${estimatedTokens} tokens)`);
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: "json_object" },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `${userPrompt}${contractText}\n>>>` }
      ],
      temperature: 0.1,
      max_tokens: 1500
    });
    
    return response.choices[0].message.content || '{}';
  } else {
    // Chunked analysis for large documents
    const maxChunkSize = GPT4_TOKEN_LIMIT * CHARS_PER_TOKEN * 0.7; // Leave room for prompts
    const chunks = chunkDocument(contractText, maxChunkSize);
    
    console.log(`[GPT-4] Processing ${chunks.length} chunks`);
    
    const chunkAnalyses: any[] = [];
    
    for (let i = 0; i < chunks.length; i++) {
      console.log(`[GPT-4] Processing chunk ${i + 1}/${chunks.length}`);
      
      const chunkPrompt = `${userPrompt}
IMPORTANT: This is chunk ${i + 1} of ${chunks.length} from a larger document. 
Extract any relevant fields you can find, but return null for fields not present in this chunk.

${chunks[i]}\n>>>`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        response_format: { type: "json_object" },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: chunkPrompt }
        ],
        temperature: 0.1,
        max_tokens: 1500
      });
      
      const chunkResult = response.choices[0].message.content || '{}';
      try {
        chunkAnalyses.push(JSON.parse(chunkResult));
      } catch (e) {
        console.warn(`[GPT-4] Failed to parse chunk ${i + 1} response`);
      }
    }
    
    // Merge chunk results
    const mergedResult = mergeChunkAnalyses(chunkAnalyses);
    return JSON.stringify(mergedResult);
  }
}

// Helper function to merge chunk analyses
function mergeChunkAnalyses(chunks: any[]): any {
  if (chunks.length === 0) return {};
  if (chunks.length === 1) return chunks[0];
  
  const merged = { ...chunks[0] };
  
  for (let i = 1; i < chunks.length; i++) {
    const chunk = chunks[i];
    
    for (const [key, value] of Object.entries(chunk)) {
      if (value !== null && value !== undefined && value !== '') {
        if (typeof value === 'object' && !Array.isArray(value)) {
          // Merge nested objects
          merged[key] = { ...merged[key], ...value };
        } else {
          // Overwrite with non-null values
          merged[key] = value;
        }
      }
    }
  }
  
  return merged;
}

/**
 * Analyze using Gemini 2.5 Flash (preferred for large documents and quota efficiency)
 */
async function analyzeWithGeminiFlash(
  systemPrompt: string,
  userPrompt: string,
  contractText: string
): Promise<string> {
  const estimatedTokens = estimateTokenCount(systemPrompt + userPrompt + contractText);
  
  // If document is too large, chunk it for better results
  if (estimatedTokens > 800000) { // 600k tokens roughly
    console.log(`[Gemini 2.5 Flash] Document too large (${estimatedTokens} tokens), chunking...`);
    
    const maxChunkSize = 600000; // Conservative chunk size for Gemini
    const chunks = chunkDocument(contractText, maxChunkSize);
    
    console.log(`[Gemini 2.5 Flash] Processing ${chunks.length} chunks`);
    
    const chunkAnalyses: any[] = [];
    
    for (let i = 0; i < chunks.length; i++) {
      console.log(`[Gemini 2.5 Flash] Processing chunk ${i + 1}/${chunks.length}`);
      
      const chunkPrompt = `${userPrompt}
IMPORTANT: This is chunk ${i + 1} of ${chunks.length} from a larger document. 
Extract any relevant fields you can find, but return null for fields not present in this chunk.

${chunks[i]}
>>>`;

      try {
        const response = await analyzeWithGemini(
          systemPrompt,
          chunkPrompt,
          ''
        );
        
        if (response && response.trim()) {
          try {
            // Clean and parse the response
            let cleanedResponse = response.trim();
            cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
            
            const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              cleanedResponse = jsonMatch[0];
            }
            
            chunkAnalyses.push(JSON.parse(cleanedResponse));
          } catch (parseError) {
            console.warn(`[Gemini 2.5 Flash] Failed to parse chunk ${i + 1} response, skipping`);
          }
        }
      } catch (chunkError) {
        console.warn(`[Gemini 2.5 Flash] Chunk ${i + 1} failed:`, chunkError);
      }
    }
    
    // Merge chunk results
    const mergedResult = mergeChunkAnalyses(chunkAnalyses);
    return JSON.stringify(mergedResult);
  } else {
    console.log(`[Gemini 2.5 Flash] Processing single request (${estimatedTokens} tokens)`);
    
    const response = await analyzeWithGemini(
      systemPrompt,
      userPrompt,
      contractText
    );
    
    // Validate response is not empty
    if (!response || response.trim().length === 0) {
      throw new Error('Gemini returned an empty response. The document may be too complex or hit rate limits.');
    }
    
    return response;
  }
}

/**
 * Create default/empty contract data structure when parsing fails
 */
function createDefaultContractData(contractType: ContractType): any {
  const defaultStructures = {
    purchase: {
      buyer: null,
      seller: null,
      property_legal_description: null,
      offer_price: null,
      earnest_money_amount: null,
      important_dates: {
        offer_date: null,
        acceptance_deadline: null,
        closing_date: null
      },
      contingencies: {
        inspection: false,
        financing: false,
        appraisal: false,
        sale_of_other_home: false,
        other: null
      },
      financing_terms: {
        loan_type: null,
        down_payment_pct: null
      },
      brokerages: {
        buy_side: null,
        list_side: null
      },
      seller_disclosures_attached: false
    },
    
    listing: {
      seller: null,
      brokerage_name: null,
      listing_agent: null,
      property_address: null,
      list_price: null,
      commission_pct: null,
      co_op_pct: null,
      agreement_start_date: null,
      expiration_date: null,
      exclusive_or_open: 'unknown',
      mls_marketing_permission: null
    },
    
    lease: {
      landlord: null,
      tenant: null,
      property_address: null,
      lease_term_start: null,
      lease_term_end: null,
      monthly_rent: null,
      security_deposit: null,
      late_fee_policy: null,
      utilities_responsibility: null,
      maintenance_responsibility: null,
      pet_policy: null,
      options_to_renew: {
        has_option: false,
        details: null
      }
    }
  };

  return defaultStructures[contractType];
}

/**
 * Analyze a real estate contract with smart model selection and fallbacks
 */
export async function analyzeRealEstateContract(
  contractText: string,
  contractType: ContractType,
  fileName?: string
): Promise<{
  extractedData: PurchaseContractData | ListingContractData | LeaseContractData;
  summary: string;
  confidence: number;
}> {
  if (!contractText || contractText.trim().length < 100) {
    throw new Error('Contract text is too short or empty');
  }

  const estimatedTokens = estimateTokenCount(contractText);
  const preferGemini = true; // USE GEMINI 2.5 FLASH AS PRIMARY MODEL

  console.log(`[Contract Analysis] Starting ${contractType} contract analysis`);
  console.log(`[Contract Analysis] Text length: ${contractText.length} characters`);
  console.log(`[Contract Analysis] Estimated tokens: ${estimatedTokens}`);
  console.log(`[Contract Analysis] Preferred model: ${preferGemini ? 'Gemini 2.5 Flash' : 'GPT-4'}`);

  const prompt = CONTRACT_PROMPTS[contractType];
  let extractedDataText: string;
  let usedModel = '';

  // Try preferred model first, with fallback
  try {
    if (preferGemini) {
      console.log(`[Contract Analysis] Attempting Gemini analysis...`);
      extractedDataText = await analyzeWithGeminiFlash(
        prompt.system,
        prompt.user,
        contractText
      );
      usedModel = 'Gemini 2.5 Flash';
    } else {
      console.log(`[Contract Analysis] Using GPT-4 analysis...`);
      extractedDataText = await analyzeWithGPT4(
        prompt.system,
        prompt.user,
        contractText
      );
      usedModel = 'GPT-4';
    }
  } catch (error: any) {
    console.warn(`[Contract Analysis] Primary model failed: ${error.message}`);
    
    // Check if it's a quota error for Gemini
    if (error.message?.includes('quota') || error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
      throw new Error(`Gemini 2.5 Flash quota exceeded. Please wait a few minutes and try again. The free tier has usage limits that reset hourly.`);
    }
    
    // Fallback to the other model only for non-quota errors
    try {
      if (preferGemini) {
        console.log(`[Contract Analysis] Falling back to GPT-4...`);
        extractedDataText = await analyzeWithGPT4(
          prompt.system,
          prompt.user,
          contractText
        );
        usedModel = 'GPT-4 (fallback)';
      } else {
        console.log(`[Contract Analysis] Falling back to Gemini...`);
        extractedDataText = await analyzeWithGeminiFlash(
          prompt.system,
          prompt.user,
          contractText
        );
        usedModel = 'Gemini 2.5 Flash (fallback)';
      }
    } catch (fallbackError: any) {
      console.error(`[Contract Analysis] Both models failed`);
      throw new Error(`Analysis failed with both models. Last error: ${fallbackError.message}`);
    }
  }

  // Parse the extracted data
  let extractedData;
  try {
    // Validate that we have a response
    if (!extractedDataText || extractedDataText.trim().length === 0) {
      throw new Error('Empty response from AI model');
    }

    // Clean response - remove markdown code blocks if present
    let cleanedResponse = extractedDataText.trim();
    
    // Remove markdown code blocks
    cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    
    // Try to find JSON object if wrapped in text
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedResponse = jsonMatch[0];
    }

    // Additional validation
    if (!cleanedResponse || cleanedResponse.trim().length === 0) {
      throw new Error('No valid JSON content found in response');
    }
    
    extractedData = JSON.parse(cleanedResponse);
    
  } catch (parseError) {
    console.error('[Contract Analysis] JSON parsing failed:', parseError);
    console.log('[Contract Analysis] Raw response:', extractedDataText);
    
    // Advanced fallback parsing attempts
    try {
      // Try to extract JSON from anywhere in the response
      const jsonMatch = extractedDataText.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        console.log('[Contract Analysis] Attempting fallback JSON extraction...');
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON object found in response');
      }
    } catch (fallbackError) {
      console.error('[Contract Analysis] Fallback JSON parsing also failed:', fallbackError);
      
      // Create a default structure based on contract type
      console.log('[Contract Analysis] Creating default structure due to parsing failure...');
      extractedData = createDefaultContractData(contractType);
      usedModel += ' (with default data due to parsing failure)';
    }
  }

  // Generate human-readable summary
  let summary: string;
  const isGemini = usedModel.includes('Gemini');

  if (isGemini) {
    try {
      summary = await analyzeWithGemini(
        `You are a real estate expert.`,
        `Create a concise, client-friendly summary of this ${contractType} contract based on the extracted data below. Focus on the most important terms, dates, and obligations. Write in plain English that a client can easily understand.

Extracted Data:
${JSON.stringify(extractedData, null, 2)}

Summary:`,
        ''
      );
    } catch (summaryError) {
      // Fallback to GPT-4 for summary
      const summaryResponse = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a real estate expert. Create a concise, client-friendly summary of this ${contractType} contract. Focus on the most important terms, dates, and obligations. Write in plain English that a client can easily understand.`
          },
          {
            role: 'user',
            content: `Based on this extracted data from a ${contractType} contract, create a summary:\n\n${JSON.stringify(extractedData, null, 2)}`
          }
        ],
        temperature: 0.3,
        max_tokens: 400
      });
      summary = summaryResponse.choices[0].message.content || 'Summary generation failed';
    }
  } else {
    const summaryResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a real estate expert. Create a concise, client-friendly summary of this ${contractType} contract. Focus on the most important terms, dates, and obligations. Write in plain English that a client can easily understand.`
        },
        {
          role: 'user',
          content: `Based on this extracted data from a ${contractType} contract, create a summary:\n\n${JSON.stringify(extractedData, null, 2)}`
        }
      ],
      temperature: 0.3,
      max_tokens: 400
    });
    summary = summaryResponse.choices[0].message.content || 'Summary generation failed';
  }

  // Calculate confidence score based on data completeness
  const confidence = calculateConfidenceScore(extractedData, contractType);

  console.log(`[Contract Analysis] Analysis complete using ${usedModel}. Confidence: ${confidence}%`);

  return {
    extractedData,
    summary,
    confidence
  };
}

/**
 * Calculate confidence score based on completeness of extracted data
 * Uses battle-tested required fields that agents actually use
 */
function calculateConfidenceScore(data: any, contractType: ContractType): number {
  const requiredFields = {
    purchase: [
      'buyer', 'seller', 'property_legal_description', 'offer_price', 
      'important_dates.closing_date', 'contingencies', 'earnest_money_amount'
    ],
    listing: [
      'seller', 'brokerage_name', 'property_address', 'list_price', 
      'commission_pct', 'expiration_date'
    ],
    lease: [
      'landlord', 'tenant', 'property_address', 'lease_term_start', 
      'lease_term_end', 'monthly_rent'
    ]
  };

  const required = requiredFields[contractType];
  let completedFields = 0;

  for (const field of required) {
    const fieldParts = field.split('.');
    let value = data;
    
    // Navigate nested fields
    for (const part of fieldParts) {
      value = value?.[part];
    }
    
    if (value !== null && value !== undefined && value !== '') {
      completedFields++;
    }
  }

  return Math.round((completedFields / required.length) * 100);
}

/**
 * Get schema template for a contract type (for UI display)
 */
export function getContractSchema(contractType: ContractType): object {
  const schemas = {
    purchase: {
      buyer: "John Smith",
      seller: "Jane Doe",
      property_legal_description: "123 Main St, City, State 12345",
      offer_price: 450000,
      earnest_money_amount: 5000,
      important_dates: {
        offer_date: "2024-01-15",
        acceptance_deadline: "2024-01-17",
        closing_date: "2024-02-15"
      },
      contingencies: {
        inspection: true,
        financing: true,
        appraisal: true,
        sale_of_other_home: false,
        other: null
      },
      financing_terms: {
        loan_type: "Conventional",
        down_payment_pct: 20
      },
      brokerages: {
        buy_side: "ABC Realty",
        list_side: "XYZ Realty"
      },
      seller_disclosures_attached: true
    },
    
    listing: {
      seller: "John Smith",
      brokerage_name: "ABC Realty",
      listing_agent: "Jane Agent",
      property_address: "123 Main St, City, State 12345",
      list_price: 475000,
      commission_pct: 6,
      co_op_pct: 3,
      agreement_start_date: "2024-01-15",
      expiration_date: "2024-07-15",
      exclusive_or_open: "exclusive",
      mls_marketing_permission: true
    },
    
    lease: {
      landlord: "Property Management LLC",
      tenant: "John Smith",
      property_address: "123 Main St, Apt 2B, City, State 12345",
      lease_term_start: "2024-02-01",
      lease_term_end: "2025-01-31",
      monthly_rent: 2500,
      security_deposit: 2500,
      late_fee_policy: "$50 after 5 days late",
      utilities_responsibility: "Tenant pays electric, gas; Landlord pays water",
      maintenance_responsibility: "Landlord handles major repairs; Tenant handles minor",
      pet_policy: "No pets allowed",
      options_to_renew: {
        has_option: true,
        details: "60-day notice required for renewal"
      }
    }
  };

  return schemas[contractType];
}

/**
 * Get field descriptions for UI tooltips
 */
export function getFieldDescriptions(contractType: ContractType): Record<string, string> {
  const descriptions = {
    purchase: {
      buyer: "Name of the buyer(s) purchasing the property",
      seller: "Name of the seller(s) selling the property", 
      property_legal_description: "Complete legal description or address of the property",
      offer_price: "Purchase price offered by buyer (USD)",
      earnest_money_amount: "Earnest money deposit amount (USD)",
      important_dates: "Critical timeline dates for the transaction",
      contingencies: "Conditions that must be met for sale to proceed",
      financing_terms: "Loan and down payment details",
      brokerages: "Real estate brokerages representing each party",
      seller_disclosures_attached: "Whether seller disclosure documents are included"
    },
    listing: {
      seller: "Property owner(s) listing the property",
      brokerage_name: "Real estate brokerage handling the listing",
      listing_agent: "Agent responsible for marketing the property",
      property_address: "Full address of the property being listed",
      list_price: "Initial asking price for the property (USD)",
      commission_pct: "Total commission percentage",
      co_op_pct: "Commission split offered to buyer's agent",
      agreement_start_date: "When the listing agreement begins",
      expiration_date: "When the listing agreement expires",
      exclusive_or_open: "Type of listing agreement",
      mls_marketing_permission: "Permission to market on MLS"
    },
    lease: {
      landlord: "Property owner or management company",
      tenant: "Person(s) renting the property",
      property_address: "Full address of the rental property",
      lease_term_start: "When the lease period begins",
      lease_term_end: "When the lease period ends",
      monthly_rent: "Monthly rental amount (USD)",
      security_deposit: "Refundable security deposit amount (USD)",
      late_fee_policy: "Penalties for late rent payments",
      utilities_responsibility: "Who pays for which utilities",
      maintenance_responsibility: "Who handles repairs and maintenance",
      pet_policy: "Rules regarding pets in the rental",
      options_to_renew: "Lease renewal terms and conditions"
    }
  };

  return descriptions[contractType] || {};
}
