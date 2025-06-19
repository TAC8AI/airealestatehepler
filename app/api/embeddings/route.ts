import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { processLargeContract, intelligentChunkContract } from '@/lib/contract-chunking';

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
    
    const { 
      text, 
      query = "Extract key contract information including parties, terms, dates, and financial details", 
      maxChunks = 5,
      maxTokens = 100000
    } = body;
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text parameter is required' },
        { status: 400 }
      );
    }

    // Sanitize input text
    const sanitizedText = sanitizeText(text);
    const sanitizedQuery = sanitizeText(query);
    
    console.log(`[API] Processing text of length ${sanitizedText.length}`);
    
    try {
      // Generate embedding for the query
      const queryEmbedding = await generateEmbeddings(sanitizedQuery);
      
      // Use intelligent contract processing for better chunking
      const contractProcessing = await processLargeContract(sanitizedText, maxTokens);
      const { chunks, strategy, coverage } = contractProcessing;
      
      console.log(`[API] Using strategy: ${strategy}, coverage: ${(coverage * 100).toFixed(1)}%`);
      console.log(`[API] Generated ${chunks.length} intelligent chunks`);
      
      // Sort chunks by importance and process the most important ones first
      const sortedChunks = chunks
        .sort((a, b) => b.importance - a.importance)
        .slice(0, Math.min(chunks.length, 30)); // Limit to top 30 chunks
      
      console.log(`[API] Processing top ${sortedChunks.length} chunks by importance`);
      
      // Generate embeddings for chunks in batches
      const batchSize = 5;
      const chunkEmbeddings = [];
      
      for (let i = 0; i < sortedChunks.length; i += batchSize) {
        const batch = sortedChunks.slice(i, i + batchSize);
        
        try {
          const batchPromises = batch.map(chunk => generateEmbeddings(chunk.text));
          const batchResults = await Promise.all(batchPromises);
          chunkEmbeddings.push(...batchResults);
          
          // Add delay between batches to respect rate limits
          if (i + batchSize < sortedChunks.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          console.error(`Error processing batch ${i}-${i+batchSize}:`, error);
          // Continue with the chunks we've processed so far
          break;
        }
      }
      
      // Calculate similarity scores
      const similarities = chunkEmbeddings.map((embedding, index) => ({
        score: cosineSimilarity(embedding, queryEmbedding),
        chunk: sortedChunks[index],
        index
      }));
      
      // Get top chunks by similarity, but also consider importance
      const scoredChunks = similarities.map(item => ({
        ...item,
        combinedScore: item.score * 0.7 + (item.chunk.importance / 5) * 0.3 // Weight similarity more than importance
      }));
      
      // Sort by combined score and get top chunks
      const topChunks = scoredChunks
        .sort((a, b) => b.combinedScore - a.combinedScore)
        .slice(0, maxChunks);
      
      // Sort by original document order for better readability
      const orderedChunks = topChunks.sort((a, b) => a.index - b.index);
      
      // Create relevantText with section headers for better context
      const relevantText = orderedChunks.map(item => {
        const section = item.chunk.section !== 'unknown' ? `[${item.chunk.section}]\n` : '';
        return section + item.chunk.text;
      }).join('\n\n---\n\n');
      
      const sanitizedRelevantText = sanitizeText(relevantText);
      
      console.log(`[API] Selected ${orderedChunks.length} most relevant chunks`);
      console.log(`[API] Average importance score: ${(orderedChunks.reduce((sum, c) => sum + c.chunk.importance, 0) / orderedChunks.length).toFixed(2)}`);
      console.log(`[API] Average similarity score: ${(orderedChunks.reduce((sum, c) => sum + c.score, 0) / orderedChunks.length).toFixed(3)}`);
      
      return NextResponse.json({
        relevantText: sanitizedRelevantText,
        chunkCount: chunks.length,
        processedChunks: sortedChunks.length,
        selectedChunks: orderedChunks.length,
        originalLength: text.length,
        relevantLength: sanitizedRelevantText.length,
        strategy,
        coverage,
        averageImportance: orderedChunks.reduce((sum, c) => sum + c.chunk.importance, 0) / orderedChunks.length,
        averageSimilarity: orderedChunks.reduce((sum, c) => sum + c.score, 0) / orderedChunks.length
      });
      
    } catch (embeddingError: any) {
      console.error('Error generating embeddings:', embeddingError);
      
      // Enhanced fallback with intelligent chunking
      console.log('[API] Using intelligent chunking fallback');
      const fallbackChunks = intelligentChunkContract(sanitizedText, {
        chunkSize: 2000,
        overlap: 400,
        preserveSections: true
      });
      
      // Take the most important chunks as fallback
      const topFallbackChunks = fallbackChunks
        .sort((a, b) => b.importance - a.importance)
        .slice(0, maxChunks);
      
      const fallbackText = topFallbackChunks
        .map(chunk => {
          const section = chunk.section !== 'unknown' ? `[${chunk.section}]\n` : '';
          return section + chunk.text;
        })
        .join('\n\n---\n\n');
      
      const sanitizedFallbackText = sanitizeText(fallbackText);
      
      return NextResponse.json({
        relevantText: sanitizedFallbackText,
        chunkCount: fallbackChunks.length,
        processedChunks: fallbackChunks.length,
        selectedChunks: topFallbackChunks.length,
        originalLength: text.length,
        relevantLength: sanitizedFallbackText.length,
        strategy: 'intelligent_fallback',
        coverage: Math.min(sanitizedFallbackText.length / sanitizedText.length, 1),
        error: 'Embeddings failed, used intelligent fallback'
      });
    }
  } catch (error: any) {
    console.error('Error in embeddings API:', error);
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}
