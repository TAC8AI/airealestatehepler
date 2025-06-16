/**
 * Utility functions for handling file uploads and processing
 */

/**
 * Extracts text content from a file
 * Currently supports plain text files only
 * In a production app, this would handle PDF, DOC, DOCX extraction
 */
export async function extractTextFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text);
      };
      
      reader.onerror = (e) => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Validates file size and type
 */
export function validateFile(file: File, options: { 
  maxSizeMB?: number;
  allowedTypes?: string[];
}): { valid: boolean; error?: string } {
  const { maxSizeMB = 5, allowedTypes = ['text/plain', 'application/pdf'] } = options;
  
  // Check file size
  const fileSizeInMB = file.size / (1024 * 1024);
  if (fileSizeInMB > maxSizeMB) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`
    };
  }
  
  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not supported. Allowed types: ${allowedTypes.join(', ')}`
    };
  }
  
  return { valid: true };
}

/**
 * Truncates text to a specified length if needed
 */
export function truncateText(text: string, maxLength: number = 8000): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength) + '... [content truncated due to length]';
}
