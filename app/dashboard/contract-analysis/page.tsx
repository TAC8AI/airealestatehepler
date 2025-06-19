'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiFile, FiCheck, FiCopy, FiDownload, FiTrash2, FiHome, FiFileText, FiKey, FiEye, FiClipboard, FiUsers } from 'react-icons/fi';
import { extractTextFromTextFile, isTextFile } from '@/lib/ocr';
import { analyzePDFContract, isPDFFile, formatFileSize, getUploadMessage } from '@/lib/pdf-upload';
import { supabase } from '@/lib/supabase';
import LeaseContractCard from '@/components/contract-cards/LeaseContractCard';
import PurchaseContractCard from '@/components/contract-cards/PurchaseContractCard';
import ListingContractCard from '@/components/contract-cards/ListingContractCard';

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

// PDF Upload Zone Component
interface PDFUploadZoneProps {
  contractType: ContractType | null;
  onAnalysisComplete: (result: any) => void;
  onAnalysisStart: () => void;
  disabled: boolean;
}

function PDFUploadZone({ contractType, onAnalysisComplete, onAnalysisStart, disabled }: PDFUploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled || !contractType) return;
    
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => isPDFFile(file));
    
    if (pdfFile) {
      onAnalysisStart();
      const result = await analyzePDFContract(pdfFile, contractType);
      onAnalysisComplete(result);
    }
  }, [contractType, onAnalysisComplete, onAnalysisStart, disabled]);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || !contractType) return;
    
    const file = e.target.files?.[0];
    if (file && isPDFFile(file)) {
      onAnalysisStart();
      const result = await analyzePDFContract(file, contractType);
      onAnalysisComplete(result);
    }
  }, [contractType, onAnalysisComplete, onAnalysisStart, disabled]);

  return (
    <div
      className={`
        border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200
        ${dragActive ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-gray-400'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => {
        if (!disabled) {
          document.getElementById('pdf-file-input')?.click();
        }
      }}
    >
      <input
        id="pdf-file-input"
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileInput}
        style={{ display: 'none' }}
        disabled={disabled}
      />
      <FiEye className="mx-auto h-10 w-10 text-green-500 mb-3" />
      <p className="text-md text-gray-600 mb-2">
        {dragActive ? 'Drop the PDF here' : 'Drag & drop a PDF file here, or click to select'}
      </p>
      <p className="text-sm text-gray-500">
        {disabled ? 'Processing...' : 'PDFs up to 20MB • Powered by GPT-4o Files API'}
      </p>
    </div>
  );
}

export default function ContractAnalysis() {
  const router = useRouter();
  const [selectedContractType, setSelectedContractType] = useState<ContractType | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [pdfAnalyzing, setPdfAnalyzing] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [uploadMethod, setUploadMethod] = useState<'text' | 'pdf' | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'warning'} | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setLoading(true);
      
      try {
        if (selectedFile.type === 'text/plain') {
          // Handle text files as before
          setNotification({
            message: 'Processing text file...',
            type: 'success'
          });
          
          const extractedText = await extractTextFromTextFile(selectedFile);
          console.log(`[Contract Analysis] Text file processed, length: ${extractedText.length}`);
          setFileContent(extractedText);
          setUploadMethod('text');
          setNotification({
            message: 'Text file successfully processed',
            type: 'success'
          });
          setLoading(false);
        } else if (selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf')) {
          // Handle PDF files with GPT-4o Vision
          if (!selectedContractType) {
            setNotification({
              message: 'Please select a contract type first before uploading a PDF',
              type: 'error'
            });
            setLoading(false);
            return;
          }
          
          setNotification({
            message: 'Processing PDF with GPT-4o Vision...',
            type: 'success'
          });
          setLoading(false);
          setPdfAnalyzing(true);
          
          // Process PDF directly here instead of calling handler
          try {
            const result = await analyzePDFContract(selectedFile, selectedContractType);
            setPdfAnalyzing(false);
            
            if (!result.success) {
              setNotification({
                message: result.error || 'PDF analysis failed',
                type: 'error'
              });
              return;
            }

            // Set the results from PDF analysis
            setExtractedData(result.extractedData);
            setAnalysisResult(result);
            setUploadMethod('pdf');
            
            setNotification({
              message: `PDF analysis completed successfully using GPT-4o Vision`,
              type: 'success'
            });
          } catch (pdfError) {
            setPdfAnalyzing(false);
            setNotification({
              message: 'PDF analysis failed. Please try again or use the text input option.',
              type: 'error'
            });
          }
        } else {
          // Unsupported file type
          setNotification({
            message: 'Unsupported file type. Please upload a .txt or .pdf file, or use the paste option below.',
            type: 'error'
          });
          setLoading(false);
          setPdfAnalyzing(false);
        }
      } catch (error) {
        console.error('Error processing file:', error);
        setNotification({
          message: 'Failed to process file. Please try a different file.',
          type: 'error'
        });
        setLoading(false);
        setPdfAnalyzing(false);
      }
    }
  }, [selectedContractType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf']
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

  const handlePDFAnalysisComplete = async (result: any) => {
    setPdfAnalyzing(false);
    
    if (!result.success) {
      setNotification({
        message: result.error || 'PDF analysis failed',
        type: 'error'
      });
      return;
    }

    // Set the results from PDF analysis
    setExtractedData(result.extractedData);
    setAnalysisResult(result);
    setUploadMethod('pdf');
    setFile(new File([''], result.fileName, { type: 'application/pdf' }));
    
    // Save to database if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user?.id) {
      console.log(`[PDF Analysis] Saving to database for user: ${session.user.id}`);
      
      // Sanitize the data before saving
      const sanitizedExtractedData = sanitizeForPostgres(JSON.stringify(result.extractedData));
      
      // Create readable summary for easy viewing
      const summaryText = formatAnalysisSummary(result.extractedData, result.contractType, result.confidence || 0);
      const sanitizedSummaryText = sanitizeForPostgres(summaryText);
      
      try {
        // 1. Save to general contracts table (for backward compatibility)
        const { data: contractData, error: contractError } = await supabase
          .from('contracts')
          .insert([
            {
              user_id: session.user.id,
              title: result.fileName || `${result.contractType} PDF Contract Analysis`,
              contract_type: result.contractType,
              original_content: `PDF File: ${result.fileName} (Analyzed with GPT-4o Files API)`,
              extracted_data: JSON.parse(sanitizedExtractedData),
              summary: sanitizedSummaryText,
              confidence_score: result.confidence || 0
            },
          ])
          .select();

        if (contractError) {
          throw contractError;
        }

        console.log('[PDF Analysis] Successfully saved to contracts table:', contractData);

        // 2. Save to specialized table based on contract type
        let specializedTableResult = null;
        const contractId = contractData?.[0]?.id;

        if (result.contractType === 'lease') {
          // Save to lease_agreements table
          const { data: leaseData, error: leaseError } = await supabase
            .from('lease_agreements')
            .insert([
              {
                user_id: session.user.id,
                contract_id: contractId,
                title: result.fileName || 'Lease Agreement Analysis',
                
                // Property Information
                property_address: result.extractedData.property_address,
                
                // Financial Terms
                monthly_rent: result.extractedData.monthly_rent ? parseFloat(result.extractedData.monthly_rent.replace(/[$,]/g, '')) : null,
                security_deposit: result.extractedData.security_deposit ? parseFloat(result.extractedData.security_deposit.replace(/[$,]/g, '')) : null,
                late_fee_amount: result.extractedData.late_fee ? parseFloat(result.extractedData.late_fee.replace(/[$,]/g, '')) : null,
                
                // Dates (try to parse dates)
                lease_start_date: result.extractedData.lease_start_date || null,
                lease_end_date: result.extractedData.lease_end_date || null,
                lease_term_months: result.extractedData.lease_term_months ? parseInt(result.extractedData.lease_term_months) : null,
                
                // Parties
                tenant_name: result.extractedData.tenant_name,
                landlord_name: result.extractedData.landlord_name,
                
                // Policies & Terms
                utilities_included: Array.isArray(result.extractedData.utilities_included) 
                  ? result.extractedData.utilities_included 
                  : result.extractedData.utilities_included ? [result.extractedData.utilities_included] : null,
                pet_policy: result.extractedData.pet_policy,
                parking_spaces: result.extractedData.parking_included ? 1 : 0,
                renewal_options: result.extractedData.renewal_option,
                tenant_maintenance_responsibilities: result.extractedData.maintenance_responsibility ? [result.extractedData.maintenance_responsibility] : null,
                lease_break_conditions: result.extractedData.early_termination_clause ? [result.extractedData.early_termination_clause] : null,
                special_conditions: Array.isArray(result.extractedData.special_conditions) 
                  ? result.extractedData.special_conditions 
                  : result.extractedData.special_conditions ? [result.extractedData.special_conditions] : null,
                
                // Metadata
                confidence_score: result.confidence || 0
              }
            ])
            .select();

          if (leaseError) {
            console.warn('[PDF Analysis] Failed to save to lease_agreements table:', leaseError);
          } else {
            specializedTableResult = leaseData;
            console.log('[PDF Analysis] Successfully saved to lease_agreements table:', leaseData);
          }
        }
        
        else if (result.contractType === 'purchase') {
          // Save to purchase_contracts table
          const { data: purchaseData, error: purchaseError } = await supabase
            .from('purchase_contracts')
            .insert([
              {
                user_id: session.user.id,
                contract_id: contractId,
                title: result.fileName || 'Purchase Agreement Analysis',
                
                // Property Information
                property_address: result.extractedData.property_address,
                
                // Financial Terms
                purchase_price: result.extractedData.purchase_price ? parseFloat(result.extractedData.purchase_price.replace(/[$,]/g, '')) : null,
                earnest_money: result.extractedData.earnest_money ? parseFloat(result.extractedData.earnest_money.replace(/[$,]/g, '')) : null,
                down_payment: result.extractedData.down_payment ? parseFloat(result.extractedData.down_payment.replace(/[$,]/g, '')) : null,
                
                // Dates
                closing_date: result.extractedData.closing_date || null,
                possession_date: result.extractedData.possession_date || null,
                
                // Parties
                buyer_name: result.extractedData.buyer_name,
                seller_name: result.extractedData.seller_name,
                
                // Financing & Terms
                financing_type: result.extractedData.financing_type,
                inspection_period: result.extractedData.inspection_period,
                appraisal_contingency: result.extractedData.appraisal_contingency,
                financing_contingency: result.extractedData.financing_contingency,
                sale_contingency: result.extractedData.sale_contingency,
                closing_costs_responsibility: result.extractedData.closing_costs_responsibility,
                home_warranty: result.extractedData.home_warranty,
                
                // Professional Services
                title_company: result.extractedData.title_company,
                real_estate_agent: result.extractedData.real_estate_agent,
                
                // Other
                special_conditions: Array.isArray(result.extractedData.special_conditions) 
                  ? result.extractedData.special_conditions 
                  : result.extractedData.special_conditions ? [result.extractedData.special_conditions] : null,
                
                // Metadata
                confidence_score: result.confidence || 0
              }
            ])
            .select();

          if (purchaseError) {
            console.warn('[PDF Analysis] Failed to save to purchase_contracts table:', purchaseError);
          } else {
            specializedTableResult = purchaseData;
            console.log('[PDF Analysis] Successfully saved to purchase_contracts table:', purchaseData);
          }
        }
        
        else if (result.contractType === 'listing') {
          // Save to listing_agreements table
          const { data: listingData, error: listingError } = await supabase
            .from('listing_agreements')
            .insert([
              {
                user_id: session.user.id,
                contract_id: contractId,
                title: result.fileName || 'Listing Agreement Analysis',
                
                // Property Information
                property_address: result.extractedData.property_address,
                property_type: result.extractedData.property_type,
                square_footage: result.extractedData.square_footage ? parseInt(result.extractedData.square_footage.replace(/[,]/g, '')) : null,
                bedrooms: result.extractedData.bedrooms ? parseInt(result.extractedData.bedrooms) : null,
                bathrooms: result.extractedData.bathrooms ? parseFloat(result.extractedData.bathrooms) : null,
                lot_size: result.extractedData.lot_size,
                year_built: result.extractedData.year_built ? parseInt(result.extractedData.year_built) : null,
                
                // Financial Terms
                listing_price: result.extractedData.listing_price ? parseFloat(result.extractedData.listing_price.replace(/[$,]/g, '')) : null,
                commission_rate: result.extractedData.commission_rate,
                
                // Timeline
                listing_start_date: result.extractedData.listing_start_date || null,
                listing_end_date: result.extractedData.listing_end_date || null,
                listing_duration: result.extractedData.listing_duration,
                
                // Parties
                seller_name: result.extractedData.seller_name,
                listing_agent: result.extractedData.listing_agent,
                broker_name: result.extractedData.broker_name,
                
                // Marketing Terms
                marketing_terms: Array.isArray(result.extractedData.marketing_terms) 
                  ? result.extractedData.marketing_terms 
                  : result.extractedData.marketing_terms ? [result.extractedData.marketing_terms] : null,
                showing_instructions: result.extractedData.showing_instructions,
                
                // Authorizations
                lockbox_authorization: result.extractedData.lockbox_authorization,
                sign_authorization: result.extractedData.sign_authorization,
                mls_authorization: result.extractedData.mls_authorization,
                internet_marketing_authorization: result.extractedData.internet_marketing_authorization,
                
                // Terms
                listing_terms: result.extractedData.listing_terms,
                price_reduction_terms: result.extractedData.price_reduction_terms,
                special_conditions: Array.isArray(result.extractedData.special_conditions) 
                  ? result.extractedData.special_conditions 
                  : result.extractedData.special_conditions ? [result.extractedData.special_conditions] : null,
                
                // Metadata
                confidence_score: result.confidence || 0
              }
            ])
            .select();

          if (listingError) {
            console.warn('[PDF Analysis] Failed to save to listing_agreements table:', listingError);
          } else {
            specializedTableResult = listingData;
            console.log('[PDF Analysis] Successfully saved to listing_agreements table:', listingData);
          }
        }

        // Success notification
        const specializedTableNames: Record<ContractType, string> = {
          'lease': 'lease agreements',
          'purchase': 'purchase contracts', 
          'listing': 'listing agreements'
        };
        
        const specializedTableName = specializedTableNames[result.contractType as ContractType] || 'specialized table';

        if (specializedTableResult) {
          setNotification({
            message: `PDF analysis completed and saved to both contracts table and ${specializedTableName} table successfully!`,
            type: 'success'
          });
        } else {
          setNotification({
            message: `PDF analysis completed and saved to contracts table (specialized table save failed but analysis is available)`,
            type: 'warning'
          });
        }

      } catch (error) {
        console.error('Error saving PDF analysis:', error);
        setNotification({
          message: 'PDF analysis completed but failed to save to database. Results are still available above.',
          type: 'warning'
        });
      }
    } else {
      setNotification({
        message: `PDF analysis completed successfully using GPT-4o Files API (login to save results)`,
        type: 'success'
      });
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

  const handleDownloadReport = () => {
    if (!extractedData || !selectedContractType) return;

    const contractTypeName = CONTRACT_TYPES[selectedContractType].name;
    
    // Create readable report content
    let reportContent = `${contractTypeName} Analysis Report\n`;
    reportContent += `Generated: ${new Date().toLocaleString()}\n`;
    reportContent += `Confidence Score: ${analysisResult?.confidence || 0}%\n\n`;
    reportContent += `${'='.repeat(50)}\n\n`;
    
    // Add extracted data in readable format
    Object.entries(extractedData).forEach(([key, value]) => {
      const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      reportContent += `${formattedKey}:\n`;
      
      if (value === null || value === undefined) {
        reportContent += '  Not specified\n\n';
      } else if (typeof value === 'object') {
        reportContent += `  ${JSON.stringify(value, null, 2)}\n\n`;
      } else {
        reportContent += `  ${value}\n\n`;
      }
    });

    // Create and download text file
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contractTypeName.replace(/\//g, '-')}-analysis-report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Contract Document</h3>
                  
                  {!file && !fileContent ? (
                    <div className="space-y-6">
                      {/* Primary: PDF Upload Section */}
                      <div>
                        <h4 className="text-md font-medium text-gray-700 mb-3">
                          <span className="flex items-center">
                            <FiEye className="mr-2 text-blue-600" />
                            Upload PDF Contract
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Recommended</span>
                          </span>
                        </h4>
                        <PDFUploadZone 
                          contractType={selectedContractType}
                          onAnalysisComplete={handlePDFAnalysisComplete}
                          onAnalysisStart={() => setPdfAnalyzing(true)}
                          disabled={pdfAnalyzing}
                        />
                        <p className="text-sm text-blue-600 bg-blue-50 p-3 rounded mt-3">
                          ✨ <strong>Best Option:</strong> Direct PDF analysis with GPT-4o Files API - most accurate and no manual copying required!
                        </p>
                      </div>
                      
                      {/* OR Divider */}
                      <div className="flex items-center justify-center">
                        <div className="border-t border-gray-300 flex-grow"></div>
                        <span className="px-4 text-sm text-gray-500 bg-white">OR</span>
                        <div className="border-t border-gray-300 flex-grow"></div>
                      </div>
                      
                      {/* Secondary: Text Input Section */}
                      <div>
                        <h4 className="text-md font-medium text-gray-700 mb-3">Paste Contract Text</h4>
                        <div className="space-y-3">
                          <textarea
                            placeholder="Paste your contract text here... (Copy text from PDFs, Word docs, etc.)"
                            className="w-full h-40 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={fileContent}
                            onChange={(e) => {
                              setFileContent(e.target.value);
                              setUploadMethod('text');
                              if (e.target.value && !file) {
                                // Create a virtual file object for consistency
                                setFile(new File([e.target.value], 'pasted-text.txt', { type: 'text/plain' }));
                              } else if (!e.target.value) {
                                setFile(null);
                                setUploadMethod(null);
                              }
                            }}
                          />
                          <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            💡 Alternative method: Copy text from any document and paste here for analysis.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <FiFile className="h-8 w-8 text-blue-600 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">{file?.name || 'Pasted Text'}</p>
                            <p className="text-sm text-gray-500">
                              {file?.name && file.size ? formatFileSize(file.size) : `${fileContent.length.toLocaleString()} characters`}
                            </p>
                            {uploadMethod && (
                              <p className="text-xs text-blue-600">
                                Method: {uploadMethod === 'pdf' ? 'GPT-4o Vision' : 'Text Analysis'}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setFile(null);
                            setFileContent('');
                            setUploadMethod(null);
                            setExtractedData(null);
                            setAnalysisResult(null);
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </div>

                      {(loading || pdfAnalyzing) && (
                        <div className="flex justify-center items-center py-8">
                          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                          <span className="text-gray-600">
                            {pdfAnalyzing ? getUploadMessage(file?.size || 0) : 'Processing content...'}
                          </span>
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
                  <div className="space-y-6">
                    {/* Enhanced Contract Cards */}
                    <div>
                      {selectedContractType === 'lease' && (
                        <LeaseContractCard 
                          data={extractedData}
                          confidence={analysisResult.confidence}
                          fileName={file?.name}
                        />
                      )}
                      {selectedContractType === 'purchase' && (
                        <PurchaseContractCard 
                          data={extractedData}
                          confidence={analysisResult.confidence}
                          fileName={file?.name}
                        />
                      )}
                      {selectedContractType === 'listing' && (
                        <ListingContractCard 
                          data={extractedData}
                          confidence={analysisResult.confidence}
                          fileName={file?.name}
                        />
                      )}
                    </div>

                    {/* Technical Data Section (Collapsible) */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Technical Analysis Data</h3>
                          <div className="flex items-center gap-3">
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
                              onClick={handleDownloadReport}
                              className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1 rounded-md hover:bg-blue-50 transition-colors duration-200"
                            >
                              <FiDownload className="mr-1" /> Download Report
                            </button>
                          </div>
                        </div>

                        {/* Collapsible JSON Data */}
                        <details className="group">
                          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 flex items-center mb-3">
                            <span className="mr-2">🔧</span>
                            View Raw JSON Data (for developers)
                            <span className="ml-2 transform group-open:rotate-90 transition-transform">▶</span>
                          </summary>
                          <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                            <pre className="text-sm text-gray-700">
                              {JSON.stringify(extractedData, null, 2)}
                            </pre>
                          </div>
                        </details>
                      </div>
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
                          onClick={handleDownloadReport}
                          className="w-full flex items-center justify-center text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                        >
                          <FiDownload className="mr-2" />
                          Export Report
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