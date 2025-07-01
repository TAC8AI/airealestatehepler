'use client';

import React, { useState } from 'react';
import { 
  FiTrendingUp, FiMapPin, FiSearch, FiDollarSign, FiAlertTriangle, 
  FiLoader, FiCheck, FiBarChart2, FiInfo, FiActivity, FiAward, 
  FiCalendar, FiTarget, FiStar, FiBookOpen, FiZap, FiHome
} from 'react-icons/fi';
import { supabase } from '../../../lib/supabase';

// Updated to match your current edge function output
interface SoldComp {
  addr: string;
  sold: string;
  ppsf: number;
  adj_price: number;
}

interface ValuationResult {
  headline_range: string;
  confidence_0to1: number;
  key_numbers: {
    price_per_sqft_subject: number;
    zip_median_ppsf: number;
    days_on_market_median: number;
    months_of_supply: number;
  };
  sold_comps: SoldComp[];
  active_comp_summary: string;
  market_context: string;
  micro_drivers: string[];
  agent_action_steps: string[];
  limitations: string;
}

export default function PropertyValuation() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [error, setError] = useState('');

  const hasValidMetrics = (keyNumbers: any) => {
    if (!keyNumbers) return false;
    return keyNumbers.price_per_sqft_subject > 0 || 
           keyNumbers.zip_median_ppsf > 0 || 
           keyNumbers.days_on_market_median > 0 || 
           keyNumbers.months_of_supply > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      setError('Please enter a property address');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Please log in to use this feature');
      }
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const functionUrl = `${supabaseUrl}/functions/v1/Property-Valuations`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ address: address.trim() }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to analyze property: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error analyzing property:', error);
      setError(`Failed to analyze property: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleNewAnalysis = () => {
    setAddress('');
    setResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-8">
        {/* Premium Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10 rounded-xl">
              <FiTrendingUp className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-tight">
                Property Valuation Analysis
              </h1>
              <p className="text-lg text-gray-400 mt-1">Professional-grade property analysis powered by AI</p>
            </div>
          </div>
        </div>

        {!result ? (
          /* Premium Input Form */
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-10 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Generate Market Intelligence Report</h2>
              <p className="text-gray-400">Get comprehensive market analysis worth $300+ in 30 seconds</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label htmlFor="address" className="block text-lg font-bold text-white mb-4">
                  Property Address
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter full property address (e.g., 1428 Freedom Pkwy, Winona Lake, IN)"
                    className="w-full pl-12 pr-4 py-4 text-lg bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    disabled={loading}
                  />
                </div>
                <p className="mt-3 text-sm text-gray-400">
                  Enter the complete address including street, city, and state for best results
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-sm">
                  <FiAlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <span className="text-red-300">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !address.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 flex items-center justify-center gap-3 text-lg shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/10"
              >
                {loading ? (
                  <>
                    <FiLoader className="h-5 w-5 animate-spin" />
                    Generating Intelligence Report...
                  </>
                ) : (
                  <>
                    <FiSearch className="h-5 w-5" />
                    Generate Market Intelligence Report
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Premium Results Display */
          <div className="space-y-8">
            {/* 1. Hero Section - Premium Dark Header */}
            <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 backdrop-blur-sm border border-white/10 text-white rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <FiAward className="h-6 w-6 text-yellow-400" />
                    <h2 className="text-2xl font-bold">Market Valuation Analysis</h2>
                  </div>
                  <p className="text-gray-300 text-lg">{address}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-300 text-sm">Analysis Confidence</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                    {(result.confidence_0to1 * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-5xl font-bold mb-2 tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {result.headline_range}
                </h3>
                <p className="text-xl text-gray-300">Estimated Market Value</p>
              </div>
            </div>

            {/* 2. Market Intelligence Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Market Context */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <FiBarChart2 className="h-5 w-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Market Context</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">{result.market_context}</p>
              </div>

              {/* Key Metrics */}
              {hasValidMetrics(result.key_numbers) && (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <FiActivity className="h-5 w-5 text-green-400" />
                    <h3 className="text-lg font-semibold text-white">Key Metrics</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {result.key_numbers.price_per_sqft_subject > 0 && (
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-sm text-gray-400">Price per sq ft</p>
                        <p className="text-lg font-semibold text-white">${result.key_numbers.price_per_sqft_subject}</p>
                      </div>
                    )}
                    {result.key_numbers.zip_median_ppsf > 0 && (
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-sm text-gray-400">Zip median PPSF</p>
                        <p className="text-lg font-semibold text-white">${result.key_numbers.zip_median_ppsf}</p>
                      </div>
                    )}
                    {result.key_numbers.days_on_market_median > 0 && (
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-sm text-gray-400">Days on market</p>
                        <p className="text-lg font-semibold text-white">{result.key_numbers.days_on_market_median}</p>
                      </div>
                    )}
                    {result.key_numbers.months_of_supply > 0 && (
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-sm text-gray-400">Months of supply</p>
                        <p className="text-lg font-semibold text-white">{result.key_numbers.months_of_supply.toFixed(1)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Comparable Sales */}
            {result.sold_comps && result.sold_comps.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <FiHome className="h-5 w-5 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">Recent Comparable Sales</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 text-sm font-medium text-gray-400">Address</th>
                        <th className="text-left py-3 text-sm font-medium text-gray-400">Sold Date</th>
                        <th className="text-left py-3 text-sm font-medium text-gray-400">Price/SF</th>
                        <th className="text-left py-3 text-sm font-medium text-gray-400">Adj. Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.sold_comps.map((comp, index) => (
                        <tr key={index} className="border-b border-white/5">
                          <td className="py-3 text-white">{comp.addr}</td>
                          <td className="py-3 text-gray-300">{comp.sold}</td>
                          <td className="py-3 text-gray-300">${comp.ppsf}</td>
                          <td className="py-3 text-white font-semibold">${comp.adj_price.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. Market Drivers */}
            {result.micro_drivers && result.micro_drivers.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <FiTarget className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-lg font-semibold text-white">Market Drivers</h3>
                </div>
                <ul className="space-y-2">
                  {result.micro_drivers.map((driver, index) => (
                    <li key={index} className="flex items-center gap-3 text-gray-300">
                      <FiCheck className="h-4 w-4 text-green-400 flex-shrink-0" />
                      {driver}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 5. Agent Action Steps */}
            {result.agent_action_steps && result.agent_action_steps.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <FiZap className="h-5 w-5 text-yellow-400" />
                  <h3 className="text-lg font-semibold text-white">Recommended Actions</h3>
                </div>
                <ul className="space-y-3">
                  {result.agent_action_steps.map((step, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-300">
                      <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 6. Limitations */}
            {result.limitations && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-3">
                  <FiInfo className="h-5 w-5 text-yellow-400" />
                  <h3 className="text-lg font-semibold text-white">Analysis Limitations</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">{result.limitations}</p>
              </div>
            )}

            {/* New Analysis Button */}
            <div className="text-center pt-8">
              <button
                onClick={handleNewAnalysis}
                className="bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 border border-white/10 backdrop-blur-sm"
              >
                Analyze Another Property
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
