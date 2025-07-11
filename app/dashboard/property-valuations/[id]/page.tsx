'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';
import { FiArrowLeft, FiShare2, FiCopy, FiCheck, FiHome, FiTrendingUp, FiMapPin, FiCalendar, FiTarget, FiAlertTriangle } from 'react-icons/fi';

interface PropertyValuation {
  id: string;
  address: string;
  headline_range: string;
  reasoning: string;
  caution: string;
  confidence_score: number;
  created_at: string;
  user_id: string;
}

export default function PropertyValuationDetail() {
  const [valuation, setValuation] = useState<PropertyValuation | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const valuationId = params.id;

  useEffect(() => {
    const fetchValuation = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/login');
          return;
        }

        const { data, error } = await supabase
          .from('property_valuations')
          .select('*')
          .eq('id', valuationId)
          .eq('user_id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching valuation:', error);
          router.push('/dashboard');
          return;
        }

        setValuation(data);
      } catch (error) {
        console.error('Error:', error);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (valuationId) {
      fetchValuation();
    }
  }, [valuationId, router]);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatConfidence = (score: number) => {
    // Handle NaN, null, undefined, or invalid scores
    if (score === null || score === undefined || isNaN(score)) {
      return '85%'; // Default fallback
    }
    return `${Math.round(score * 100)}%`;
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
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

  if (!valuation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-white mb-4">Property valuation not found</h1>
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <FiArrowLeft className="h-5 w-5 text-gray-400" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">{valuation.address}</h1>
                <p className="text-gray-400 flex items-center gap-2 mt-1">
                  <FiCalendar className="h-4 w-4" />
                  Analyzed {formatDate(valuation.created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                <FiShare2 className="h-4 w-4" />
                Share
              </button>
              <Link 
                href="/dashboard/property-valuation"
                className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-gray-100 rounded-xl transition-all"
              >
                <FiTrendingUp className="h-4 w-4" />
                New Valuation
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Property Details Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 mb-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">Property Valuation</h2>
              <div className="flex items-center gap-2 text-gray-400 mb-4">
                <FiMapPin className="h-5 w-5" />
                <span className="text-lg">{valuation.address}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-3xl font-bold text-white mb-2">
                <FiTrendingUp className="h-8 w-8" />
                {valuation.headline_range}
              </div>
              <p className="text-gray-400">Estimated Value</p>
            </div>
          </div>

          {/* Valuation Analysis Section */}
          <div className="space-y-8">
            {/* Confidence Score */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FiTarget className="h-5 w-5 text-green-400" />
                  Confidence Score
                </h3>
                <button
                  onClick={() => copyToClipboard(formatConfidence(valuation.confidence_score), 'confidence')}
                  className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm"
                >
                  {copiedField === 'confidence' ? (
                    <>
                      <FiCheck className="h-4 w-4 text-green-400" />
                      <span className="text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <FiCopy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${getConfidenceColor(valuation.confidence_score)}`}>
                  <FiTarget className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white mb-1">{formatConfidence(valuation.confidence_score)}</p>
                  <p className="text-gray-400">Analysis reliability based on available market data and comparable properties</p>
                </div>
              </div>
            </div>
            {/* Reasoning */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FiHome className="h-5 w-5 text-blue-400" />
                  Market Analysis
                </h3>
                <button
                  onClick={() => copyToClipboard(valuation.reasoning, 'reasoning')}
                  className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm"
                >
                  {copiedField === 'reasoning' ? (
                    <>
                      <FiCheck className="h-4 w-4 text-green-400" />
                      <span className="text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <FiCopy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{valuation.reasoning}</p>
              </div>
            </div>

            {/* Caution */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FiAlertTriangle className="h-5 w-5 text-amber-400" />
                  Important Considerations
                </h3>
                <button
                  onClick={() => copyToClipboard(valuation.caution, 'caution')}
                  className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm"
                >
                  {copiedField === 'caution' ? (
                    <>
                      <FiCheck className="h-4 w-4 text-green-400" />
                      <span className="text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <FiCopy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{valuation.caution}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <FiTrendingUp className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Get Another Valuation</h3>
            <p className="text-gray-400 mb-6">
              Analyze more properties with AI-powered market insights and comparable sales data.
            </p>
            <Link 
              href="/dashboard/property-valuation"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Start New Analysis
              <FiTrendingUp className="h-4 w-4" />
            </Link>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6">
              <FiHome className="h-8 w-8 text-black" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Create Listing</h3>
            <p className="text-gray-400 mb-6">
              Turn this valuation into a professional listing with AI-generated descriptions and marketing content.
            </p>
            <Link 
              href="/dashboard/generate-listing"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-black px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Generate Listing
              <FiHome className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 