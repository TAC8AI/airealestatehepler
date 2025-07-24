'use client';

import React, { useState } from 'react';
import { 
  FiTrendingUp, FiMapPin, FiSearch, FiDollarSign, FiAlertTriangle, 
  FiLoader, FiCheck, FiBarChart2, FiInfo, FiActivity, FiAward, 
  FiCalendar, FiTarget, FiStar, FiBookOpen, FiZap, FiHome, FiCopy
} from 'react-icons/fi';
import { supabase } from '../../../lib/supabase';
import { LoadingScreen, PROPERTY_VALUATION_STEPS } from '@/components/ui/loading-screen';
import { SEOHead } from '@/components/ui/seo-head';

// Updated to match your Sarah Chen marketing analysis edge function
interface PropertyDetails {
  estimatedPrice: string;
  bedrooms: string;
  bathrooms: string;
  squareFeet: string;
  yearBuilt: string;
  propertyType: string;
}

interface ValuationResult {
  propertyDetails: PropertyDetails;
  marketAnalysis: string;
  keyFeatures: string;
  neighborhoodHighlights: string[];
  areasToHighlight: string[];
}

interface AddressInfo {
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export default function PropertyValuation() {
  const [addressInfo, setAddressInfo] = useState<AddressInfo>({
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [error, setError] = useState('');
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddressInfo((prev) => ({ ...prev, [name]: value }));
  };

  const simulateValuationProgress = async () => {
    // Step 1: Property Research
    setLoadingStep(0);
    setLoadingProgress(10);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoadingProgress(35);
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Step 2: Market Analysis
    setLoadingStep(1);
    setLoadingProgress(45);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setLoadingProgress(70);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 3: Generating Report
    setLoadingStep(2);
    setLoadingProgress(80);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoadingProgress(95);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoadingProgress(100);
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressInfo.address.trim() || !addressInfo.city.trim() || !addressInfo.state.trim()) {
      setError('Please enter address, city, and state');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setLoadingStep(0);
    setLoadingProgress(0);

    try {
      // Start progress simulation
      const progressPromise = simulateValuationProgress();
      
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
        body: JSON.stringify({
          address: addressInfo.address.trim(),
          city: addressInfo.city.trim(),
          state: addressInfo.state.trim(),
          zipCode: addressInfo.zipCode.trim()
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to analyze property: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      // Wait for progress simulation to complete
      await progressPromise;
      
      setResult(data);
    } catch (error) {
      console.error('Error analyzing property:', error);
      setError(`Failed to analyze property: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleNewAnalysis = () => {
    setAddressInfo({
      address: '',
      city: '',
      state: '',
      zipCode: ''
    });
    setResult(null);
    setError('');
  };

  return (
    <>
      <SEOHead
        title="AI Property Valuation Tool"
        description="Get instant property valuations powered by AI. Analyze real estate market data from Zillow, Redfin, and MLS sources. Professional-grade property analysis for real estate agents."
        keywords={[
          'property valuation tool',
          'AI real estate analysis',
          'property value estimator',
          'real estate market analysis',
          'Zillow property analysis',
          'Redfin market data',
          'MLS property valuation',
          'real estate agent tools'
        ]}
        canonicalUrl="https://airealestatehelper.com/dashboard/property-valuation"
      />
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

        {/* Loading Screen Overlay */}
        {loading && (
          <LoadingScreen
            title="Analyzing Property"
            subtitle="Gathering comprehensive market analysis and property valuation data"
            steps={PROPERTY_VALUATION_STEPS}
            currentStep={loadingStep}
            progress={loadingProgress}
            disclaimer="Our AI analyzes real-time market data from multiple sources. Please review and verify all details before making investment decisions."
          />
        )}

        {!result ? (
          /* Premium Input Form - Matching Generate Listing Style */
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-10 shadow-2xl">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <FiMapPin className="h-6 w-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">Property Address</h2>
              </div>
              <p className="text-gray-400">We'll research the property details for you</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Street Address *</label>
                <input
                  type="text"
                  name="address"
                  value={addressInfo.address}
                  onChange={handleAddressChange}
                  placeholder="123 Main Street"
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={addressInfo.city}
                    onChange={handleAddressChange}
                    placeholder="San Francisco"
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={addressInfo.state}
                    onChange={handleAddressChange}
                    placeholder="CA"
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Zip Code (Optional)</label>
                <input
                  type="text"
                  name="zipCode"
                  value={addressInfo.zipCode}
                  onChange={handleAddressChange}
                  placeholder="94102"
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                />
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-sm">
                  <FiAlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <span className="text-red-300">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !addressInfo.address.trim() || !addressInfo.city.trim() || !addressInfo.state.trim()}
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
                    Research Property & Continue
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Clean Airbnb-Style Results Display */
          <div className="space-y-6">
            {/* Success Header */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <FiCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Analysis Complete</h2>
                  <p className="text-gray-400 text-sm">Property analyzed and valued successfully</p>
                </div>
              </div>
            </div>

            {/* Property Details Card */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <FiHome className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Property Details</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Property Address</p>
                  <p className="text-white font-medium">
                    {addressInfo.address}, {addressInfo.city}, {addressInfo.state}
                    {addressInfo.zipCode && ` ${addressInfo.zipCode}`}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-1">Estimated Value</p>
                  <p className="text-2xl font-bold text-green-400">{result.propertyDetails.estimatedPrice}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Bedrooms</p>
                    <p className="text-white font-semibold">{result.propertyDetails.bedrooms}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Bathrooms</p>
                    <p className="text-white font-semibold">{result.propertyDetails.bathrooms}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Square Feet</p>
                    <p className="text-white font-semibold">{result.propertyDetails.squareFeet}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Year Built</p>
                    <p className="text-white font-semibold">{result.propertyDetails.yearBuilt}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Property Type</p>
                    <p className="text-white font-semibold">{result.propertyDetails.propertyType}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Market Analysis & Key Features Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Market Analysis */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <FiBarChart2 className="w-5 h-5 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Market Analysis</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">{result.marketAnalysis}</p>
              </div>

              {/* Key Features */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <FiStar className="w-5 h-5 text-yellow-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Key Features</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">{result.keyFeatures}</p>
              </div>
            </div>

            {/* Neighborhood Highlights */}
            {result.neighborhoodHighlights && result.neighborhoodHighlights.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                    <FiTarget className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Neighborhood Highlights</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.neighborhoodHighlights.map((highlight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                      <FiCheck className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Investment Highlights */}
            {result.areasToHighlight && result.areasToHighlight.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <FiZap className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Investment Highlights</h3>
                </div>
                <div className="space-y-3">
                  {result.areasToHighlight.map((highlight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-gray-300 text-sm leading-relaxed">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleNewAnalysis}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 border border-white/20"
              >
                New Analysis
              </button>
              <button
                onClick={() => {
                  // Copy functionality can be added here
                  navigator.clipboard.writeText(JSON.stringify(result, null, 2));
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center gap-2"
              >
                <FiCopy className="w-4 h-4" />
                Copy Report
              </button>
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
}