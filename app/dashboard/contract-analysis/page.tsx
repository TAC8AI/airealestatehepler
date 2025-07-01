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

// Premium contract type configuration with glassmorphism styling
const CONTRACT_TYPES = {
  purchase: {
    id: 'purchase' as ContractType,
    name: 'Purchase Agreement',
    description: 'Buyer-seller purchase agreements and offers to purchase',
    color: 'blue',
    icon: FiHome,
    bgClass: 'bg-white/5 backdrop-blur-sm border border-white/10 hover:border-blue-400/50 hover:bg-white/10',
    buttonClass: 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white',
    iconClass: 'text-blue-400'
  },
  listing: {
    id: 'listing' as ContractType,
    name: 'Listing Agreement',
    description: 'Seller-broker listing agreements and representation contracts',
    color: 'green',
    icon: FiFileText,
    bgClass: 'bg-white/5 backdrop-blur-sm border border-white/10 hover:border-green-400/50 hover:bg-white/10',
    buttonClass: 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white',
    iconClass: 'text-green-400'
  },
  lease: {
    id: 'lease' as ContractType,
    name: 'Lease Agreement',
    description: 'Residential and commercial lease agreements',
    color: 'purple',
    icon: FiKey,
    bgClass: 'bg-white/5 backdrop-blur-sm border border-white/10 hover:border-purple-400/50 hover:bg-white/10',
    buttonClass: 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white',
    iconClass: 'text-purple-400'
  }
};

// Premium Loading Component with dark theme
function PremiumLoader({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-white/10 rounded-full"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-400 rounded-full"></div>
      </div>
      <div className="mt-6 text-center">
        <h3 className="text-lg font-semibold text-white mb-2">Analyzing Contract</h3>
        <p className="text-gray-400 max-w-sm">{message}</p>
      </div>
    </div>
  );
}

// Premium PDF Upload Zone with dark glassmorphism styling
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
        relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ease-out backdrop-blur-sm
        ${dragActive 
          ? 'border-blue-400 bg-blue-500/10 scale-[1.02] shadow-lg' 
          : 'border-white/20 hover:border-white/30 hover:bg-white/5'
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
        <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center">
          <FiUpload className="w-8 h-8 text-white" />
        </div>
        
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {dragActive ? 'Drop your contract here' : 'Upload Contract'}
          </h3>
          <p className="text-gray-300 mb-1">
            Drag and drop your PDF file or click to browse
          </p>
          <p className="text-sm text-gray-400">
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
        const monthlyLimit = userPlan === 'premium' ? 100 : 1;

        setUsageInfo({
          currentUsage,
          monthlyLimit,
          plan: userPlan
        });
      } catch (error) {
        console.error('Failed to fetch usage info:', error);
      }
    };

    fetchUsageInfo();
  }, []);

  const handlePDFAnalysisComplete = async (result: any) => {
    setPdfAnalyzing(false);
    if (result.success) {
      setExtractedData(result.data);
      // Edge Function already did all the analysis and saved to database
      // Just display the results directly!
      setAnalysisResult({ summary: 'Analysis completed via Edge Function' });
    } else {
      setNotification({
        message: result.message || 'Failed to extract data from PDF',
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
    setNotification(null);
  };

  const handleDownloadReport = () => {
    // Implementation for downloading analysis report
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-6">
        {/* Premium Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
            Contract Analysis
          </h1>
          <p className="text-gray-400">Upload your contract and get AI-powered insights in seconds</p>
        </div>

        {/* Usage Info Bar */}
        {usageInfo && (
          <div className="mb-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-400">Monthly Usage ({usageInfo.plan === 'premium' ? 'Premium' : 'Free'} Plan)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">{usageInfo.currentUsage} / {usageInfo.monthlyLimit}</span>
                {usageInfo.currentUsage >= usageInfo.monthlyLimit && (
                  <span className="text-red-400 text-sm">
                    You've reached your monthly limit. Upgrade your plan for more analyses.
                  </span>
                )}
              </div>
            </div>
            <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((usageInfo.currentUsage / usageInfo.monthlyLimit) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Step 1: Contract Type Selection */}
        {!selectedContractType && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Choose Contract Type</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.values(CONTRACT_TYPES).map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedContractType(type.id)}
                    className={`${type.bgClass} rounded-xl p-6 transition-all duration-300 transform hover:scale-105 text-center shadow-lg hover:shadow-xl`}
                  >
                    <div className="flex flex-col items-center space-y-4">
                      <div className="p-4 bg-gradient-to-r from-white/10 to-white/5 rounded-full">
                        <Icon className={`h-8 w-8 ${type.iconClass}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">{type.name}</h3>
                        <p className="text-sm text-gray-400">{type.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: File Upload */}
        {selectedContractType && !extractedData && !pdfAnalyzing && !loading && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg">
                    {React.createElement(CONTRACT_TYPES[selectedContractType].icon, { 
                      className: `h-6 w-6 ${CONTRACT_TYPES[selectedContractType].iconClass}` 
                    })}
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    Upload {CONTRACT_TYPES[selectedContractType].name}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedContractType(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Change Type
                </button>
              </div>
            </div>

            <PDFUploadZone
              contractType={selectedContractType}
              onAnalysisComplete={handlePDFAnalysisComplete}
              onAnalysisStart={() => setPdfAnalyzing(true)}
              disabled={pdfAnalyzing || loading}
            />
          </div>
        )}

        {/* Step 3: Processing State */}
        {(pdfAnalyzing || loading) && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
            <PremiumLoader 
              message={pdfAnalyzing ? "Extracting contract data..." : "Analyzing contract terms and clauses..."} 
            />
          </div>
        )}

        {/* Step 4: Analysis Results */}
        {analysisResult && selectedContractType && (
          <div className="space-y-6">
            {/* Results Header */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg">
                    <FiCheck className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Analysis Complete</h2>
                    <p className="text-gray-400">Contract reviewed and analyzed successfully</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2"
                  >
                    {copied ? <FiCheck className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={handleReset}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2"
                  >
                    <FiTrash2 className="h-4 w-4" />
                    New Analysis
                  </button>
                </div>
              </div>
            </div>

                         {/* Contract-specific Analysis Component */}
             {selectedContractType === 'lease' && extractedData && (
               <LeaseContractCard data={extractedData} />
             )}
             {selectedContractType === 'purchase' && extractedData && (
               <PurchaseContractCard data={extractedData} />
             )}
             {selectedContractType === 'listing' && extractedData && (
               <ListingContractCard data={extractedData} />
             )}
          </div>
        )}

        {/* Notification */}
        {notification && (
          <div className={`fixed bottom-6 right-6 p-4 rounded-lg shadow-lg backdrop-blur-sm border z-50 ${
            notification.type === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-300' :
            notification.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-300' :
            'bg-yellow-500/20 border-yellow-500/30 text-yellow-300'
          }`}>
            <p>{notification.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}