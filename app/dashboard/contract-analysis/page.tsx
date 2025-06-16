'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiFile, FiCheck, FiCopy, FiDownload, FiTrash2 } from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import { summarizeContract } from '@/lib/openai';
import { extractRelevantText } from '@/lib/embeddings';

// Utility to sanitize strings for Postgres
function sanitizeForPostgres(input: string): string {
  if (!input) return '';
  
  // First pass: Remove all null bytes (\u0000) which cause Postgres errors
  let sanitized = input.replace(/\u0000/g, '');
  
  // Second pass: Replace other control characters except common whitespace
  sanitized = sanitized.replace(/[\u0001-\u001F\u007F-\u009F]/g, (c) => {
    // Keep newlines, tabs, and carriage returns
    if (c === '\n' || c === '\r' || c === '\t') return c;
    return '';
  });
  
  return sanitized;
}
import { extractTextFromPDF } from '@/lib/ocr';
import { supabase } from '@/lib/supabase';

// Interface for contract summary JSON
interface ContractSummary {
  property: string;
  parties: string;
  dates: string;
  contingencies: string;
  otherDetails: string;
}

// Helper to try parsing JSON summary first, then fall back to regex
const parseSummary = (text: string) => {
  // Try to parse as JSON first
  try {
    const jsonSummary = JSON.parse(text);
    
    // Validate that it has the expected structure
    if (jsonSummary.property !== undefined && 
        jsonSummary.parties !== undefined && 
        jsonSummary.dates !== undefined && 
        jsonSummary.contingencies !== undefined) {
      return {
        property: jsonSummary.property,
        parties: jsonSummary.parties,
        dates: jsonSummary.dates,
        contingencies: jsonSummary.contingencies,
        otherDetails: jsonSummary.otherDetails || ''
      };
    } else {
      console.error('JSON missing required fields, falling back to regex extraction');
      return extractSectionsWithRegex(text);
    }
  } catch (error) {
    console.error('[Contract Analysis] Error parsing contract summary JSON:', error);
    console.log(`[Contract Analysis] Full text that failed to parse:`, text);
    
    // Fallback to regex extraction if JSON parsing fails
    console.log(`[Contract Analysis] Falling back to regex extraction...`);
    return extractSectionsWithRegex(text);
  }
};

// Helper to extract sections using regex for backward compatibility
const extractSectionsWithRegex = (text: string) => {
  const sections = {
    property: '',
    parties: '',
    dates: '',
    contingencies: '',
    otherDetails: ''
  };
  
  // Extract sections using regex
  const propertyMatch = text.match(/Property:?\s*\n?([\s\S]*?)(?=Parties|$)/i);
  const partiesMatch = text.match(/Parties:?\s*\n?([\s\S]*?)(?=Critical Dates|$)/i);
  const datesMatch = text.match(/Critical Dates:?\s*\n?([\s\S]*?)(?=Contingencies|$)/i);
  const contingenciesMatch = text.match(/Contingencies:?\s*\n?([\s\S]*?)(?=Other Details|$)/i);
  const otherDetailsMatch = text.match(/Other Details:?\s*\n?([\s\S]*?)$/i);

  sections.property = propertyMatch ? propertyMatch[1].trim() : '';
  sections.parties = partiesMatch ? partiesMatch[1].trim() : '';
  sections.dates = datesMatch ? datesMatch[1].trim() : '';
  sections.contingencies = contingenciesMatch ? contingenciesMatch[1].trim() : '';
  sections.otherDetails = otherDetailsMatch ? otherDetailsMatch[1].trim() : '';

  return sections;
}

export default function ContractAnalysis() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [summary, setSummary] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [parsed, setParsed] = useState<any>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'warning'} | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setLoading(true);
      
      // Handle different file types
      if (selectedFile.type === 'text/plain') {
        // For text files, read directly
        const reader = new FileReader();
        reader.onload = async (e) => {
          const text = e.target?.result as string;
          setFileContent(text);
          setLoading(false);
        };
        reader.onerror = () => {
          setNotification({
            message: 'Error reading file. Please try again with a different file.',
            type: 'error'
          });
          setLoading(false);
        };
        reader.readAsText(selectedFile);
      } else if (selectedFile.type === 'application/pdf') {
        // For PDF files, use text extraction
        setNotification({
          message: 'Extracting text from PDF. This may take a moment...',
          type: 'success'
        });
        
        // Extract text from PDF without using await in the callback
        extractTextFromPDF(selectedFile)
          .then(extractedText => {
            console.log(`[Contract Analysis] PDF text extracted, length: ${extractedText.length}`);
            console.log(`[Contract Analysis] First 200 chars: ${extractedText.substring(0, 200)}...`);
            setFileContent(extractedText);
            setNotification({
              message: 'Text successfully extracted from PDF',
              type: 'success'
            });
          })
          .catch(error => {
            console.error('Error extracting text from PDF:', error);
            setNotification({
              message: 'Failed to extract text from PDF. Please try a different file.',
              type: 'error'
            });
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        // For other file types, show error
        setNotification({
          message: 'Unsupported file type. Please upload a text or PDF file.',
          type: 'error'
        });
        setLoading(false);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  });

  const handleAnalyze = async () => {
    if (!fileContent) {
      alert('Please upload a contract file first');
      return;
    }
    
    setAnalyzing(true);
    setSummary('');
    setParsed(null);
    
    try {
      // Check if the file content is too large (rough estimate)
      if (fileContent.length > 1000000) { // ~1MB of text
        console.log(`[Contract Analysis] Large contract detected (${fileContent.length} chars). Processing may take longer.`);
      }
      
      console.log(`[Contract Analysis] Starting contract analysis, text length: ${fileContent.length}`);
      console.log(`[Contract Analysis] First 200 chars of content: ${fileContent.substring(0, 200)}...`);
      
      // Extract the most relevant parts of the contract using vector embeddings
      setNotification({
        message: 'Analyzing contract with vector embeddings...',
        type: 'success'
      });
      
      // Define a query that targets the key information we want to extract
      const query = "Extract key contract information including parties, terms, conditions, dates, financial details, and obligations";
      
      // Sanitize the input text before sending to API
      const sanitizedFileContent = sanitizeForPostgres(fileContent);
      
      let contractSummary = '';
      let usedFallback = false;
      
      try {
        // Get the most relevant text sections based on vector similarity
        const relevantText = await extractRelevantText(sanitizedFileContent, query, 5);
        console.log(`[Contract Analysis] Extracted ${relevantText.length} chars of most relevant content`);
        
        // Additional sanitization of the relevant text before summarization
        const sanitizedRelevantText = sanitizeForPostgres(relevantText);
        
        // Send only the relevant text to OpenAI for summarization
        contractSummary = await summarizeContract(sanitizedRelevantText);
        
        console.log(`[Contract Analysis] Received summary from OpenAI, length: ${contractSummary.length}`);
        console.log(`[Contract Analysis] Summary first 200 chars: ${contractSummary.substring(0, 200)}...`);
      } catch (embeddingError) {
        console.error('Error in embeddings or summarization:', embeddingError);
        
        // Fallback to direct summarization with truncation if embeddings fail
        setNotification({
          message: 'Falling back to direct summarization...',
          type: 'warning'
        });
        
        // Truncate text to avoid token limits
        const truncatedText = sanitizedFileContent.slice(0, 15000);
        
        // Directly summarize the truncated text
        contractSummary = await summarizeContract(truncatedText);
        usedFallback = true;
      }
      
      // Final sanitization before saving or displaying
      const sanitizedSummary = sanitizeForPostgres(contractSummary);
      
      // Update UI with the summary
      setSummary(sanitizedSummary);
      
      // Try to parse the structured data from the summary
      try {
        const parsedData = parseSummary(sanitizedSummary);
        setParsed(parsedData);
      } catch (parseError) {
        console.error('Error parsing summary:', parseError);
      }
      
      // Save to database
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // For very large contracts, truncate the original content
          // before saving to the database to avoid hitting size limits
          const truncatedContent = sanitizedFileContent.length > 100000 
            ? sanitizedFileContent.substring(0, 100000) + '... [content truncated for storage]'
            : sanitizedFileContent;
          
          const { data, error } = await supabase
            .from('contracts')
            .insert([
              {
                user_id: session.user.id,
                title: file?.name || 'Untitled Contract',
                original_content: sanitizeForPostgres(truncatedContent),
                summary: sanitizedSummary
              },
            ])
            .select();
            
          if (error) {
            console.error('Error saving contract analysis:', error);
            setNotification({
              message: 'Error saving contract analysis to database',
              type: 'error'
            });
          } else {
            setNotification({
              message: usedFallback 
                ? 'Contract analysis completed with fallback method' 
                : 'Contract analysis completed and saved successfully!',
              type: 'success'
            });
          }
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        setNotification({
          message: 'Error saving to database, but analysis is complete',
          type: 'warning'
        });
      }
    } catch (error: any) {
      console.error('Error analyzing contract:', error);
      setNotification({
        message: `Error analyzing contract: ${error.message || 'Unknown error'}`,
        type: 'error'
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleReset = () => {
    setFile(null);
    setFileContent('');
    setSummary('');
  };

  // Parse summary when it changes
  useEffect(() => {
    if (summary) {
      setParsed(parseSummary(summary));
    }
  }, [summary]);

  // PDF download handler
  const handleDownloadPDF = () => {
    try {
      if (!parsed) {
        throw new Error('No contract summary data available');
      }
      
      // Check if we have actual content to export
      const hasContent = [
        parsed.property, 
        parsed.parties, 
        parsed.dates, 
        parsed.contingencies, 
        parsed.otherDetails
      ].some(section => section && section.trim().length > 0);
      
      if (!hasContent) {
        throw new Error('No content available to export to PDF');
      }
      
      const doc = new jsPDF();
      const margin = 20;
      let yPosition = margin;
      
      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Contract Summary', margin, yPosition);
      yPosition += 20;
      
      // File name and timestamp
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`File: ${file?.name || 'Contract'}`, margin, yPosition);
      yPosition += 10;
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
      yPosition += 20;
      
      // Helper function to add section
      const addSection = (title: string, content: string) => {
        // Skip empty sections
        if (!content || content.trim().length === 0) {
          return;
        }
        
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = margin;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        // Split text into lines that fit the page width
        const lines = doc.splitTextToSize(content, 170);
        doc.text(lines, margin, yPosition);
        yPosition += lines.length * 5 + 15;
      };
      
      // Add sections
      addSection('Property Details', parsed.property);
      addSection('Parties Involved', parsed.parties);
      addSection('Critical Dates', parsed.dates);
      addSection('Contingencies', parsed.contingencies);
      
      if (parsed.otherDetails) {
        addSection('Additional Details', parsed.otherDetails);
      }
      
      doc.save(`contract-summary-${file?.name?.split('.')[0] || 'document'}.pdf`);
      
      // Show success notification
      setNotification({
        message: 'PDF successfully downloaded',
        type: 'success'
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('PDF generation error:', error);
      // Show error notification
      setNotification({
        message: error instanceof Error ? error.message : 'Failed to generate PDF',
        type: 'error'
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center ${notification.type === 'success' ? 'bg-green-100 border-l-4 border-green-500' : 'bg-red-100 border-l-4 border-red-500'} transition-all duration-500 animate-fade-in`}>
            <div className={`w-6 h-6 mr-3 flex-shrink-0 rounded-full ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} flex items-center justify-center`}>
              {notification.type === 'success' ? (
                <FiCheck className="text-white text-sm" />
              ) : (
                <div className="text-white text-sm font-bold">!</div>
              )}
            </div>
            <p className={notification.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {notification.message}
            </p>
          </div>
        )}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contract Analyzer</h1>
          <p className="text-gray-600">Upload and analyze your contracts with AI-powered insights</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main upload and summary area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Contract</h2>
              
              {!file ? (
                <div 
                  {...getRootProps()} 
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
                    isDragActive 
                      ? 'border-blue-400 bg-blue-50 scale-105' 
                      : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center">
                    <FiUpload className="text-gray-400 text-4xl mb-4" />
                    <p className="text-gray-600 mb-2 text-lg">
                      {isDragActive ? 'Drop the file here' : 'Drag & drop a contract file here, or click to select'}
                    </p>
                    <p className="text-gray-400 text-sm">Supports TXT, PDF, DOC, DOCX files</p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
                    <div className="flex items-center">
                      <FiFile className="text-blue-500 text-xl mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleReset}
                      className="flex items-center text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      <FiTrash2 className="mr-1" />
                      Remove
                    </button>
                  </div>
                  
                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                      <span className="text-gray-600">Processing file...</span>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <button
                        onClick={handleAnalyze}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
                        disabled={analyzing || !fileContent}
                      >
                        {analyzing ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Analyzing...
                          </>
                        ) : (
                          'Analyze Contract'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Summary Section */}
            {summary && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" ref={summaryRef}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Contract Summary</h2>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCopy}
                      className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1 rounded-md hover:bg-blue-50 transition-colors duration-200"
                    >
                      {copied ? (
                        <>
                          <FiCheck className="mr-1" /> Copied!
                        </>
                      ) : (
                        <>
                          <FiCopy className="mr-1" /> Copy
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDownloadPDF}
                      className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1 rounded-md hover:bg-blue-50 transition-colors duration-200"
                    >
                      <FiDownload className="mr-1" /> Download PDF
                    </button>
                  </div>
                </div>

                {/* Summary Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Property Details Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="bg-blue-600 text-white p-6">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-white/30 rounded-full mr-3 flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div>
                        <h3 className="text-xl font-bold">Property Details</h3>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="bg-white/80 rounded-lg p-4 min-h-[200px]">
                        {parsed?.property ? (
                          <div className="space-y-3">
                            {parsed.property.split('\n').filter((line: string) => line.trim()).map((line: string, index: number) => (
                              <div key={index} className="flex items-start">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                <p className="text-blue-900 leading-relaxed">{line.trim()}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-blue-700 italic">No property information found</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Parties Involved Card */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="bg-green-600 text-white p-6">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-white/30 rounded-full mr-3 flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div>
                        <h3 className="text-xl font-bold">Parties Involved</h3>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="bg-white/80 rounded-lg p-4 min-h-[200px]">
                        {parsed?.parties ? (
                          <div className="space-y-3">
                            {parsed.parties.split('\n').filter((line: string) => line.trim()).map((line: string, index: number) => (
                              <div key={index} className="flex items-start">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                <p className="text-green-900 leading-relaxed">{line.trim()}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-green-700 italic">No party information found</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Critical Dates Card */}
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="bg-amber-600 text-white p-6">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-white/30 rounded-full mr-3 flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div>
                        <h3 className="text-xl font-bold">Critical Dates</h3>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="bg-white/80 rounded-lg p-4 min-h-[200px]">
                        {parsed?.dates ? (
                          <div className="space-y-3">
                            {parsed.dates.split('\n').filter((line: string) => line.trim()).map((line: string, index: number) => (
                              <div key={index} className="flex items-start">
                                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                <p className="text-amber-900 leading-relaxed">{line.trim()}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-amber-700 italic">No date information found</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contingencies Card */}
                  <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="bg-red-600 text-white p-6">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-white/30 rounded-full mr-3 flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div>
                        <h3 className="text-xl font-bold">Contingencies</h3>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="bg-white/80 rounded-lg p-4 min-h-[200px]">
                        {parsed?.contingencies ? (
                          <div className="space-y-3">
                            {parsed.contingencies.split('\n').filter((line: string) => line.trim()).map((line: string, index: number) => (
                              <div key={index} className="flex items-start">
                                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                <p className="text-red-900 leading-relaxed">{line.trim()}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-red-700 italic">No contingencies found</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Details Card - Full Width */}
                {parsed?.otherDetails && (
                  <div className="mt-8 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="bg-purple-600 text-white p-6">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-white/30 rounded-full mr-3 flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div>
                        <h3 className="text-xl font-bold">Additional Details</h3>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="bg-white/80 rounded-lg p-4 min-h-[150px]">
                        <div className="space-y-3">
                          {parsed.otherDetails.split('\n').filter((line: string) => line.trim()).map((line: string, index: number) => (
                            <div key={index} className="flex items-start">
                              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                              <p className="text-purple-900 leading-relaxed">{line.trim()}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {summary && (
              <div className="space-y-6">
                {/* Quick Questions */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Questions</h2>
                  <div className="space-y-3">
                    {[
                      'When does the inspection period end?',
                      'What is the financing situation?',
                      'When is the scheduled closing date?',
                      'How much is the earnest money deposit?',
                      'What contingencies are in place?'
                    ].map((question, index) => (
                      <button 
                        key={index}
                        className="w-full text-left p-3 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors duration-200 border border-gray-200"
                        disabled
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ask a Question */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Ask a Question</h2>
                  <textarea 
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={4}
                    placeholder="Ask anything about this contract..."
                    disabled
                  />
                  <button 
                    className="w-full mt-3 bg-gray-300 text-gray-500 px-4 py-2 rounded-lg font-medium cursor-not-allowed"
                    disabled
                  >
                    Ask Question (Coming Soon)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}