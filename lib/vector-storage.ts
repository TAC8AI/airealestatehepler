/**
 * Vector storage using Supabase for caching embeddings
 * This dramatically improves performance for repeated contract analysis
 */

import { supabase } from './supabase';
import crypto from 'crypto';

interface StoredEmbedding {
  id: string;
  content_hash: string;
  chunk_text: string;
  section: string;
  importance_score: number;
  embedding: number[];
  created_at: string;
  user_id?: string;
}

/**
 * Generate a hash for content to use as cache key
 */
function generateContentHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Store embeddings in Supabase for future reuse
 */
export async function storeEmbeddings(
  chunks: Array<{
    text: string;
    section: string;
    importance: number;
    embedding: number[];
  }>,
  userId?: string
): Promise<void> {
  try {
    const embeddingsToStore = chunks.map(chunk => ({
      content_hash: generateContentHash(chunk.text),
      chunk_text: chunk.text.slice(0, 1000), // Store first 1000 chars for reference
      section: chunk.section,
      importance_score: chunk.importance,
      embedding: chunk.embedding,
      user_id: userId
    }));

    const { error } = await supabase
      .from('contract_embeddings')
      .upsert(embeddingsToStore, { 
        onConflict: 'content_hash',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error('Error storing embeddings:', error);
    } else {
      console.log(`[Vector Storage] Stored ${embeddingsToStore.length} embeddings`);
    }
  } catch (error) {
    console.error('Error in storeEmbeddings:', error);
  }
}

/**
 * Retrieve cached embeddings from Supabase
 */
export async function getCachedEmbeddings(
  chunks: Array<{
    text: string;
    section: string;
    importance: number;
  }>
): Promise<{
  cached: Array<{
    text: string;
    section: string;
    importance: number;
    embedding: number[];
  }>;
  missing: Array<{
    text: string;
    section: string;
    importance: number;
  }>;
}> {
  try {
    const contentHashes = chunks.map(chunk => generateContentHash(chunk.text));
    
    const { data: cachedEmbeddings, error } = await supabase
      .from('contract_embeddings')
      .select('content_hash, embedding, section, importance_score')
      .in('content_hash', contentHashes);

    if (error) {
      console.error('Error retrieving cached embeddings:', error);
      return { cached: [], missing: chunks };
    }

    const cachedMap = new Map(
      cachedEmbeddings?.map(item => [
        item.content_hash, 
        {
          embedding: item.embedding,
          section: item.section,
          importance_score: item.importance_score
        }
      ]) || []
    );

    const cached = [];
    const missing = [];

    for (const chunk of chunks) {
      const hash = generateContentHash(chunk.text);
      const cachedItem = cachedMap.get(hash);
      
      if (cachedItem) {
        cached.push({
          text: chunk.text,
          section: chunk.section,
          importance: chunk.importance,
          embedding: cachedItem.embedding
        });
      } else {
        missing.push(chunk);
      }
    }

    console.log(`[Vector Storage] Found ${cached.length} cached, ${missing.length} missing embeddings`);
    return { cached, missing };
  } catch (error) {
    console.error('Error in getCachedEmbeddings:', error);
    return { cached: [], missing: chunks };
  }
}

/**
 * Search for similar contract sections using vector similarity
 */
export async function searchSimilarSections(
  queryEmbedding: number[],
  limit: number = 10,
  minSimilarity: number = 0.7,
  userId?: string
): Promise<Array<{
  text: string;
  section: string;
  similarity: number;
  importance: number;
}>> {
  try {
    // Use Supabase's pgvector extension for similarity search
    const { data, error } = await supabase
      .rpc('search_similar_embeddings', {
        query_embedding: queryEmbedding,
        match_threshold: minSimilarity,
        match_count: limit,
        user_id_filter: userId
      });

    if (error) {
      console.error('Error searching similar sections:', error);
      return [];
    }

    return data?.map((item: any) => ({
      text: item.chunk_text,
      section: item.section,
      similarity: item.similarity,
      importance: item.importance_score
    })) || [];
  } catch (error) {
    console.error('Error in searchSimilarSections:', error);
    return [];
  }
}

/**
 * Clean up old embeddings to manage storage
 */
export async function cleanupOldEmbeddings(daysOld: number = 30): Promise<void> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { error } = await supabase
      .from('contract_embeddings')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      console.error('Error cleaning up old embeddings:', error);
    } else {
      console.log('[Vector Storage] Cleaned up old embeddings');
    }
  } catch (error) {
    console.error('Error in cleanupOldEmbeddings:', error);
  }
}

/**
 * Get analytics on stored embeddings
 */
export async function getEmbeddingStats(userId?: string): Promise<{
  totalEmbeddings: number;
  sectionsCount: number;
  averageImportance: number;
  storageUsed: number; // in MB
}> {
  try {
    let query = supabase
      .from('contract_embeddings')
      .select('section, importance_score, chunk_text');

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error getting embedding stats:', error);
      return {
        totalEmbeddings: 0,
        sectionsCount: 0,
        averageImportance: 0,
        storageUsed: 0
      };
    }

    const sections = new Set(data?.map(item => item.section) || []);
    const totalImportance = data?.reduce((sum, item) => sum + item.importance_score, 0) || 0;
    const storageUsed = data?.reduce((sum, item) => sum + (item.chunk_text?.length || 0), 0) || 0;

    return {
      totalEmbeddings: data?.length || 0,
      sectionsCount: sections.size,
      averageImportance: totalImportance / (data?.length || 1),
      storageUsed: storageUsed / (1024 * 1024) // Convert to MB
    };
  } catch (error) {
    console.error('Error in getEmbeddingStats:', error);
    return {
      totalEmbeddings: 0,
      sectionsCount: 0,
      averageImportance: 0,
      storageUsed: 0
    };
  }
} 