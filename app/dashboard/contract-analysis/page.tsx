'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiUpload, FiFile, FiCheck, FiCopy, FiDownload, FiTrash2, FiHome, FiFileText, FiKey } from 'react-icons/fi';
import { analyzePDFContract, isPDFFile, formatFileSize, getUploadMessage } from '@/lib/pdf-upload';
import { supabase } from '@/lib/supabase';
import LeaseContractCard from '@/components/contract-cards/LeaseContractCard';
import PurchaseContractCard from '@/components/contract-cards/PurchaseContractCard';
import ListingContractCard from '@/components/contract-cards/ListingContractCard';

type ContractType = 'purchase' | 'listing' | 'lease';

// Beautiful contract type configuration (restored)
const CONTRACT_TYPES = {
  purchase: {
    id: 'purchase' as ContractType,
    name: 'Purchase Agreement',
    description: 'Buyer-seller purchase agreements and offers to purchase',
    color: 'blue',
    icon: FiHome,
    bgClass: 'bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-md',
    buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    iconClass: 'text-blue-600'
  },
  listing: {
    id: 'listing' as ContractType,
    name: 'Listing Agreement',
    description: 'Seller-broker listing agreements and representation contracts',
    color: 'green',
    icon: FiFileText,
    bgClass: 'bg-white border-2 border-gray-200 hover:border-green-300 hover:shadow-md',
    buttonClass: 'bg-green-600 hover:bg-green-700 text-white',
    iconClass: 'text-green-600'
  },
  lease: {
    id: 'lease' as ContractType,
    name: 'Lease Agreement',
    description: 'Residential and commercial lease agreements',
    color: 'purple',
    icon: FiKey,
    bgClass: 'bg-white border-2 border-gray-200 hover:border-purple-300 hover:shadow-md',
    buttonClass: 'bg-purple-600 hover:bg-purple-700 text-white',
    iconClass: 'text-purple-600'
  }
};

// Beautiful Premium Loading Component (restored)
function PremiumLoader({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
      </div>
      <div className="mt-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing Contract</h3>
        <p className="text-gray-600 max-w-sm">{message}</p>
      </div>
    </div>
  );
}

// Beautiful PDF Upload Zone with Drag & Drop (restored)
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
        relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ease-out
        ${dragActive 
          ? 'border-blue-400 bg-blue-50 scale-[1.02] shadow-lg' 
          : 'border-gray-300 hover:border-gray-400 hover:shadow-md'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.01]'}
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
      
      <div className="space-y-4">
        <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
          <FiUpload className="w-8 h-8 text-gray-600" />
        </div>
        
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {dragActive ? 'Drop your contract here' : 'Upload Contract'}
          </h3>
          <p className="text-gray-600 mb-1">
            Drag and drop your PDF file or click to browse
          </p>
          <p className="text-sm text-gray-500">
            {disabled ? 'Processing...' : 'Supports PDF files up to 20MB'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ContractAnalysis() {
  const router = useRouter();
  const [selectedContractType, setSelectedContractType] = useState<ContractType | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [pdfAnalyzing, setPdfAnalyzing] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'warning'} | null>(null);
  const [usageInfo, setUsageInfo] = useState<{currentUsage: number, monthlyLimit: number, plan: string} | null>(null);

  // Fetch usage information on component mount
  useEffect(() => {
    const fetchUsageInfo = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Get user's subscription
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('plan_id')
          .eq('user_id', session.user.id)
          .eq('status', 'active')
          .single();

        const userPlan = subscription?.plan_id || 'free';

        // Get monthly usage
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { data: monthlyContracts } = await supabase
          .from('contracts')
          .select('id')
          .eq('user_id', session.user.id)
          .gte('created_at', startOfMonth.toISOString());

        const currentUsage = monthlyContracts?.length || 0;
        const monthlyLimit = userPlan === 'free' ? 1 : userPlan === 'pro' ? 5 : 999999;

        setUsageInfo({ currentUsage, monthlyLimit, plan: userPlan });
      } catch (error) {
        console.error('Error fetching usage info:', error);
      }
    };

    fetchUsageInfo();
  }, []);

  const handlePDFAnalysisComplete = async (result: any) => {
    setPdfAnalyzing(false);
    
    if (result.success) {
      setExtractedData(result.extractedData);
      setAnalysisResult(result);
      setFile(new File([''], result.fileName || 'contract.pdf', { type: 'application/pdf' }));
      
      // Enhanced notification with database save status
      let message = 'Contract analysis completed successfully!';
      if (result.savedToDatabase) {
        message += ' Contract has been saved to your database.';
      } else if (result.savedToDatabase === false) {
        message += ' (Note: Contract analysis completed but was not saved to database - you may need to log in)';
      }
      
      setNotification({
        message,
        type: 'success'
      });
      
      // Update usage info
      if (usageInfo) {
        setUsageInfo({
          ...usageInfo,
          currentUsage: usageInfo.currentUsage + 1
        });
      }
    } else if (result.upgradeRequired) {
      setNotification({
        message: `${result.details} You've used ${result.currentUsage}/${result.monthlyLimit} analyses this month.`,
        type: 'warning'
      });
    } else {
      setNotification({
        message: result.error || 'Failed to analyze contract. Please try again.',
        type: 'error'
      });
    }
  };

  const handleCopy = () => {
    if (analysisResult?.summary) {
      navigator.clipboard.writeText(analysisResult.summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setSelectedContractType(null);
    setFile(null);
    setExtractedData(null);
    setAnalysisResult(null);
    setPdfAnalyzing(false);
    setLoading(false);
  };

  const handleDownloadReport = () => {
    if (!analysisResult || !selectedContractType) return;
    
    const contractTypeName = CONTRACT_TYPES[selectedContractType].name;
    let reportContent = `${contractTypeName} Analysis Report\n`;
    reportContent += `Generated: ${new Date().toLocaleString()}\n`;
    reportContent += `Confidence Score: ${analysisResult.confidence || 'N/A'}%\n\n`;
    
    if (analysisResult.summary) {
      reportContent += `Summary:\n${analysisResult.summary}\n\n`;
    }
    
    reportContent += `Extracted Data:\n`;
    Object.entries(extractedData || {}).forEach(([key, value]) => {
      const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      reportContent += `${formattedKey}:\n`;
      
      if (value === null || value === undefined) {
        reportContent += `  Not specified\n\n`;
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
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-lg max-w-md transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-600 text-white' :
          notification.type === 'error' ? 'bg-red-600 text-white' :
          'bg-yellow-500 text-black'
        }`}>
          <div className="flex items-center">
            <FiCheck className="w-5 h-5 mr-3" />
            {notification.message}
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Contract Analysis</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
              Upload your contract and get AI-powered insights in seconds
            </p>
            
            {/* Usage Meter */}
            {usageInfo && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-md mx-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-800">
                    Monthly Usage ({usageInfo.plan.charAt(0).toUpperCase() + usageInfo.plan.slice(1)} Plan)
                  </span>
                  <span className="text-sm text-blue-600">
                    {usageInfo.currentUsage} / {usageInfo.monthlyLimit === 999999 ? '∞' : usageInfo.monthlyLimit}
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ 
                      width: usageInfo.monthlyLimit === 999999 ? '20%' : `${Math.min((usageInfo.currentUsage / usageInfo.monthlyLimit) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                {usageInfo.plan === 'free' && usageInfo.currentUsage >= usageInfo.monthlyLimit && (
                  <p className="text-sm text-orange-600 mt-2">
                    You've reached your monthly limit. <a href="/dashboard/subscription" className="underline">Upgrade your plan</a> for more analyses.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Contract Type Selection */}
          {!selectedContractType && (
            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
                Choose Contract Type
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.values(CONTRACT_TYPES).map((contractType) => {
                  const IconComponent = contractType.icon;
                  return (
                    <button
                      key={contractType.id}
                      onClick={() => setSelectedContractType(contractType.id)}
                      className={`
                        group p-8 rounded-2xl transition-all duration-300 transform hover:scale-105
                        ${contractType.bgClass}
                        focus:outline-none focus:ring-4 focus:ring-blue-300
                      `}
                    >
                      <div className="text-center">
                        <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-white transition-colors duration-300 ${contractType.iconClass}`}>
                          <IconComponent size={28} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">{contractType.name}</h3>
                        <p className="text-gray-600 leading-relaxed">{contractType.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Contract Type & Analysis */}
          {selectedContractType && (
            <div className="space-y-8">
              
              {/* Selected Type Header */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mr-6 ${CONTRACT_TYPES[selectedContractType].iconClass}`}>
                      {React.createElement(CONTRACT_TYPES[selectedContractType].icon, { size: 28 })}
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                        {CONTRACT_TYPES[selectedContractType].name}
                      </h2>
                      <p className="text-gray-600">{CONTRACT_TYPES[selectedContractType].description}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    Change Type
                  </button>
                </div>
              </div>

              {/* Upload or Loading State */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                {pdfAnalyzing ? (
                  <PremiumLoader message="Our AI is carefully reviewing your contract and extracting key information. This may take a moment for complex documents." />
                ) : !file ? (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                      Upload Your Contract
                    </h3>
                    <PDFUploadZone 
                      contractType={selectedContractType}
                      onAnalysisComplete={handlePDFAnalysisComplete}
                      onAnalysisStart={() => setPdfAnalyzing(true)}
                      disabled={pdfAnalyzing}
                    />
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="inline-flex items-center px-6 py-4 bg-gray-50 rounded-xl mb-6">
                      <FiFile className="w-6 h-6 text-blue-600 mr-3" />
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                      <button
                        onClick={() => {
                          setFile(null);
                          setExtractedData(null);
                          setAnalysisResult(null);
                        }}
                        className="ml-4 text-red-600 hover:text-red-700 transition-colors duration-200"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Analysis Results */}
              {analysisResult && extractedData && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Analysis Results</h3>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleCopy}
                        className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                      >
                        {copied ? (
                          <>
                            <FiCheck className="w-4 h-4 mr-2 text-green-600" />
                            <span className="text-green-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <FiCopy className="w-4 h-4 mr-2" />
                            Copy
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleDownloadReport}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                      >
                        <FiDownload className="w-4 h-4 mr-2" />
                        Download Report
                      </button>
                    </div>
                  </div>

                  {/* Contract-specific results */}
                  {selectedContractType === 'purchase' && (
                    <PurchaseContractCard data={extractedData} />
                  )}
                  {selectedContractType === 'listing' && (
                    <ListingContractCard data={extractedData} />
                  )}
                  {selectedContractType === 'lease' && (
                    <LeaseContractCard data={extractedData} />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}