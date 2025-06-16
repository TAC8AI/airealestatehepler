import OpenAI from 'openai';

const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const model = process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-4';

if (!apiKey) {
  throw new Error('Missing OpenAI API key');
}

export const openai = new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true, // Only for client-side usage
});

export async function generateMLSDescription(propertyDetails: any): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a professional real estate copywriter. Create an engaging and detailed MLS description based on the property details provided.',
        },
        {
          role: 'user',
          content: `Create an MLS description for this property: ${JSON.stringify(propertyDetails)}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content || 'Unable to generate MLS description.';
  } catch (error) {
    console.error('Error generating MLS description:', error);
    throw new Error('Failed to generate MLS description');
  }
}

export async function generateSocialMediaContent(
  propertyDetails: any,
  platform: 'facebook' | 'instagram' | 'linkedin'
): Promise<string> {
  const platformPrompts = {
    facebook: 'Create an engaging Facebook post to market this property. Include key features and a call to action.',
    instagram: 'Create a captivating Instagram caption to showcase this property. Keep it concise but highlight key selling points.',
    linkedin: 'Create a professional LinkedIn post to market this property to potential investors and buyers. Highlight investment potential and key features.',
  };

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: `You are a social media marketing expert specializing in real estate.`,
        },
        {
          role: 'user',
          content: `${platformPrompts[platform]} Property details: ${JSON.stringify(propertyDetails)}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    return response.choices[0]?.message?.content || `Unable to generate ${platform} content.`;
  } catch (error) {
    console.error(`Error generating ${platform} content:`, error);
    throw new Error(`Failed to generate ${platform} content`);
  }
}

// Helper function to estimate token count (rough approximation)
function estimateTokenCount(text: string): number {
  // A very rough approximation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
}

// Function to limit text to a maximum token count
function limitTextToMaxTokens(text: string, maxTokens: number = 60000): string {
  const estimatedTokens = estimateTokenCount(text);
  
  if (estimatedTokens <= maxTokens) {
    return text;
  }
  
  // Calculate approximate character limit based on token estimate
  const charLimit = Math.floor(maxTokens * 4);
  console.log(`[OpenAI] Text too large (${estimatedTokens} tokens), truncating to ~${maxTokens} tokens (${charLimit} chars)`);
  
  // Return truncated text
  return text.substring(0, charLimit);
}

// Helper function to chunk text into smaller pieces
function chunkText(text: string, tokensPerChunk: number = 10000): string[] {
  // Convert tokens to approximate characters
  const charsPerChunk = tokensPerChunk * 4;
  const chunks = [];
  
  // Split by paragraphs first to avoid cutting in the middle of content
  const paragraphs = text.split(/\n\s*\n/);
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    // If adding this paragraph would exceed chunk size, save current chunk and start a new one
    if (currentChunk.length + paragraph.length > charsPerChunk && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = '';
    }
    
    // If a single paragraph is larger than chunk size, split it
    if (paragraph.length > charsPerChunk) {
      // If we have content in current chunk, save it first
      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = '';
      }
      
      // Split large paragraph into chunks
      for (let i = 0; i < paragraph.length; i += charsPerChunk) {
        chunks.push(paragraph.slice(i, i + charsPerChunk));
      }
    } else {
      // Add paragraph to current chunk
      currentChunk += paragraph + '\n\n';
    }
  }
  
  // Add the last chunk if it has content
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

export async function summarizeContract(contractText: string): Promise<string> {
  // Set maximum tokens to process based on model to avoid rate limit errors
  const isGpt4 = model.includes('gpt-4');
  // Model context window is 16,385 tokens, but we must leave room for prompt and response
  const MAX_TOKENS_TOTAL = isGpt4 ? 28000 : 56000; // Lower total for GPT-4 (to avoid hitting TPM + context)
  const MAX_TOKENS_PER_CHUNK = 13500; // Strict chunk max for all models (safe for GPT-3.5/4-turbo)

  // Helper: Truncate a chunk to fit max tokens
  function truncateToMaxTokens(text: string, maxTokens: number): string {
    let tokens = estimateTokenCount(text);
    if (tokens <= maxTokens) return text;
    // Estimate average 4 chars/token, truncate to chars then further trim
    let approxChars = Math.floor(maxTokens * 4);
    let truncated = text.slice(0, approxChars);
    // Further trim if still too many tokens
    while (estimateTokenCount(truncated) > maxTokens) {
      truncated = truncated.slice(0, -200);
    }
    return truncated;
  }
  try {
    // Log the input text for debugging
    console.log(`[OpenAI] Summarizing contract text, length: ${contractText.length} characters`);
    console.log(`[OpenAI] First 200 chars of contract: ${contractText.substring(0, 200)}...`);
    
    // Limit text to maximum token count to avoid rate limit errors
    const limitedText = limitTextToMaxTokens(contractText, MAX_TOKENS_TOTAL);
    
    const estimatedTokens = estimateTokenCount(limitedText);
    console.log(`[OpenAI] Estimated token count after limiting: ${estimatedTokens}`);
    
    if (estimatedTokens <= 15000) {
      console.log(`[OpenAI] Processing contract in single request`);
      const response = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: `You are a real estate legal expert. Analyze this contract thoroughly and return a detailed JSON object with the following structure:
{
  "property": "Provide a comprehensive description of the property including full address, property type, lot size, building size, number of rooms, and any other specific property details mentioned in the contract.",
  "parties": "Include complete details about all parties involved: full names of buyers and sellers, their contact information if available, representatives, agents, brokers, and any other individuals or entities mentioned in the contract.",
  "dates": "List ALL critical dates with their specific deadlines: contract acceptance date, inspection period start/end, financing contingency deadline, appraisal deadline, title review period, closing date, possession date, and any other timeframes mentioned.",
  "contingencies": "Detail ALL contingencies with their specific terms: financing (including loan amount, interest rate targets), inspection requirements, appraisal conditions, title contingencies, sale of buyer's property if applicable, and any other conditions that must be met.",
  "otherDetails": "Include all other important contract terms: purchase price, earnest money amount, closing cost allocations, included/excluded fixtures and appliances, special provisions, addenda, and any unique terms specific to this transaction."
}

IMPORTANT:
1. Extract ONLY ACTUAL information from the contract text - NEVER generate fake data
2. Be thorough and specific - include exact numbers, dates, names, and detailed conditions as they appear in the contract
3. Format the response as valid JSON with these exact keys
4. Do NOT include phrases like 'simulated extraction', 'example data', or any placeholder information
5. If specific information isn't found in the contract, state that directly (e.g., 'No specific contingencies mentioned in the contract')
6. NEVER invent property details, party names, dates, or any other information not explicitly stated in the contract
7. Leave fields empty or state 'Information not provided in contract' rather than generating fictional content`
          },
          {
            role: 'user',
            content: `Analyze this real estate contract and return the JSON summary: ${contractText}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: "json_object" }
      });
      
      console.log(`[OpenAI] Request sent, awaiting response...`);
      const result = response.choices[0]?.message?.content || '{"property":"","parties":"","dates":"","contingencies":"","otherDetails":"Unable to summarize contract."}'; 
      console.log(`[OpenAI] Response received, length: ${result.length} characters`);
      console.log(`[OpenAI] First 200 chars of response: ${result.substring(0, 200)}...`);
      return result;
    } 
    // For larger contracts, chunk and process in parts
    else {
      console.log(`[OpenAI] Contract too large, splitting into chunks...`);
      // Use the limited text for chunking to stay within rate limits
      // Chunk and strictly enforce max tokens per chunk
      let chunks = chunkText(limitedText, MAX_TOKENS_PER_CHUNK);
      // Truncate any chunk that is too large
      chunks = chunks.map(chunk => truncateToMaxTokens(chunk, MAX_TOKENS_PER_CHUNK));
      console.log(`[OpenAI] Split contract into ${chunks.length} chunks (max ${MAX_TOKENS_PER_CHUNK} tokens each)`);
      let summaries: string[] = [];
      
      // Process each chunk with retry logic
      for (let i = 0; i < chunks.length; i++) {
        console.log(`[OpenAI] Processing chunk ${i+1} of ${chunks.length}...`);
        
        let retries = 0;
        const maxRetries = 3;
        let response;
        
        while (retries <= maxRetries) {
          try {
            // Add delay between chunks to avoid rate limits
            if (i > 0) {
              const delayMs = isGpt4 ? 5000 : 2000; // Longer delay for GPT-4
              console.log(`[OpenAI] Adding delay of ${delayMs}ms before processing next chunk...`);
              await new Promise(resolve => setTimeout(resolve, delayMs));
            }
            
            response = await openai.chat.completions.create({
          model,
          messages: [
            {
              role: 'system',
              content: `You are a real estate legal expert. Analyze this section of a contract thoroughly and extract ONLY ACTUAL information in JSON format with these keys: property (address, type, details), parties (names, contacts), dates (all deadlines), contingencies (all conditions), and otherDetails (price, terms, etc). NEVER generate fake data or placeholder information. Be specific and thorough, using only information explicitly stated in the contract. If information isn't found, state 'Information not provided in contract'. Format as valid JSON.    
IMPORTANT:
1. Extract ONLY ACTUAL information from the contract text - NEVER generate fake data
2. Be thorough and specific - include exact numbers, dates, names, and detailed conditions as they appear in the contract
3. Format the response as valid JSON
4. Do NOT include phrases like 'simulated extraction', 'example data', or any placeholder information
5. If specific information isn't found in the contract, state that directly (e.g., 'No specific contingencies mentioned in this section')
6. NEVER invent property details, party names, dates, or any other information not explicitly stated in the contract
7. Leave fields empty or state 'Information not provided in contract' rather than generating fictional content
`,
            },
            {
              role: 'user',
              content: `Analyze this section of the real estate contract and extract detailed information about property details, parties involved, critical dates, contingencies, and other important terms: ${chunks[i]}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 800,
          response_format: { type: "json_object" }
        });
        
            const summary = response.choices[0]?.message?.content || `Unable to summarize part ${i+1}.`;
            console.log(`[OpenAI] Chunk ${i+1} summary received, length: ${summary.length} characters`);
            console.log(`[OpenAI] Chunk ${i+1} first 200 chars: ${summary.substring(0, 200)}...`);
            summaries.push(summary);
            break; // Success, exit retry loop
          } catch (error: any) {
            if (error?.status === 429) {
              // Rate limit error, extract retry-after if available
              const retryAfter = error?.headers?.['retry-after'] ? 
                parseInt(error.headers['retry-after']) * 1000 : 
                Math.pow(2, retries) * 1000; // Exponential backoff
              
              retries++;
              if (retries <= maxRetries) {
                console.log(`[OpenAI] Rate limit hit, retrying in ${retryAfter/1000}s... (Attempt ${retries} of ${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, retryAfter));
              } else {
                console.error(`[OpenAI] Rate limit hit and max retries exceeded for chunk ${i+1}`);
                throw error;
              }
            } else {
              // Other error, don't retry
              throw error;
            }
          }
        }
      }
      
      // If we have multiple summaries, combine them
      if (summaries.length > 1) {
        const combinedSummary = summaries.join('\n\n');
        console.log(`[OpenAI] Combined ${summaries.length} chunk summaries, total length: ${combinedSummary.length}`);
        
        // Create a final summary of summaries as JSON with retry logic
        console.log(`[OpenAI] Sending final consolidation request...`);
        
        let retries = 0;
        const maxRetries = 3;
        let finalResponse;
        
        while (retries <= maxRetries) {
          try {
            // Add delay before final request to avoid rate limits
            const delayMs = isGpt4 ? 8000 : 3000; // Longer delay for GPT-4
            console.log(`[OpenAI] Adding delay of ${delayMs}ms before final consolidation...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
            
            finalResponse = await openai.chat.completions.create({
          model,
          messages: [
            {
              role: 'system',
              content: `You are a real estate legal expert. Create a comprehensive and detailed JSON summary from these section summaries with the following structure:
{
  "property": "Provide a comprehensive description of the property including full address, property type, lot size, building size, number of rooms, and any other specific property details mentioned in the contract.",
  "parties": "Include complete details about all parties involved: full names of buyers and sellers, their contact information if available, representatives, agents, brokers, and any other individuals or entities mentioned in the contract.",
  "dates": "List ALL critical dates with their specific deadlines: contract acceptance date, inspection period start/end, financing contingency deadline, appraisal deadline, title review period, closing date, possession date, and any other timeframes mentioned.",
  "contingencies": "Detail ALL contingencies with their specific terms: financing (including loan amount, interest rate targets), inspection requirements, appraisal conditions, title contingencies, sale of buyer's property if applicable, and any other conditions that must be met.",
  "otherDetails": "Include all other important contract terms: purchase price, earnest money amount, closing cost allocations, included/excluded fixtures and appliances, special provisions, addenda, and any unique terms specific to this transaction."
}

IMPORTANT:
1. Combine and consolidate ONLY ACTUAL information from the different sections - NEVER generate fake data
2. Be thorough and specific - include exact numbers, dates, names, and detailed conditions as they appear in the contract
3. Format the response as valid JSON with these exact keys
4. Do NOT include phrases like 'simulated extraction', 'example data', or any placeholder information
5. If specific information isn't found in the contract, state that directly (e.g., 'No specific contingencies mentioned in the contract')
6. NEVER invent property details, party names, dates, or any other information not explicitly stated in the contract
7. Leave fields empty or state 'Information not provided in contract' rather than generating fictional content`,
            },
            {
              role: 'user',
              content: `Create a comprehensive and detailed JSON summary from these section summaries of a real estate contract: ${combinedSummary}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 800,
          response_format: { type: "json_object" }
        });
        
            const finalResult = finalResponse.choices[0]?.message?.content || '{"property":"","parties":"","dates":"","contingencies":"","otherDetails":"Unable to create final contract summary."}';
            console.log(`[OpenAI] Final consolidated response received, length: ${finalResult.length} characters`);
            console.log(`[OpenAI] Final response first 200 chars: ${finalResult.substring(0, 200)}...`);
            return finalResult;
          } catch (error: any) {
            if (error?.status === 429) {
              // Rate limit error, extract retry-after if available
              const retryAfter = error?.headers?.['retry-after'] ? 
                parseInt(error.headers['retry-after']) * 1000 : 
                Math.pow(2, retries) * 1000; // Exponential backoff
              
              retries++;
              if (retries <= maxRetries) {
                console.log(`[OpenAI] Rate limit hit on final request, retrying in ${retryAfter/1000}s... (Attempt ${retries} of ${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, retryAfter));
              } else {
                console.error(`[OpenAI] Rate limit hit and max retries exceeded for final consolidation`);
                throw error;
              }
            } else {
              // Other error, don't retry
              throw error;
            }
          }
        }
      } else {
        console.log(`[OpenAI] Only one chunk processed, using its summary directly`);
        console.log(`[OpenAI] Summary first 200 chars: ${summaries[0].substring(0, 200)}...`);
        return summaries[0];
      }
    }
  } catch (error) {
    console.error('[OpenAI] Error summarizing contract:', error);
    console.trace('[OpenAI] Error stack trace:');
    throw new Error('Failed to summarize contract');
  }
  
  // This line should never be reached due to returns in the try block
  // or the error being thrown in the catch block, but adding for TypeScript
  return "Error: Unable to generate contract summary";
}
