/**
 * Extract the most relevant chunks of text based on a query using our server-side API
 */
export async function extractRelevantText(
  fullText: string, 
  query: string = "Extract key contract information including parties, terms, dates, and financial details", 
  maxChunks: number = 5
): Promise<string> {
  try {
    console.log(`[Embeddings] Processing text of length ${fullText.length}`);
    
    // Call our server-side API endpoint instead of processing directly in the browser
    const response = await fetch('/api/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: fullText,
        query,
        maxChunks
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${errorData.error || response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`[Embeddings] API processed ${data.chunkCount} chunks and selected ${data.selectedChunks}`);
    console.log(`[Embeddings] Reduced text from ${data.originalLength} to ${data.relevantLength} characters`);
    
    return data.relevantText;
  } catch (error) {
    console.error("Error extracting relevant text:", error);
    // Fallback to returning a truncated version of the full text
    console.log("[Embeddings] Falling back to simple truncation");
    return fullText.slice(0, 15000);
  }
}
