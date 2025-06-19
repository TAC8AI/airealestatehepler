'use client';

/**
 * PDF Upload and Analysis Utilities
 * Handles PDF file uploads and sends them to GPT-4o Vision for analysis
 */

export type ContractType = 'purchase' | 'listing' | 'lease';

export interface PDFAnalysisResult {
  success: boolean;
  extractedData: any;
  confidence: number;
  analysisMethod: string;
  fileName: string;
  contractType: ContractType;
  processingTime: number;
  error?: string;
  details?: string;
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
    
    console.log(`[PDF Upload] Sending ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) to Files API`);
    
    // Send to our PDF analysis endpoint
    const response = await fetch('/api/contract-analysis-pdf', {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'PDF analysis failed');
    }
    
    console.log(`[PDF Upload] Analysis completed successfully`);
    return result;
    
  } catch (error) {
    console.error('[PDF Upload] Error analyzing PDF:', error);
    
    return {
      success: false,
      extractedData: {},
      confidence: 0,
      analysisMethod: 'GPT-4o Files API (Failed)',
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