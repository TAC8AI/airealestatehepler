'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { FiPlus, FiSearch, FiArrowRight, FiCalendar, FiEye, FiFilter, FiHome, FiMapPin, FiTrendingUp } from 'react-icons/fi';

interface PropertyValuation {
  id: string;
  address: string;
  valuation_result: any;
  created_at: string;
  updated_at: string;
}

export default function PropertyValuationsPage() {
  const [valuations, setValuations] = useState<PropertyValuation[]>([]);
  const [filteredValuations, setFilteredValuations] = useState<PropertyValuation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'address'>('newest');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchValuations();
  }, []);

  useEffect(() => {
    filterAndSortValuations();
  }, [valuations, searchTerm, sortBy]);

  const fetchValuations = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }
      
      const { data, error } = await supabase
        .from('property_valuations')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching property valuations:', error);
      } else {
        setValuations(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortValuations = () => {
    let filtered = valuations.filter(valuation =>
      valuation.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'address':
          return a.address.localeCompare(b.address);
        default:
          return 0;
      }
    });

    setFilteredValuations(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getEstimatedValue = (valuation: any) => {
    if (!valuation) return null;
    
    // Try different possible properties where the estimated value might be stored
    if (valuation.estimated_value) return valuation.estimated_value;
    if (valuation.estimatedValue) return valuation.estimatedValue;
    if (valuation.propertyValue) return valuation.propertyValue;
    if (valuation.marketValue) return valuation.marketValue;
    
    return null;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleValuationClick = (valuationId: string) => {
    router.push(`/dashboard/property-valuations/${valuationId}`);
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Property Valuations</h1>
            <p className="text-gray-600">Manage all your AI-powered market intelligence reports</p>
          </div>
          <Link 
            href="/dashboard/property-valuation"
            className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 hover:scale-105"
          >
            <FiPlus className="h-4 w-4" />
            Create New Valuation
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
              placeholder="Search by property address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          
          {/* Sort Filter */}
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-400 h-5 w-5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'address')}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="address">Address A-Z</option>
            </select>
          </div>
        </div>
        
        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          {filteredValuations.length} of {valuations.length} valuations
        </div>
      </div>

      {/* Valuations Grid */}
      {filteredValuations.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredValuations.map((valuation) => {
            const estimatedValue = getEstimatedValue(valuation.valuation_result);
            
            return (
              <div
                key={valuation.id}
                onClick={() => handleValuationClick(valuation.id)}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <FiHome className="h-5 w-5 text-gray-600" />
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-black transition-colors">
                        {valuation.address}
                      </h3>
                    </div>
                    
                    {estimatedValue && (
                      <div className="flex items-center gap-2 mb-4">
                        <FiTrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-2xl font-bold text-green-600">
                          {formatCurrency(estimatedValue)}
                        </span>
                        <span className="text-sm text-gray-500">estimated value</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiMapPin className="h-4 w-4" />
                      <span className="text-sm">Market Intelligence Report</span>
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
                    Analyzed {formatDate(valuation.created_at)}
                  </div>
                  <div className="flex items-center gap-2">
                    <FiEye className="h-4 w-4" />
                    View Report
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <FiHome className="h-12 w-12 text-gray-600" />
          </div>
          
          {searchTerm ? (
            <>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No valuations found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                No valuations match your search "{searchTerm}". Try adjusting your search terms.
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl font-semibold transition-all duration-300"
              >
                Clear Search
              </button>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Get your first property valuation</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Generate detailed market intelligence reports for any property with AI-powered analysis.
              </p>
              <Link 
                href="/dashboard/property-valuation"
                className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
              >
                <FiPlus className="h-5 w-5" />
                Create Your First Valuation
              </Link>
            </>
          )}
        </div>
      )}

      {/* View All from Features */}
      {filteredValuations.length > 0 && (
        <div className="mt-16 text-center">
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Need another market analysis?</h3>
            <p className="text-gray-600 mb-6">Get comprehensive market intelligence for any property</p>
            <Link 
              href="/dashboard/property-valuation"
              className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <FiPlus className="h-4 w-4" />
              Create New Valuation
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 