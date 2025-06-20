import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    // Initialize OpenAI client only when the API is called
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { address } = await request.json();

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    // System prompt for the AI analyst
    const systemPrompt = `You are a crisp, data-driven real-estate analyst. Keep it under 150 words.

Your task is to analyze the property address provided and return a valuation analysis. You should research or make educated estimates about:
- Property details (beds, baths, square footage, lot size, year built)
- Recent comparable sales in the area
- Market trends and neighborhood factors
- Income potential if applicable
- Construction/replacement costs

Return your response in this exact JSON format:
{
  "headline_range": "A clear price range like '$450,000 - $575,000'",
  "reasoning": "One detailed sentence explaining your valuation methodology and key factors",
  "caution": "One sentence highlighting the most important risk or limitation of this analysis",
  "confidence_score": 0.75
}

Be professional, realistic, and acknowledge data limitations. Base estimates on typical market patterns for the area.`;

    const userPrompt = `Analyze this property address: ${address}

Please provide a comprehensive valuation analysis including estimated value range, reasoning, and important cautions.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.1,
      max_tokens: 500,
    });

    const response = completion.choices[0].message.content;
    
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Try to parse the JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response);
    } catch (parseError) {
      // If JSON parsing fails, create a structured response from the text
      console.warn('Failed to parse JSON response, creating structured response');
      parsedResponse = {
        headline_range: "Analysis Available",
        reasoning: response.substring(0, 200) + "...",
        caution: "This analysis is based on limited data and should be verified with local market expertise.",
        confidence_score: 0.6
      };
    }

    // Validate the response has required fields
    if (!parsedResponse.headline_range || !parsedResponse.reasoning || !parsedResponse.caution) {
      throw new Error('Invalid response format from AI');
    }

    return NextResponse.json(parsedResponse);

  } catch (error) {
    console.error('Error in property valuation:', error);
    
    return NextResponse.json(
      { error: 'Failed to analyze property. Please try again.' },
      { status: 500 }
    );
  }
} 