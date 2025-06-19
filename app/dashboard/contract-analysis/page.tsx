'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiFile, FiCheck, FiCopy, FiDownload, FiTrash2, FiHome, FiFileText, FiKey } from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import { extractTextFromPDF } from '@/lib/ocr';
import { supabase } from '@/lib/supabase';

// Contract type definition
type ContractType = 'purchase' | 'listing' | 'lease';

// Contract type configuration
const CONTRACT_TYPES = {
  purchase: {
    id: 'purchase' as ContractType,
    name: 'Purchase/Offer-to-Purchase',
    description: 'Buyer-seller purchase agreements, offers to purchase',
    color: 'blue',
    icon: FiHome,
    bgClass: 'from-blue-50 to-blue-100 border-blue-200 hover:border-blue-300',
    buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    iconClass: 'text-blue-600'
  },
  listing: {
    id: 'listing' as ContractType,
    name: 'Listing Agreement',
    description: 'Seller-broker listing agreements, representation contracts',
    color: 'green',
    icon: FiFileText,
    bgClass: 'from-green-50 to-green-100 border-green-200 hover:border-green-300',
    buttonClass: 'bg-green-600 hover:bg-green-700 text-white',
    iconClass: 'text-green-600'
  },
  lease: {
    id: 'lease' as ContractType,
    name: 'Lease/Rental Agreement',
    description: 'Residential and commercial lease agreements',
    color: 'purple',
    icon: FiKey,
    bgClass: 'from-purple-50 to-purple-100 border-purple-200 hover:border-purple-300',
    buttonClass: 'bg-purple-600 hover:bg-purple-700 text-white',
    iconClass: 'text-purple-600'
  }
};

// Utility to create readable summary from extracted data
function formatAnalysisSummary(extractedData: any, contractType: ContractType, confidence: number): string {
  const contractTypeName = CONTRACT_TYPES[contractType].name;
  
  let summary = `${contractTypeName} Analysis Summary\n`;
  summary += `Confidence Score: ${confidence}%\n`;
  summary += `Generated: ${new Date().toLocaleString()}\n\n`;
  
  // Format the extracted data into readable text
  Object.entries(extractedData).forEach(([key, value]) => {
    const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    summary += `${formattedKey}:\n`;
    
    if (value === null || value === undefined) {
      summary += '  Not specified\n\n';
    } else if (typeof value === 'object') {
      summary += `  ${JSON.stringify(value, null, 2).replace(/[{}",]/g, '').trim()}\n\n`;
    } else {
      summary += `  ${value}\n\n`;
    }
  });
  
  return summary;
}

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

export default function ContractAnalysis() {
  const router = useRouter();
  const [selectedContractType, setSelectedContractType] = useState<ContractType | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'warning'} | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setLoading(true);
      
      try {
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
          
          // Extract text from PDF
          const extractedText = await extractTextFromPDF(selectedFile);
          console.log(`[Contract Analysis] PDF text extracted, length: ${extractedText.length}`);
          setFileContent(extractedText);
          setNotification({
            message: 'Text successfully extracted from PDF',
            type: 'success'
          });
          setLoading(false);
        } else {
          // For other file types, show error
          setNotification({
            message: 'Unsupported file type. Please upload a text or PDF file.',
            type: 'error'
          });
          setLoading(false);
        }
      } catch (error) {
        console.error('Error processing file:', error);
        setNotification({
          message: 'Failed to process file. Please try a different file.',
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
    if (!fileContent || !selectedContractType) {
      setNotification({
        message: 'Please select a contract type and upload a contract file first',
        type: 'error'
      });
      return;
    }
    
    setAnalyzing(true);
    setExtractedData(null);
    setAnalysisResult(null);
    
    try {
      console.log(`[Contract Analysis] Starting ${selectedContractType} contract analysis, text length: ${fileContent.length}`);
      
      // Get the current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if user is authenticated
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch('/api/contract-analysis', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          contractText: fileContent,
          contractType: selectedContractType,
          fileName: file?.name || 'uploaded-contract'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const result = await response.json();
      setExtractedData(result.extractedData);
      setAnalysisResult(result);
      
      // Save to database directly from frontend (like generate-listing does)
      if (session?.user?.id) {
        console.log(`[Contract Analysis] Saving to database for user: ${session.user.id}`);
        
        // Sanitize the data before saving
        const sanitizedExtractedData = sanitizeForPostgres(JSON.stringify(result.extractedData));
        const sanitizedContractText = sanitizeForPostgres(fileContent);
        
        // Create readable summary for easy viewing
        const summaryText = formatAnalysisSummary(result.extractedData, selectedContractType, result.confidence || 0);
        const sanitizedSummaryText = sanitizeForPostgres(summaryText);
        
        const { data, error } = await supabase
          .from('contracts')
          .insert([
            {
              user_id: session.user.id,
              title: file?.name || `${selectedContractType} Contract Analysis`,
              contract_type: selectedContractType,
              original_content: sanitizedContractText,
              extracted_data: JSON.parse(sanitizedExtractedData),
              summary: sanitizedSummaryText,
              confidence_score: result.confidence || 0
            },
          ])
          .select();
          
        if (error) {
          console.error('Error saving contract analysis:', error);
          setNotification({
            message: 'Analysis completed but failed to save to database. Results are still available above.',
            type: 'warning'
          });
        } else {
          console.log('[Contract Analysis] Successfully saved to database:', data);
          setNotification({
            message: `${CONTRACT_TYPES[selectedContractType].name} analysis completed and saved successfully`,
            type: 'success'
          });
        }
      } else {
        console.log('[Contract Analysis] No authenticated user - analysis completed but not saved');
        setNotification({
          message: `${CONTRACT_TYPES[selectedContractType].name} analysis completed successfully (login to save results)`,
          type: 'success'
        });
      }

    } catch (error) {
      console.error('Contract analysis error:', error);
      setNotification({
        message: error instanceof Error ? error.message : 'Analysis failed. Please try again.',
        type: 'error'
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCopy = () => {
    if (extractedData) {
      navigator.clipboard.writeText(JSON.stringify(extractedData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setSelectedContractType(null);
    setFile(null);
    setFileContent('');
    setExtractedData(null);
    setAnalysisResult(null);
    setNotification(null);
  };

  const handleDownloadPDF = () => {
    if (!extractedData || !selectedContractType) return;

    const doc = new jsPDF();
    const contractTypeName = CONTRACT_TYPES[selectedContractType].name;
    
    // Title
    doc.setFontSize(20);
    doc.text(`${contractTypeName} Analysis`, 20, 30);
    
    // Add extracted data
    doc.setFontSize(12);
    let yPosition = 50;
    
    const addSection = (title: string, content: any) => {
      doc.setFontSize(14);
      doc.text(title, 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(JSON.stringify(content, null, 2), 170);
      doc.text(lines, 20, yPosition);
      yPosition += lines.length * 5 + 10;
    };

    Object.entries(extractedData).forEach(([key, value]) => {
      addSection(key.replace(/_/g, ' ').toUpperCase(), value);
    });

    doc.save(`${contractTypeName.replace(/\//g, '-')}-analysis.pdf`);
  };

  // Auto-dismiss notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
          notification.type === 'success' ? 'bg-green-500 text-white' :
          notification.type === 'error' ? 'bg-red-500 text-white' :
          'bg-yellow-500 text-black'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Contract Analyzer</h1>
            <p className="text-gray-600">Upload and analyze your contracts with AI-powered insights</p>
          </div>

          {/* Contract Type Selection */}
          {!selectedContractType && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">Select Contract Type</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.values(CONTRACT_TYPES).map((contractType) => {
                  const IconComponent = contractType.icon;
                  return (
                    <button
                      key={contractType.id}
                      onClick={() => setSelectedContractType(contractType.id)}
                      className={`
                        p-6 rounded-xl border-2 transition-all duration-200 transform hover:scale-105
                        bg-gradient-to-br ${contractType.bgClass}
                        hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300
                      `}
                    >
                      <div className="text-center">
                        <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-white flex items-center justify-center ${contractType.iconClass}`}>
                          <IconComponent size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{contractType.name}</h3>
                        <p className="text-sm text-gray-600">{contractType.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Contract Type & File Upload */}
          {selectedContractType && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main content area */}
              <div className="lg:col-span-2 space-y-6">
                {/* Selected Type Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center mr-4 ${CONTRACT_TYPES[selectedContractType].iconClass} border-2`}>
                        {React.createElement(CONTRACT_TYPES[selectedContractType].icon, { size: 24 })}
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">{CONTRACT_TYPES[selectedContractType].name}</h2>
                        <p className="text-gray-600">{CONTRACT_TYPES[selectedContractType].description}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleReset}
                      className="text-gray-400 hover:text-gray-600 text-sm"
                    >
                      Change Type
                    </button>
                  </div>
                </div>

                {/* File Upload */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Contract</h3>
                  
                  {!file ? (
                    <div
                      {...getRootProps()}
                      className={`
                        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200
                        ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                      `}
                    >
                      <input {...getInputProps()} />
                      <FiUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg text-gray-600 mb-2">
                        {isDragActive ? 'Drop the contract file here' : 'Drag & drop a contract file here, or click to select'}
                      </p>
                      <p className="text-sm text-gray-500">Supports TXT, PDF, DOC, DOCX files</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <FiFile className="h-8 w-8 text-blue-600 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">{file.name}</p>
                            <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setFile(null);
                            setFileContent('');
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </div>

                      {loading && (
                        <div className="flex justify-center items-center py-8">
                          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                          <span className="text-gray-600">Processing file...</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Extracted Text Preview */}
                {fileContent && !loading && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Extracted Text Preview</h3>
                      <div className="text-sm text-gray-500">
                        {fileContent.length.toLocaleString()} characters
                      </div>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
                        {fileContent}
                      </pre>
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <p className="text-sm text-gray-600">
                        Review the extracted text above, then click "Send for Analysis" to analyze with Gemini 2.5 Flash
                      </p>
                      <button
                        onClick={handleAnalyze}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center ${CONTRACT_TYPES[selectedContractType].buttonClass}`}
                        disabled={analyzing || !fileContent}
                      >
                        {analyzing ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Analyzing with Gemini...
                          </>
                        ) : (
                          <>
                            <FiFile className="mr-2" />
                            Send for Analysis
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Analysis Results */}
                {extractedData && analysisResult && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">Analysis Results</h2>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          analysisResult.confidence >= 80 ? 'bg-green-100 text-green-800' :
                          analysisResult.confidence >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {analysisResult.confidence}% confidence
                        </span>
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
                              <FiCopy className="mr-1" /> Copy JSON
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

                    {/* Structured Data Display */}
                    <div className="space-y-4">
                      <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                        {JSON.stringify(extractedData, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                {extractedData && (
                  <div className="space-y-6">
                    {/* Contract Type Info */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Contract Analysis</h2>
                      <div className={`p-4 rounded-lg bg-gradient-to-br ${CONTRACT_TYPES[selectedContractType].bgClass}`}>
                        <div className="flex items-center mb-3">
                          <div className={`w-8 h-8 rounded-full bg-white flex items-center justify-center mr-3 ${CONTRACT_TYPES[selectedContractType].iconClass}`}>
                            {React.createElement(CONTRACT_TYPES[selectedContractType].icon, { size: 16 })}
                          </div>
                          <h3 className="font-semibold text-gray-900">{CONTRACT_TYPES[selectedContractType].name}</h3>
                        </div>
                        <p className="text-sm text-gray-600">{CONTRACT_TYPES[selectedContractType].description}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
                      <div className="space-y-3">
                        <button
                          onClick={handleCopy}
                          className="w-full flex items-center justify-center text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                        >
                          <FiCopy className="mr-2" />
                          Copy Analysis Data
                        </button>
                        <button
                          onClick={handleDownloadPDF}
                          className="w-full flex items-center justify-center text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                        >
                          <FiDownload className="mr-2" />
                          Export PDF Report
                        </button>
                        <button
                          onClick={handleReset}
                          className="w-full flex items-center justify-center text-gray-600 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                        >
                          <FiTrash2 className="mr-2" />
                          Start New Analysis
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}