'use client';

import React, { useState } from 'react';
import { FiTrendingUp, FiMapPin, FiSearch, FiDollarSign, FiAlertTriangle, FiLoader, FiCheck, FiBarChart2, FiInfo } from 'react-icons/fi';
import { supabase } from '../../../lib/supabase';

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
  // Legacy fields for backward compatibility
  reasoning?: string;
  caution?: string;
  confidence_score?: number;
}

export default function PropertyValuation() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [error, setError] = useState('');

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
      // Always use Supabase Edge Function
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session:', session?.user?.email || 'No session');
      
      if (!session) {
        throw new Error('Please log in to use this feature');
      }
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const functionUrl = `${supabaseUrl}/functions/v1/Property-Valuations`;
      console.log('Calling edge function at:', functionUrl);
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ address: address.trim() }),
      });
      
      console.log('Edge function response status:', response.status);
      console.log('Edge function response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`Failed to analyze property: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
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
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Clean Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gray-100 rounded-xl">
              <FiTrendingUp className="h-8 w-8 text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Property Valuation Analysis</h1>
              <p className="text-lg text-gray-600 mt-1">Get comprehensive market analysis and valuation insights for any property</p>
            </div>
          </div>
        </div>

        {!result ? (
          /* Input Form */
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label htmlFor="address" className="block text-lg font-bold text-gray-900 mb-4">
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
                    className="w-full pl-12 pr-4 py-4 text-lg bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-300"
                    disabled={loading}
                  />
                </div>
                <p className="mt-3 text-sm text-gray-500">
                  Enter the complete address including street, city, and state for best results
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <FiAlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <span className="text-red-700">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !address.trim()}
                className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 flex items-center justify-center gap-3 text-lg shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <FiLoader className="h-5 w-5 animate-spin" />
                    Analyzing Property...
                  </>
                ) : (
                  <>
                    <FiSearch className="h-5 w-5" />
                    Analyze Property Value
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Results Display */
          <div className="space-y-8">
            {/* Address Header */}
            <div className="bg-gradient-to-r from-black to-gray-800 text-white rounded-3xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <FiMapPin className="h-6 w-6" />
                <h2 className="text-2xl font-bold">Property Analysis Results</h2>
              </div>
              <p className="text-gray-200 text-lg">{address}</p>
            </div>

            {/* Headline Range Card */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-10 text-center">
              <h2 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                {result.headline_range}
              </h2>
              <p className="text-lg text-gray-600">
                Confidence: {(result.confidence_0to1 * 100).toFixed(0)}%
              </p>
            </div>

            {/* Key Numbers Grid */}
            {result.key_numbers && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center hover:shadow-xl transition-shadow duration-300">
                  <p className="text-3xl font-bold text-gray-900 mb-2">${result.key_numbers.price_per_sqft_subject}</p>
                  <p className="text-sm font-semibold text-gray-600">Price/SqFt Subject</p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center hover:shadow-xl transition-shadow duration-300">
                  <p className="text-3xl font-bold text-gray-900 mb-2">${result.key_numbers.zip_median_ppsf}</p>
                  <p className="text-sm font-semibold text-gray-600">ZIP Median PPSF</p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center hover:shadow-xl transition-shadow duration-300">
                  <p className="text-3xl font-bold text-gray-900 mb-2">{result.key_numbers.days_on_market_median}</p>
                  <p className="text-sm font-semibold text-gray-600">Days on Market</p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center hover:shadow-xl transition-shadow duration-300">
                  <p className="text-3xl font-bold text-gray-900 mb-2">{result.key_numbers.months_of_supply}</p>
                  <p className="text-sm font-semibold text-gray-600">Months of Supply</p>
                </div>
              </div>
            )}

            {/* Sold Comparables Table */}
            {result.sold_comps && result.sold_comps.length > 0 && (
              <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <FiBarChart2 className="h-5 w-5 text-black" />
                  </div>
                  Sold Comparables
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-4 text-left text-sm font-bold text-gray-900">Address</th>
                        <th className="px-4 py-4 text-left text-sm font-bold text-gray-900">Sold Date</th>
                        <th className="px-4 py-4 text-left text-sm font-bold text-gray-900">PPSF</th>
                        <th className="px-4 py-4 text-left text-sm font-bold text-gray-900">Adj. Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.sold_comps.map((comp, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-4 py-4 text-sm text-gray-900 font-medium">{comp.addr}</td>
                          <td className="px-4 py-4 text-sm text-gray-700">{comp.sold}</td>
                          <td className="px-4 py-4 text-sm text-gray-700">${comp.ppsf}</td>
                          <td className="px-4 py-4 text-sm text-gray-700">${comp.adj_price.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Market Context & Active Comparables Info Box */}
            {(result.active_comp_summary || result.market_context) && (
              <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <FiInfo className="h-5 w-5 text-black" />
                  </div>
                  Market Context
                </h3>
                <div className="bg-gray-50 p-6 rounded-2xl space-y-6">
                  {result.market_context && (
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">Market Overview</h4>
                      <p className="text-gray-700 leading-relaxed">{result.market_context}</p>
                    </div>
                  )}
                  {result.active_comp_summary && (
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">Active Comparables</h4>
                      <p className="text-gray-700 leading-relaxed">{result.active_comp_summary}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Side-by-side lists: Micro Drivers & Agent Action Steps */}
            {(result.micro_drivers || result.agent_action_steps) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Micro Drivers */}
                {result.micro_drivers && result.micro_drivers.length > 0 && (
                  <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <FiTrendingUp className="h-5 w-5 text-black" />
                      </div>
                      Market Drivers
                    </h3>
                    <ul className="space-y-4">
                      {result.micro_drivers.map((driver, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="p-1 bg-gray-100 rounded-full mt-1 flex-shrink-0">
                            <FiCheck className="h-3 w-3 text-black" />
                          </div>
                          <span className="text-gray-700 leading-relaxed">{driver}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Agent Action Steps */}
                {result.agent_action_steps && result.agent_action_steps.length > 0 && (
                  <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <FiDollarSign className="h-5 w-5 text-black" />
                      </div>
                      Action Steps
                    </h3>
                    <ul className="space-y-4">
                      {result.agent_action_steps.map((step, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="p-1 bg-gray-100 rounded-full mt-1 flex-shrink-0">
                            <FiCheck className="h-3 w-3 text-black" />
                          </div>
                          <span className="text-gray-700 leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Important Considerations */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FiAlertTriangle className="h-5 w-5 text-black" />
                </div>
                Important Considerations
              </h3>
              <div className="bg-gray-50 p-6 rounded-2xl">
                <p className="text-gray-700 leading-relaxed text-lg">
                  {result.limitations || result.caution || "This analysis is based on available market data and should be used as a general guide. Consider getting a professional appraisal for precise valuation."}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center">
              <button
                onClick={handleNewAnalysis}
                className="bg-black hover:bg-gray-800 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 shadow-lg hover:shadow-xl"
              >
                <FiSearch className="h-5 w-5" />
                Analyze Another Property
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
