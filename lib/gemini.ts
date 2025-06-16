import axios from 'axios';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyD-Q1ShygCRASetGcYQGO8Bmw7rdmfekGo';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

export async function summarizeContractGemini(contractText: string): Promise<string> {
  // Gemini prompt (mirrors OpenAI prompt for compatibility)
  const prompt = `You are a real estate legal expert. Analyze this contract thoroughly and return a detailed JSON object with the following structure:\n{\n  "property": "Provide a comprehensive description of the property including full address, property type, lot size, building size, number of rooms, and any other specific property details mentioned in the contract.",\n  "parties": "Include complete details about all parties involved: full names of buyers and sellers, their contact information if available, representatives, agents, brokers, and any other individuals or entities mentioned in the contract.",\n  "dates": "List ALL critical dates with their specific deadlines: contract acceptance date, inspection period start/end, financing contingency deadline, appraisal deadline, title review period, closing date, possession date, and any other timeframes mentioned.",\n  "contingencies": "Detail ALL contingencies with their specific terms: financing (including loan amount, interest rate targets), inspection requirements, appraisal conditions, title contingencies, sale of buyer's property if applicable, and any other conditions that must be met.",\n  "otherDetails": "Include all other important contract terms: purchase price, earnest money amount, closing cost allocations, included/excluded fixtures and appliances, special provisions, addenda, and any unique terms specific to this transaction."
}\nIMPORTANT:\n1. Extract ONLY ACTUAL information from the contract text - NEVER generate fake data\n2. Be thorough and specific - include exact numbers, dates, names, and detailed conditions as they appear in the contract\n3. Format the response as valid JSON with these exact keys\n4. Do NOT include phrases like 'simulated extraction', 'example data', or any placeholder information\n5. If specific information isn't found in the contract, state that directly (e.g., 'No specific contingencies mentioned in the contract')\n6. NEVER invent property details, party names, dates, or any other information not explicitly stated in the contract\n7. Leave fields empty or state 'Information not provided in contract' rather than generating fictional content`;

  // Truncate contract to 10,000 chars for Gemini API
  const maxChars = 10000;
  const truncatedText = contractText.length > maxChars ? contractText.substring(0, maxChars) : contractText;
  if (contractText.length > maxChars) {
    console.log(`[Gemini] Truncated contract text from ${contractText.length} to ${maxChars} characters to avoid rate limits/errors.`);
  }

  let retries = 0;
  const maxRetries = 3;
  while (retries <= maxRetries) {
    try {
      const response = await axios.post(GEMINI_API_URL + `?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                { text: truncatedText }
              ]
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 120000
        }
      );

      // Gemini returns response in a different format
      const candidates = response.data.candidates;
      if (candidates && candidates.length > 0) {
        // The content is in candidates[0].content.parts[0].text
        const geminiSummary = candidates[0].content.parts[0].text;
        return geminiSummary;
      } else {
        throw new Error('No summary returned from Gemini');
      }
    } catch (error: any) {
      if (error.response && error.response.status === 429) {
        // Rate limit, exponential backoff
        const delay = Math.pow(2, retries) * 2000; // 2s, 4s, 8s, 16s
        console.error(`[Gemini] 429 Rate limit hit. Retrying in ${delay/1000}s... (Attempt ${retries+1} of ${maxRetries+1})`);
        if (error.response.data && error.response.data.error) {
          console.error('[Gemini] Error details:', error.response.data.error);
        }
        await new Promise(res => setTimeout(res, delay));
        retries++;
        continue;
      } else {
        console.error('[Gemini] Error summarizing contract:', error);
        if (error.response && error.response.data) {
          console.error('[Gemini] Error details:', error.response.data);
        }
        throw new Error('Failed to summarize contract with Gemini');
      }
    }
  }
  throw new Error('Failed to summarize contract with Gemini after retries');
}

