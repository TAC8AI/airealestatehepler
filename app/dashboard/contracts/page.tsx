'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { FiPlus, FiSearch, FiArrowRight, FiCalendar, FiEye, FiFilter, FiFileText, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

interface Contract {
  id: string;
  title: string;
  contract_type: string;
  analysis_result: any;
  created_at: string;
  updated_at: string;
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchContracts();
  }, []);

  useEffect(() => {
    filterAndSortContracts();
  }, [contracts, searchTerm, filterType, sortBy]);

  const fetchContracts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }
      
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching contracts:', error);
      } else {
        setContracts(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortContracts = () => {
    let filtered = contracts.filter(contract => {
      const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || contract.contract_type === filterType;
      return matchesSearch && matchesType;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredContracts(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getContractTypeIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <FiCheckCircle className="h-5 w-5 text-green-600" />;
      case 'lease':
        return <FiFileText className="h-5 w-5 text-blue-600" />;
      case 'listing':
        return <FiAlertTriangle className="h-5 w-5 text-orange-600" />;
      default:
        return <FiFileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getContractTypeColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'bg-green-100 text-green-800';
      case 'lease':
        return 'bg-blue-100 text-blue-800';
      case 'listing':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevel = (analysis: any) => {
    if (!analysis) return 'Unknown';
    if (analysis.risk_level) return analysis.risk_level;
    if (analysis.riskAssessment) return analysis.riskAssessment.overallRisk;
    return 'Unknown';
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const uniqueContractTypes = ['all', ...Array.from(new Set(contracts.map(c => c.contract_type).filter(Boolean)))];

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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Contract Analysis</h1>
            <p className="text-gray-600">Manage all your AI-analyzed contracts and documents</p>
          </div>
          <Link 
            href="/dashboard/contract-analysis"
            className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 hover:scale-105"
          >
            <FiPlus className="h-4 w-4" />
            Analyze New Contract
          </Link>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search contracts by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          
          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-400 h-5 w-5" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
            >
              {uniqueContractTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          {/* Sort Filter */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'title')}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>
        </div>
        
        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          {filteredContracts.length} of {contracts.length} contracts
        </div>
      </div>

      {/* Contracts Grid */}
      {filteredContracts.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredContracts.map((contract) => (
            <div
              key={contract.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {getContractTypeIcon(contract.contract_type)}
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-black transition-colors">
                      {contract.title}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    {contract.contract_type && (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getContractTypeColor(contract.contract_type)}`}>
                        {contract.contract_type.charAt(0).toUpperCase() + contract.contract_type.slice(1)}
                      </span>
                    )}
                    
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskColor(getRiskLevel(contract.analysis_result))}`}>
                      Risk: {getRiskLevel(contract.analysis_result)}
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="w-12 h-12 bg-gray-100 group-hover:bg-gray-200 rounded-xl flex items-center justify-center transition-all">
                    <FiArrowRight className="h-6 w-6 text-gray-600 group-hover:text-black group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <FiCalendar className="h-4 w-4" />
                  Analyzed {formatDate(contract.created_at)}
                </div>
                <div className="flex items-center gap-2">
                  <FiEye className="h-4 w-4" />
                  View Analysis
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <FiFileText className="h-12 w-12 text-gray-600" />
          </div>
          
          {searchTerm || filterType !== 'all' ? (
            <>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No contracts found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                No contracts match your current filters. Try adjusting your search or filter settings.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl font-semibold transition-all duration-300"
              >
                Clear Filters
              </button>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Analyze your first contract</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Upload any real estate contract and get instant AI-powered risk analysis and insights.
              </p>
              <Link 
                href="/dashboard/contract-analysis"
                className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
              >
                <FiPlus className="h-5 w-5" />
                Analyze Your First Contract
              </Link>
            </>
          )}
        </div>
      )}

      {/* View All from Features */}
      {filteredContracts.length > 0 && (
        <div className="mt-16 text-center">
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Need to analyze another contract?</h3>
            <p className="text-gray-600 mb-6">Get instant AI-powered risk analysis on any document</p>
            <Link 
              href="/dashboard/contract-analysis"
              className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <FiPlus className="h-4 w-4" />
              Analyze New Contract
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 