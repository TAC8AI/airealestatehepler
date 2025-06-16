import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Use proper server-side environment variable access
// Note: In Next.js API routes, we can access process.env directly without NEXT_PUBLIC_ prefix
const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
const openai = new OpenAI({ apiKey });

// Sanitize text to remove problematic characters for database storage
function sanitizeText(text: string): string {
  if (!text) return '';
  return text.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
}

/**
 * Generate embeddings for a text using OpenAI's text-embedding-3-small model
 */
async function generateEmbeddings(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float",
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embeddings:", error);
    throw new Error("Failed to generate embeddings");
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magA * magB);
}

/**
 * Split text into chunks of roughly equal size
 * Using a much smaller chunk size to avoid token limits
 */
function chunkText(text: string, chunkSize: number = 300): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split('\n').filter(p => p.trim().length > 0);
  
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    // If paragraph itself is longer than chunk size, split it further
    if (paragraph.length > chunkSize) {
      // If we have accumulated content, add it as a chunk first
      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = '';
      }
      
      // Split long paragraph into smaller pieces
      let i = 0;
      while (i < paragraph.length) {
        chunks.push(paragraph.slice(i, i + chunkSize));
        i += chunkSize;
      }
      continue;
    }
    
    // Normal case - add paragraph to current chunk or start new chunk
    if (currentChunk.length + paragraph.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = '';
    }
    currentChunk += paragraph + '\n';
  }
  
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

export async function POST(request: Request) {
  try {
    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error('Error parsing request JSON:', e);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    const { text, query = "Extract key contract information including parties, terms, dates, and financial details", maxChunks = 5 } = body;
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text parameter is required' },
        { status: 400 }
      );
    }

    // Sanitize input text to remove problematic characters
    const sanitizedText = sanitizeText(text);
    const sanitizedQuery = sanitizeText(query);
    
    console.log(`[API] Processing text of length ${sanitizedText.length}`);
    
    try {
      // Generate embedding for the query
      const queryEmbedding = await generateEmbeddings(sanitizedQuery);
      
      // Split text into chunks - use smaller chunks to avoid token limits
      const chunks = chunkText(sanitizedText);
      console.log(`[API] Split text into ${chunks.length} chunks`);
      
      // For very large documents, limit the number of chunks to process
      // to avoid API rate limits and timeouts
      // Reduce max chunks for very large documents
      const maxChunksToProcess = sanitizedText.length > 500000 ? 20 : Math.min(chunks.length, 50);
      const processedChunks = chunks.slice(0, maxChunksToProcess);
      
      if (maxChunksToProcess < chunks.length) {
        console.log(`[API] Limited processing to ${maxChunksToProcess} of ${chunks.length} chunks`);
      }
      
      // For extremely large texts, we need to be even more aggressive with limiting chunks
      // OpenAI has a limit of 300k tokens per request
      const maxTokenEstimate = sanitizedText.length / 3; // Rough estimate: ~3 chars per token
      const maxSafeChunks = maxTokenEstimate > 250000 ? 10 : processedChunks.length;
      
      // Generate embeddings for each chunk (in batches to avoid rate limits)
      const batchSize = 3; // Reduce batch size for large documents
      const chunkEmbeddings = [];
      
      // Process only a safe number of chunks
      const safeChunks = processedChunks.slice(0, maxSafeChunks);
      console.log(`[API] Processing ${safeChunks.length} chunks safely (estimated tokens: ~${maxTokenEstimate})`); 
      
      for (let i = 0; i < safeChunks.length; i += batchSize) {
        const batch = safeChunks.slice(i, i + batchSize);
        
        try {
          const batchPromises = batch.map(chunk => generateEmbeddings(chunk));
          const batchResults = await Promise.all(batchPromises);
          chunkEmbeddings.push(...batchResults);
          
          // Add a larger delay between batches for very large documents
          if (i + batchSize < safeChunks.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error) {
          console.error(`Error processing batch ${i}-${i+batchSize}:`, error);
          // Continue with the chunks we've processed so far
          break;
        }
      }
      
      // Calculate similarity scores
      const similarities = chunkEmbeddings.map(embedding => 
        cosineSimilarity(embedding, queryEmbedding)
      );
      
      // Get indices of top chunks by similarity
      const topIndices = similarities
        .map((score, i) => ({ score, index: i }))
        .sort((a, b) => b.score - a.score)
        .slice(0, maxChunks)
        .map(item => item.index);
      
      // Sort indices to maintain original document order
      topIndices.sort((a, b) => a - b);
      
      // Join the most relevant chunks
      const relevantText = topIndices.map(i => processedChunks[i]).join('\n\n');
      
      // Final sanitization of output
      const sanitizedRelevantText = sanitizeText(relevantText);
      
      console.log(`[API] Selected ${topIndices.length} most relevant chunks`);
      
      return NextResponse.json({
        relevantText: sanitizedRelevantText,
        chunkCount: chunks.length,
        processedChunks: processedChunks.length,
        selectedChunks: topIndices.length,
        originalLength: text.length,
        relevantLength: sanitizedRelevantText.length
      });
    } catch (embeddingError: any) {
      console.error('Error generating embeddings:', embeddingError);
      
      // Fallback to simple text truncation if embeddings fail
      const truncatedText = sanitizedText.slice(0, 15000);
      return NextResponse.json({
        relevantText: truncatedText,
        chunkCount: 1,
        processedChunks: 1,
        selectedChunks: 1,
        originalLength: text.length,
        relevantLength: truncatedText.length,
        fallback: true,
        error: embeddingError.message || 'Failed to generate embeddings'
      });
    }
  } catch (error: any) {
    console.error('Error in embeddings API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process text' },
      { status: 500 }
    );
  }
}
