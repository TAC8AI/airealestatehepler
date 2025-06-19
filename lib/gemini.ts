import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('Missing Gemini API key');
}

const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Analyze contract with Gemini 2.5 Flash (for large documents)
 */
export async function analyzeWithGemini(
  systemPrompt: string, 
  userPrompt: string, 
  contractText: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const fullPrompt = `${systemPrompt}

${userPrompt}${contractText}
>>>`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
      },
    });

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('[Gemini 2.5 Flash] Error:', error);
    throw new Error(`Gemini 2.5 Flash analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Test function to verify Gemini 2.5 Flash is working
 */
export async function testGeminiFlash(): Promise<{ success: boolean; message: string; model: string }> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const testPrompt = `You are a helpful assistant. Please respond with exactly this JSON format:
{"test": "success", "model": "gemini-2.5-flash", "message": "Hello from Gemini 2.5 Flash!"}`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: testPrompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 100,
      },
    });

    const response = await result.response;
    const text = response.text();
    
    return {
      success: true,
      message: `Gemini 2.5 Flash is working! Response: ${text}`,
      model: 'gemini-2.5-flash'
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Gemini 2.5 Flash test failed: ${error.message}`,
      model: 'gemini-2.5-flash'
    };
  }
}

