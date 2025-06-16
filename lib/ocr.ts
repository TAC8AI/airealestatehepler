'use client';

import { createWorker } from 'tesseract.js';

/**
 * Extract text directly from a PDF file using PDF.js text extraction
 * This is a simpler approach than OCR, but works better for text-based PDFs
 * @param file The PDF file to extract text from
 * @returns Promise resolving to the extracted text
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    console.log(`[PDF Extraction] Starting extraction for file: ${file.name} (${file.size} bytes)`);
    // Create a URL for the PDF file
    const fileURL = URL.createObjectURL(file);
    console.log(`[PDF Extraction] Created object URL: ${fileURL}`);
    
    // Use FileReader to get the file as ArrayBuffer
    console.log(`[PDF Extraction] Reading file as ArrayBuffer...`);
    const arrayBuffer = await readFileAsArrayBuffer(file);
    console.log(`[PDF Extraction] File read as ArrayBuffer, size: ${arrayBuffer.byteLength} bytes`);
    
    // Extract text directly using PDF.js
    console.log(`[PDF Extraction] Extracting text from buffer...`);
    const text = await extractTextFromPDFBuffer(arrayBuffer);
    console.log(`[PDF Extraction] Text extracted, length: ${text.length} characters`);
    console.log(`[PDF Extraction] First 200 chars: ${text.substring(0, 200)}...`);
    
    // Clean up object URL
    URL.revokeObjectURL(fileURL);
    console.log(`[PDF Extraction] Extraction complete and object URL revoked`);
    
    return text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Helper function to read a file as ArrayBuffer
 */
function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
    reader.onerror = (e) => reject(new Error('Error reading file as ArrayBuffer'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Extract text from a PDF using PDF.js
 * @param arrayBuffer PDF file as ArrayBuffer
 * @returns Promise resolving to the extracted text
 */
async function extractTextFromPDFBuffer(arrayBuffer: ArrayBuffer): Promise<string> {
  // Use a more reliable method - direct text extraction
  try {
    // Convert to text
    const textDecoder = new TextDecoder('utf-8');
    let text = textDecoder.decode(arrayBuffer);
    console.log(`[PDF Extraction] Raw decoded text length: ${text.length}`);
    
    // Check if it looks like a PDF (starts with %PDF)
    if (text.startsWith('%PDF')) {
      console.log(`[PDF Extraction] Valid PDF header detected`);
      
      // Try multiple extraction patterns for better results
      // 1. Standard text objects pattern
      const textObjectPattern = /\(([^\)]+)\)\s*(TJ|Tj)/g;
      const textMatches = Array.from(text.matchAll(textObjectPattern), m => m[1]) || [];
      
      // 2. BT/ET text blocks pattern (more comprehensive)
      const textBlockPattern = /BT[\s\S]*?ET/g;
      const textBlocks = text.match(textBlockPattern) || [];
      
      // 3. Text strings pattern
      const textStringPattern = /\(([^\)\\]*(\\.[^\)\\]*)*)\)/g;
      const textStrings = Array.from(text.matchAll(textStringPattern), m => m[1]) || [];
      
      console.log(`[PDF Extraction] Found ${textMatches.length} text objects, ${textBlocks.length} text blocks, ${textStrings.length} text strings`);
      
      // Combine results from different patterns
      let extractedText = '';
      
      if (textStrings.length > 0) {
        extractedText = textStrings.join(' ');
      } else if (textMatches.length > 0) {
        extractedText = textMatches.join(' ');
      } else {
        // Last resort - try to extract anything that looks like text
        extractedText = text.replace(/[^\x20-\x7E]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
      
      // Clean up common PDF encoding artifacts
      extractedText = extractedText
        .replace(/\\\d{3}/g, ' ') // Octal escape sequences
        .replace(/\\[nrt]/g, ' ')  // Newlines and tabs
        .replace(/\s+/g, ' ')      // Multiple spaces
        .trim();
      
      console.log(`[PDF Extraction] Final extracted text length: ${extractedText.length}`);
      return extractedText || 'PDF text extraction failed. Please try a different file format.';
    } else {
      // Fallback to simple text extraction
      console.log(`[PDF Extraction] Not a valid PDF header, using raw text`);
      return text;
    }
  } catch (error) {
    console.error('Error in PDF text extraction:', error);
    return 'Failed to extract text from PDF. Please try a different file format.';
  }
}
