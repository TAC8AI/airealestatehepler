'use client';

import React, { useState } from 'react';
import { FiTrendingUp, FiMapPin, FiSearch, FiDollarSign, FiAlertTriangle, FiLoader } from 'react-icons/fi';
import { supabase } from '../../../lib/supabase';

interface ValuationResult {
  headline_range: string;
  reasoning: string;
  caution: string;
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
      // Use Supabase Edge Function
      const useEdgeFunction = process.env.NEXT_PUBLIC_USE_EDGE_FUNCTION === 'true';
      
      let response;
      if (useEdgeFunction) {
        // Use Supabase Edge Function
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session:', session?.user?.email || 'No session');
        
        if (!session) {
          throw new Error('Please log in to use this feature');
        }
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const functionUrl = `${supabaseUrl}/functions/v1/Property-Valuations`;
        console.log('Calling edge function at:', functionUrl);
        
        response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ address: address.trim() }),
        });
        
        console.log('Edge function response status:', response.status);
        console.log('Edge function response headers:', response.headers);
      } else {
        // Use Next.js API route
        console.log('Using Next.js API route');
        response = await fetch('/api/property-valuation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ address: address.trim() }),
        });
      }

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
    <div className="min-h-screen bg-gradient-to-tr from-green-50 via-white to-blue-50 pb-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 p-6 rounded-xl shadow-lg bg-white/80 border border-green-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
              <FiTrendingUp className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-800">Property Valuation Analysis</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Get comprehensive market analysis and valuation insights for any property
          </p>
        </div>

        {!result ? (
          /* Input Form */
          <div className="card shadow-xl bg-white border border-green-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="address" className="block text-lg font-semibold text-gray-700 mb-3">
                  Property Address
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-500 h-5 w-5" />
                  <input
                    type="text"
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter full property address (e.g., 1428 Freedom Pkwy, Winona Lake, IN)"
                    className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    disabled={loading}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Enter the complete address including street, city, and state for best results
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <FiAlertTriangle className="h-5 w-5 text-red-500" />
                  <span className="text-red-700">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !address.trim()}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 flex items-center justify-center gap-3 text-lg shadow-lg"
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
          <div className="space-y-6">
            {/* Address Header */}
            <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white shadow-xl">
              <div className="flex items-center gap-3 mb-2">
                <FiMapPin className="h-6 w-6" />
                <h2 className="text-2xl font-bold">Property Analysis Results</h2>
              </div>
              <p className="text-green-100 text-lg">{address}</p>
            </div>

            {/* Valuation Range */}
            <div className="card shadow-xl bg-white border border-green-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                  <FiDollarSign className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Estimated Value Range</h3>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-8 rounded-lg border border-green-200">
                <div className="text-center">
                  <p className="text-4xl font-extrabold text-green-700 mb-4 tracking-tight">
                    {result.headline_range}
                  </p>
                  <p className="text-sm text-gray-600 font-medium">
                    Estimated Property Value Range
                  </p>
                </div>
                {result.confidence_score && (
                  <div className="flex items-center gap-2 mt-6">
                    <span className="text-sm text-gray-600">Confidence Level:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-3 max-w-xs">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${result.confidence_score * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-green-600 min-w-[40px]">
                      {Math.round(result.confidence_score * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Analysis Reasoning */}
            <div className="card shadow-xl bg-white border border-blue-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiTrendingUp className="h-5 w-5 text-blue-500" />
                Market Analysis
              </h3>
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                {/* Check if reasoning looks like JSON and format it properly */}
                {result.reasoning.startsWith('{') ? (
                  <div className="space-y-3">
                    <p className="text-gray-700 leading-relaxed text-lg">
                      Based on available market data and comparable properties in the area.
                    </p>
                    <details className="text-sm">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium">
                        View detailed analysis data
                      </summary>
                      <pre className="mt-2 p-3 bg-blue-100 rounded text-xs overflow-x-auto">
                        {JSON.stringify(JSON.parse(result.reasoning), null, 2)}
                      </pre>
                    </details>
                  </div>
                ) : (
                  <p className="text-gray-700 leading-relaxed text-lg">{result.reasoning}</p>
                )}
              </div>
            </div>

            {/* Important Caution */}
            <div className="card shadow-xl bg-white border border-orange-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiAlertTriangle className="h-5 w-5 text-orange-500" />
                Important Considerations
              </h3>
              <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                <p className="text-gray-700 leading-relaxed text-lg">{result.caution}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleNewAnalysis}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2 shadow-lg"
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
