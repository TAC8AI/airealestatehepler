/**
 * Advanced contract chunking and processing for large documents
 */

interface ContractChunk {
  id: string;
  text: string;
  section: string;
  importance: number;
  embedding?: number[];
}

interface ChunkingStrategy {
  chunkSize: number;
  overlap: number;
  preserveSections: boolean;
}

/**
 * Intelligent contract chunking that preserves document structure
 */
export function intelligentChunkContract(
  text: string, 
  strategy: ChunkingStrategy = {
    chunkSize: 1000,    // Larger chunks for better context
    overlap: 200,       // Overlap to preserve context
    preserveSections: true
  }
): ContractChunk[] {
  const chunks: ContractChunk[] = [];
  
  // First, try to identify major sections
  const sections = identifyContractSections(text);
  
  if (strategy.preserveSections && sections.length > 1) {
    // Process each section separately
    sections.forEach((section, sectionIndex) => {
      const sectionChunks = chunkTextWithOverlap(
        section.content, 
        strategy.chunkSize, 
        strategy.overlap
      );
      
      sectionChunks.forEach((chunkText, chunkIndex) => {
        chunks.push({
          id: `section-${sectionIndex}-chunk-${chunkIndex}`,
          text: chunkText,
          section: section.title,
          importance: calculateChunkImportance(chunkText, section.title)
        });
      });
    });
  } else {
    // Fallback to simple chunking
    const simpleChunks = chunkTextWithOverlap(text, strategy.chunkSize, strategy.overlap);
    simpleChunks.forEach((chunkText, index) => {
      chunks.push({
        id: `chunk-${index}`,
        text: chunkText,
        section: 'unknown',
        importance: calculateChunkImportance(chunkText)
      });
    });
  }
  
  return chunks;
}

/**
 * Identify major sections in a contract
 */
function identifyContractSections(text: string): Array<{title: string, content: string}> {
  const sections: Array<{title: string, content: string}> = [];
  
  // Common contract section patterns
  const sectionPatterns = [
    /(?:^|\n)\s*(?:ARTICLE|SECTION|PART)\s+(?:[IVXLCDM]+|\d+)[:\.\s]+([^\n]+)/gi,
    /(?:^|\n)\s*(\d+[\.\)]\s*[A-Z][^:\n]+)[:\.]/gi,
    /(?:^|\n)\s*([A-Z][A-Z\s&]{3,30})[\:\.\n]/g
  ];
  
  let lastIndex = 0;
  const sectionHeaders: Array<{title: string, index: number}> = [];
  
  // Find all section headers
  sectionPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      sectionHeaders.push({
        title: match[1].trim(),
        index: match.index
      });
    }
  });
  
  // Sort by position and create sections
  sectionHeaders.sort((a, b) => a.index - b.index);
  
  if (sectionHeaders.length > 0) {
    sectionHeaders.forEach((header, i) => {
      const nextHeaderIndex = i < sectionHeaders.length - 1 
        ? sectionHeaders[i + 1].index 
        : text.length;
      
      const content = text.slice(header.index, nextHeaderIndex).trim();
      if (content.length > 100) { // Only include substantial sections
        sections.push({
          title: header.title,
          content: content
        });
      }
    });
  }
  
  // If no sections found, treat entire document as one section
  if (sections.length === 0) {
    sections.push({
      title: 'Contract',
      content: text
    });
  }
  
  return sections;
}

/**
 * Chunk text with overlap to preserve context
 */
function chunkTextWithOverlap(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;
  
  while (start < text.length) {
    let end = Math.min(start + chunkSize, text.length);
    
    // Try to break at sentence boundaries
    if (end < text.length) {
      const lastSentence = text.lastIndexOf('.', end);
      const lastNewline = text.lastIndexOf('\n', end);
      const breakPoint = Math.max(lastSentence, lastNewline);
      
      if (breakPoint > start + chunkSize * 0.7) {
        end = breakPoint + 1;
      }
    }
    
    chunks.push(text.slice(start, end).trim());
    start = Math.max(start + chunkSize - overlap, end);
  }
  
  return chunks.filter(chunk => chunk.length > 50); // Remove tiny chunks
}

/**
 * Calculate importance score for a chunk based on content
 */
function calculateChunkImportance(text: string, section?: string): number {
  let importance = 1;
  
  // Important keywords boost importance
  const importantKeywords = [
    'purchase price', 'closing date', 'contingency', 'inspection',
    'financing', 'earnest money', 'deed', 'title', 'warranty',
    'liability', 'default', 'termination', 'breach', 'damages'
  ];
  
  const lowerText = text.toLowerCase();
  importantKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      importance += 0.5;
    }
  });
  
  // Section-based importance
  if (section) {
    const importantSections = [
      'terms', 'conditions', 'price', 'payment', 'closing',
      'contingencies', 'inspection', 'financing'
    ];
    
    const lowerSection = section.toLowerCase();
    importantSections.forEach(important => {
      if (lowerSection.includes(important)) {
        importance += 1;
      }
    });
  }
  
  // Length-based scoring (moderate length preferred)
  if (text.length > 200 && text.length < 2000) {
    importance += 0.3;
  }
  
  return importance;
}

/**
 * Process contract using multiple strategies for maximum coverage
 */
export async function processLargeContract(
  text: string,
  maxTokens: number = 100000
): Promise<{
  chunks: ContractChunk[],
  strategy: string,
  coverage: number
}> {
  const textLength = text.length;
  const estimatedTokens = textLength / 3; // Rough estimate
  
  console.log(`[Contract Processing] Text length: ${textLength}, estimated tokens: ${estimatedTokens}`);
  
  if (estimatedTokens <= maxTokens) {
    // Small contract - process normally
    const chunks = intelligentChunkContract(text, {
      chunkSize: 1500,
      overlap: 300,
      preserveSections: true
    });
    
    return {
      chunks,
      strategy: 'full_processing',
      coverage: 1.0
    };
  }
  
  // Large contract - use hierarchical processing
  console.log(`[Contract Processing] Large contract detected, using hierarchical processing`);
  
  // Step 1: Extract key sections first
  const sections = identifyContractSections(text);
  console.log(`[Contract Processing] Identified ${sections.length} sections`);
  
  // Step 2: Prioritize sections by importance
  const prioritizedSections = sections
    .map(section => ({
      ...section,
      importance: calculateSectionImportance(section.content, section.title)
    }))
    .sort((a, b) => b.importance - a.importance);
  
  // Step 3: Process top sections within token limit
  let processedTokens = 0;
  const selectedChunks: ContractChunk[] = [];
  
  for (const section of prioritizedSections) {
    const sectionTokens = section.content.length / 3;
    
    if (processedTokens + sectionTokens > maxTokens) {
      // Partial section processing
      const remainingTokens = maxTokens - processedTokens;
      const partialContent = section.content.slice(0, remainingTokens * 3);
      
      const partialChunks = intelligentChunkContract(partialContent, {
        chunkSize: 1500,
        overlap: 300,
        preserveSections: false
      });
      
      selectedChunks.push(...partialChunks);
      break;
    }
    
    const sectionChunks = intelligentChunkContract(section.content, {
      chunkSize: 1500,
      overlap: 300,
      preserveSections: false
    });
    
    selectedChunks.push(...sectionChunks);
    processedTokens += sectionTokens;
  }
  
  const coverage = processedTokens / estimatedTokens;
  
  return {
    chunks: selectedChunks,
    strategy: 'hierarchical_processing',
    coverage
  };
}

function calculateSectionImportance(content: string, title: string): number {
  let importance = calculateChunkImportance(content, title);
  
  // Additional section-level importance factors
  const criticalSections = [
    'purchase and sale', 'terms and conditions', 'closing',
    'financing', 'inspection', 'contingencies', 'price'
  ];
  
  const lowerTitle = title.toLowerCase();
  criticalSections.forEach(critical => {
    if (lowerTitle.includes(critical)) {
      importance += 2;
    }
  });
  
  return importance;
} 