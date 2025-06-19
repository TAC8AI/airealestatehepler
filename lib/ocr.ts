'use client';

/**
 * Temporary PDF/OCR functionality placeholder
 * Large dependencies removed to fix Netlify bundle size issues
 * Users can copy/paste text from PDFs as an alternative
 */

/**
 * Placeholder for PDF text extraction - functionality temporarily disabled
 * @param file The PDF file (not supported in current build)
 * @returns Promise rejecting with helpful error message
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  throw new Error(
    'PDF upload is temporarily unavailable to optimize app performance. ' +
    'Please copy and paste the text from your PDF directly into the text area instead. ' +
    'This provides the same analysis results without the large file processing overhead.'
  );
}

/**
 * Placeholder for OCR functionality - temporarily disabled
 * @param file The image file (not supported in current build)
 * @returns Promise rejecting with helpful error message
 */
export async function extractTextWithOCR(file: File): Promise<string> {
  throw new Error(
    'Image OCR is temporarily unavailable to optimize app performance. ' +
    'Please convert your image to text manually or copy/paste the contract text directly.'
  );
}

/**
 * Utility function to check if a file is a text file
 * @param file The file to check
 * @returns boolean indicating if it's a text file
 */
export function isTextFile(file: File): boolean {
  return file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt');
}

/**
 * Extract text from plain text files
 * @param file The text file to read
 * @returns Promise resolving to the file content
 */
export async function extractTextFromTextFile(file: File): Promise<string> {
  if (!isTextFile(file)) {
    throw new Error('File is not a text file');
  }
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      resolve(text || '');
    };
    reader.onerror = () => {
      reject(new Error('Failed to read text file'));
    };
    reader.readAsText(file);
  });
}
