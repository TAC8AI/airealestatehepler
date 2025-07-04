'use client';

import { supabase } from '@/lib/supabase';

/**
 * PDF Upload and Analysis Utilities
 * Handles PDF file uploads and sends them to GPT-4o Vision for analysis
 */

export type ContractType = 'purchase' | 'listing' | 'lease';

export interface PDFAnalysisResult {
  success: boolean;
  data?: any;  // For the frontend response format
  extractedData?: any;  // For backward compatibility
  confidence: number;
  analysisMethod: string;
  fileName: string;
  contractType: ContractType;
  processingTime: number;
  error?: string;
  details?: string;
  savedToDatabase?: boolean;
  contractId?: string;
}

/**
 * Upload and analyze a PDF contract using GPT-4o Vision
 * @param file The PDF file to analyze
 * @param contractType The type of contract to analyze
 * @returns Promise resolving to analysis results
 */
export async function analyzePDFContract(
  file: File, 
  contractType: ContractType
): Promise<PDFAnalysisResult> {
  try {
    console.log(`[PDF Upload] Starting analysis of ${file.name} as ${contractType} contract`);
    
    // Validate file type
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('Only PDF files are supported for Files API analysis. Please upload a PDF file.');
    }
    
    // Validate file size (max 20MB for Files API)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      throw new Error('PDF file is too large. Please use a file smaller than 20MB.');
    }
    
    // Create form data for upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('contractType', contractType);
    formData.append('fileName', file.name);
    
    // Get user session for authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Please log in to use contract analysis');
    }
    
    // Add user ID to form data
    formData.append('userId', session.user.id);
    console.log(`[PDF Upload] Adding user ID to request: ${session.user.id}`);
    
    console.log(`[PDF Upload] Sending ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) to Supabase Edge Function`);
    
    // Call Supabase Edge Function
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const functionUrl = `${supabaseUrl}/functions/v1/Contract-Analysis`;
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: formData,
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'PDF analysis failed');
    }
    
    console.log(`[PDF Upload] Analysis completed successfully via Supabase Edge Function`);
    
    // Transform the response to match the expected format
    return {
      success: result.success,
      data: result.extractedData,
      confidence: result.confidence,
      analysisMethod: result.analysisMethod,
      fileName: result.fileName,
      contractType: result.contractType,
      processingTime: result.processingTime,
      savedToDatabase: result.savedToDatabase,
      contractId: result.contractId
    };
    
  } catch (error) {
    console.error('[PDF Upload] Error analyzing PDF:', error);
    
    return {
      success: false,
      data: {},
      confidence: 0,
      analysisMethod: 'GPT-4o Files API v2 - Supabase Edge Function (Failed)',
      fileName: file.name,
      contractType,
      processingTime: Date.now(),
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: 'PDF analysis failed. You can try copying and pasting the text instead.'
    };
  }
}

/**
 * Check if a file is a valid PDF
 * @param file The file to check
 * @returns boolean indicating if it's a PDF
 */
export function isPDFFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

/**
 * Format file size for display
 * @param bytes File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get upload progress message based on file size
 * @param fileSize File size in bytes
 * @returns Progress message for user
 */
export function getUploadMessage(fileSize: number): string {
  const sizeMB = fileSize / (1024 * 1024);
  
  if (sizeMB < 1) {
    return 'Analyzing PDF with GPT-4o Files API...';
  } else if (sizeMB < 5) {
    return 'Processing PDF (this may take 10-20 seconds)...';
  } else {
    return 'Analyzing large PDF (this may take 30-60 seconds)...';
  }
} 