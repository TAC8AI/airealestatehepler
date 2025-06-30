'use client';

import React, { useState } from 'react';
import { 
  FiTrendingUp, FiMapPin, FiSearch, FiDollarSign, FiAlertTriangle, 
  FiLoader, FiCheck, FiBarChart2, FiInfo, FiActivity, FiAward, 
  FiCalendar, FiTarget, FiStar, FiBookOpen, FiZap
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Clean Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gray-100 rounded-xl">
              <FiTrendingUp className="h-8 w-8 text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Property Valuation Analysis</h1>
              <p className="text-lg text-gray-600 mt-1">Professional-grade property analysis powered by AI</p>
            </div>
          </div>
        </div>

        {!result ? (
          /* Clean Input Form */
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate Market Intelligence Report</h2>
              <p className="text-gray-600">Get comprehensive market analysis worth $300+ in 30 seconds</p>
            </div>
            
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
          /* Clean Results Display */
          <div className="space-y-8">
            {/* 1. Hero Section - Clean Black Header */}
            <div className="bg-black text-white rounded-3xl p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <FiAward className="h-6 w-6" />
                    <h2 className="text-2xl font-bold">Market Valuation Analysis</h2>
                  </div>
                  <p className="text-gray-300 text-lg">{address}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-300 text-sm">Analysis Confidence</p>
                  <p className="text-3xl font-bold">{(result.confidence_0to1 * 100).toFixed(0)}%</p>
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-5xl font-bold mb-2 tracking-tight">
                  {result.headline_range}
                </h3>
                <p className="text-xl text-gray-300">Estimated Market Value</p>
              </div>
            </div>

            {/* 2. Market Intelligence Narrative - THE STAR */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 p-3 bg-gray-100 rounded-xl mb-4">
                  <FiBookOpen className="h-6 w-6 text-black" />
                  <h2 className="text-2xl font-bold text-gray-900">Market Intelligence Report</h2>
                </div>
                <p className="text-gray-600">AI-powered analysis of current market conditions and trends</p>
              </div>

              <div className="space-y-8">
                {result.market_context && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FiActivity className="h-5 w-5 text-black" />
                      Market Overview & Trends
                    </h3>
                    <div className="bg-gray-50 p-6 rounded-xl border-l-4 border-black">
                      <p className="text-gray-800 leading-relaxed text-lg whitespace-pre-wrap">{result.market_context}</p>
                    </div>
                  </div>
                )}

                {result.active_comp_summary && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FiTarget className="h-5 w-5 text-black" />
                      Current Market Inventory
                    </h3>
                    <div className="bg-gray-50 p-6 rounded-xl border-l-4 border-gray-400">
                      <p className="text-gray-800 leading-relaxed text-lg whitespace-pre-wrap">{result.active_comp_summary}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Strategic Insights - CO-STAR */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Market Drivers */}
              {result.micro_drivers && result.micro_drivers.length > 0 && (
                <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-3 p-3 bg-gray-100 rounded-xl mb-4">
                      <FiZap className="h-6 w-6 text-black" />
                      <h3 className="text-xl font-bold text-gray-900">Key Market Drivers</h3>
                    </div>
                    <p className="text-gray-600">Factors influencing property values in this area</p>
                  </div>
                  <ul className="space-y-4">
                    {result.micro_drivers.map((driver, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 rounded-full mt-1 flex-shrink-0">
                          <FiTrendingUp className="h-4 w-4 text-black" />
                        </div>
                        <span className="text-gray-700 leading-relaxed text-lg">{driver}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Strategic Recommendations */}
              {result.agent_action_steps && result.agent_action_steps.length > 0 && (
                <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-3 p-3 bg-gray-100 rounded-xl mb-4">
                      <FiStar className="h-6 w-6 text-black" />
                      <h3 className="text-xl font-bold text-gray-900">Strategic Recommendations</h3>
                    </div>
                    <p className="text-gray-600">Actionable insights for real estate professionals</p>
                  </div>
                  <ul className="space-y-4">
                    {result.agent_action_steps.map((step, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 rounded-full mt-1 flex-shrink-0">
                          <FiCheck className="h-4 w-4 text-black" />
                        </div>
                        <span className="text-gray-700 leading-relaxed text-lg">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 4. Sold Comparables - Only if data exists */}
            {result.sold_comps && result.sold_comps.length > 0 && (
              <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-3 p-3 bg-gray-100 rounded-xl mb-4">
                    <FiBarChart2 className="h-6 w-6 text-black" />
                    <h3 className="text-xl font-bold text-gray-900">Recent Comparable Sales</h3>
                  </div>
                  <p className="text-gray-600">Similar properties sold in the local market</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-4 text-left text-sm font-bold text-gray-900">Property Address</th>
                        <th className="px-4 py-4 text-left text-sm font-bold text-gray-900">Sale Date</th>
                        <th className="px-4 py-4 text-left text-sm font-bold text-gray-900">Price/SqFt</th>
                        <th className="px-4 py-4 text-left text-sm font-bold text-gray-900">Sale Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.sold_comps.map((comp, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-4 py-4 text-sm text-gray-900 font-medium">{comp.addr}</td>
                          <td className="px-4 py-4 text-sm text-gray-700">{comp.sold}</td>
                          <td className="px-4 py-4 text-sm text-gray-700">${comp.ppsf}</td>
                          <td className="px-4 py-4 text-sm text-gray-700 font-semibold">${comp.adj_price.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 5. Market Metrics - Only if valid data exists */}
            {result.key_numbers && hasValidMetrics(result.key_numbers) && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FiBarChart2 className="h-5 w-5 text-gray-600" />
                  Market Metrics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {result.key_numbers.price_per_sqft_subject > 0 && (
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <p className="text-2xl font-bold text-gray-900">${result.key_numbers.price_per_sqft_subject}</p>
                      <p className="text-sm text-gray-600">Subject PPSF</p>
                    </div>
                  )}
                  {result.key_numbers.zip_median_ppsf > 0 && (
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <p className="text-2xl font-bold text-gray-900">${result.key_numbers.zip_median_ppsf}</p>
                      <p className="text-sm text-gray-600">ZIP Median PPSF</p>
                    </div>
                  )}
                  {result.key_numbers.days_on_market_median > 0 && (
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <p className="text-2xl font-bold text-gray-900">{result.key_numbers.days_on_market_median}</p>
                      <p className="text-sm text-gray-600">Avg Days on Market</p>
                    </div>
                  )}
                  {result.key_numbers.months_of_supply > 0 && (
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <p className="text-2xl font-bold text-gray-900">{result.key_numbers.months_of_supply}</p>
                      <p className="text-sm text-gray-600">Months Supply</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 6. Transparency Footer */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiInfo className="h-5 w-5 text-gray-600" />
                Analysis Limitations & Disclaimers
              </h4>
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                <p className="text-amber-800 leading-relaxed">
                  {result.limitations || "This analysis is based on available market data and AI interpretation. For formal valuations, consult with a licensed real estate professional or certified appraiser."}
                </p>
              </div>
            </div>

            {/* Action Button */}
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
