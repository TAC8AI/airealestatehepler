'use client';

/**
 * Client-side PDF text extraction using browser-compatible methods
 * This version works in the browser without Node.js dependencies
 */

/**
 * Extract text from a PDF file using browser-compatible PDF.js
 * @param file The PDF file to extract text from
 * @returns Promise resolving to the extracted text
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    console.log(`[PDF Extraction] Starting extraction for file: ${file.name} (${file.size} bytes)`);
    
    // Dynamically import PDF.js for browser compatibility
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set up the worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    console.log(`[PDF Extraction] File converted to ArrayBuffer, size: ${arrayBuffer.byteLength} bytes`);
    
    // Load the PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    console.log(`[PDF Extraction] PDF loaded with ${pdf.numPages} pages`);
    
    let extractedText = '';
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine text items from the page
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      extractedText += pageText + '\n\n';
      
      console.log(`[PDF Extraction] Processed page ${pageNum}/${pdf.numPages}`);
    }
    
    console.log(`[PDF Extraction] Raw extracted text length: ${extractedText.length} characters`);
    
    // Clean and sanitize the extracted text
    extractedText = cleanExtractedText(extractedText);
    
    console.log(`[PDF Extraction] Cleaned text length: ${extractedText.length} characters`);
    console.log(`[PDF Extraction] First 200 chars: ${extractedText.substring(0, 200)}...`);
    
    // Validate that we got reasonable text
    if (extractedText.length < 50) {
      throw new Error('Extracted text is too short - PDF may be image-based or corrupted');
    }
    
    if (extractedText.length > 500000) { // 500KB limit
      console.warn(`[PDF Extraction] Text is very long (${extractedText.length} chars), truncating to prevent analysis issues`);
      extractedText = extractedText.substring(0, 500000) + '\n[... content truncated for analysis ...]';
    }
    
    return extractedText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Clean and sanitize extracted text to prevent database issues
 * @param text Raw extracted text
 * @returns Cleaned text safe for database storage
 */
function cleanExtractedText(text: string): string {
  if (!text) return '';
  
  // Remove null bytes and problematic Unicode characters
  let cleaned = text.replace(/\u0000/g, ''); // Remove null bytes
  cleaned = cleaned.replace(/[\u0001-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, ''); // Remove control characters
  cleaned = cleaned.replace(/[\uFEFF\uFFFE\uFFFF]/g, ''); // Remove BOM and other problematic chars
  
  // Normalize whitespace
  cleaned = cleaned.replace(/\r\n/g, '\n'); // Normalize line endings
  cleaned = cleaned.replace(/\r/g, '\n'); // Convert remaining \r to \n
  cleaned = cleaned.replace(/\t/g, ' '); // Convert tabs to spaces
  cleaned = cleaned.replace(/ +/g, ' '); // Collapse multiple spaces
  cleaned = cleaned.replace(/\n +/g, '\n'); // Remove spaces at start of lines
  cleaned = cleaned.replace(/ +\n/g, '\n'); // Remove spaces at end of lines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n'); // Collapse multiple newlines
  
  // Trim and return
  return cleaned.trim();
}

/**
 * Legacy function for OCR (kept for backwards compatibility)
 * Note: OCR is much slower and less accurate than PDF text extraction
 */
export async function extractTextWithOCR(file: File): Promise<string> {
  // Only use OCR for image files or as last resort
  console.warn('[OCR] Using OCR extraction - this is slower and less accurate than PDF text extraction');
  
  try {
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('eng');
    const { data: { text } } = await worker.recognize(file);
    await worker.terminate();
    
    return cleanExtractedText(text);
  } catch (error) {
    console.error('OCR extraction failed:', error);
    throw new Error('OCR text extraction failed');
  }
}
