'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';
import { FiArrowLeft, FiShare2, FiCopy, FiCheck, FiFileText, FiCalendar, FiDownload, FiTrash2 } from 'react-icons/fi';
import LeaseContractCard from '../../../../components/contract-cards/LeaseContractCard';
import PurchaseContractCard from '../../../../components/contract-cards/PurchaseContractCard';
import ListingContractCard from '../../../../components/contract-cards/ListingContractCard';

interface Contract {
  id: string;
  file_name: string;
  contract_type: 'purchase' | 'listing' | 'lease';
  extracted_data: any;
  confidence_score: number;
  created_at: string;
  user_id: string;
}

export default function ContractDetail() {
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const params = useParams();
  const router = useRouter();
  const contractId = params.id;

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/login');
          return;
        }

        const { data, error } = await supabase
          .from('contracts')
          .select('*')
          .eq('id', contractId)
          .eq('user_id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching contract:', error);
          router.push('/dashboard');
          return;
        }

        setContract(data);
      } catch (error) {
        console.error('Error:', error);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (contractId) {
      fetchContract();
    }
  }, [contractId, router]);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(text, null, 2));
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDelete = async () => {
    if (!contract || !confirm('Are you sure you want to delete this contract analysis? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', contract.id);

      if (error) throw error;

      router.push('/dashboard/contracts');
    } catch (error) {
      console.error('Error deleting contract:', error);
      alert('Failed to delete contract. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const downloadReport = () => {
    if (!contract) return;

    const reportData = {
      fileName: contract.file_name,
      contractType: contract.contract_type,
      analysisResult: contract.extracted_data,
      confidenceScore: contract.confidence_score,
      analyzedAt: contract.created_at
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contract.file_name.replace('.pdf', '')}_analysis.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatConfidence = (score: number) => {
    // Handle both decimal (0.85) and percentage (85) formats
    const percentage = score > 1 ? Math.round(score) : Math.round(score * 100);
    return `${percentage}%`;
  };

  const getConfidenceColor = (score: number) => {
    // Normalize score to 0-1 range for comparison
    const normalizedScore = score > 1 ? score / 100 : score;
    if (normalizedScore >= 0.8) return 'text-green-600 bg-green-100';
    if (normalizedScore >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getContractTypeInfo = (type: string) => {
    switch (type) {
      case 'purchase':
        return { name: 'Purchase Agreement', color: 'blue', emoji: '🏠' };
      case 'listing':
        return { name: 'Listing Agreement', color: 'green', emoji: '📋' };
      case 'lease':
        return { name: 'Lease Agreement', color: 'purple', emoji: '🔑' };
      default:
        return { name: 'Contract', color: 'gray', emoji: '📄' };
    }
  };

  const mapDataForCard = (rawData: any, contractType: string) => {
    if (!rawData) return {};

    switch (contractType) {
      case 'purchase':
        return {
          property_address: rawData.property_legal_description || rawData.property_address,
          purchase_price: rawData.offer_price || rawData.purchase_price,
          earnest_money: rawData.earnest_money_amount || rawData.earnest_money,
          closing_date: rawData.important_dates?.closing_date || rawData.closing_date,
          buyer_name: rawData.buyer || rawData.buyer_name,
          seller_name: rawData.seller || rawData.seller_name,
          financing_contingency: rawData.contingencies?.financing ? 'Yes' : 'No',
          appraisal_contingency: rawData.contingencies?.appraisal ? 'Yes' : 'No',
          sale_contingency: rawData.contingencies?.sale_of_other_home ? 'Yes' : 'No',
          financing_type: rawData.financing_terms?.loan_type || rawData.financing_type,
          down_payment: rawData.financing_terms?.down_payment_pct ? `${rawData.financing_terms.down_payment_pct}%` : rawData.down_payment
        };
      case 'listing':
        return {
          property_address: rawData.property_address,
          seller_name: rawData.seller || rawData.seller_name,
          brokerage_name: rawData.brokerage_name,
          listing_agent: rawData.listing_agent,
          list_price: rawData.list_price,
          commission_rate: rawData.commission_pct ? `${rawData.commission_pct}%` : rawData.commission_rate,
          agreement_start_date: rawData.agreement_start_date,
          expiration_date: rawData.expiration_date,
          exclusive_agreement: rawData.exclusive_or_open || rawData.exclusive_agreement,
          mls_permission: rawData.mls_marketing_permission || rawData.mls_permission
        };
      case 'lease':
        // Lease card is already updated to match the correct structure
        return rawData;
      default:
        return rawData;
    }
  };

  const renderContractCard = () => {
    if (!contract?.extracted_data) {
      console.log('No extracted_data found:', contract?.extracted_data);
      return null;
    }

    console.log('Full extracted_data:', contract.extracted_data);
    const rawData = contract.extracted_data.extractedData || contract.extracted_data;
    console.log('Raw data for mapping:', rawData);
    const mappedData = mapDataForCard(rawData, contract.contract_type);
    console.log('Mapped data:', mappedData);

    const props = {
      data: mappedData,
      confidence: contract.confidence_score > 1 ? Math.round(contract.confidence_score) : Math.round(contract.confidence_score * 100),
      fileName: contract.file_name
    };

    switch (contract.contract_type) {
      case 'purchase':
        return <PurchaseContractCard {...props} />;
      case 'listing':
        return <ListingContractCard {...props} />;
      case 'lease':
        return <LeaseContractCard {...props} />;
      default:
        return (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Contract Analysis - {contract.contract_type}</h3>
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Mapped Data:</h4>
              <pre className="bg-gray-50 rounded-lg p-4 text-sm overflow-auto max-h-64">
                {JSON.stringify(mappedData, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Raw Analysis Result:</h4>
              <pre className="bg-gray-50 rounded-lg p-4 text-sm overflow-auto max-h-64">
                {JSON.stringify(contract.extracted_data, null, 2)}
              </pre>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Contract not found</h1>
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const contractInfo = getContractTypeInfo(contract.contract_type);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <FiArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{contractInfo.emoji}</span>
                  <h1 className="text-2xl font-bold text-gray-900">{contractInfo.name}</h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(contract.confidence_score)}`}>
                    {formatConfidence(contract.confidence_score)} Confidence
                  </span>
                </div>
                <p className="text-gray-500 flex items-center gap-2">
                  <FiFileText className="h-4 w-4" />
                  {contract.file_name}
                  <span className="mx-2">•</span>
                  <FiCalendar className="h-4 w-4" />
                  Analyzed {formatDate(contract.created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => copyToClipboard(contract.extracted_data, 'analysis')}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
              >
                {copiedField === 'analysis' ? (
                  <>
                    <FiCheck className="h-4 w-4 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <FiCopy className="h-4 w-4" />
                    Copy Data
                  </>
                )}
              </button>
              <button 
                onClick={downloadReport}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
              >
                <FiDownload className="h-4 w-4" />
                Download
              </button>
              <button 
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
              >
                <FiTrash2 className="h-4 w-4" />
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
              <Link 
                href="/dashboard/contract-analysis"
                className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-xl transition-all"
              >
                <FiFileText className="h-4 w-4" />
                Analyze New Contract
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Contract Analysis Display */}
        <div className="space-y-8">
          {renderContractCard()}

          {/* Summary Section (if available) */}
          {contract.extracted_data?.summary && (
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiFileText className="h-5 w-5 text-blue-600" />
                Analysis Summary
              </h3>
              <div className="prose max-w-none text-gray-700">
                <p className="text-lg leading-relaxed">{contract.extracted_data.summary}</p>
              </div>
            </div>
          )}

          {/* Raw Data Section (Collapsible) */}
          <details className="bg-white rounded-3xl shadow-lg border border-gray-200">
            <summary className="cursor-pointer p-8 font-bold text-gray-900 hover:bg-gray-50 transition-colors">
              Raw Analysis Data (Click to expand)
            </summary>
            <div className="px-8 pb-8">
              <pre className="bg-gray-50 rounded-lg p-4 text-sm overflow-auto max-h-96">
                {JSON.stringify(contract.extracted_data, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
} 