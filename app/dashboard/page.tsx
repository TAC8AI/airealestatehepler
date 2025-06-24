'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { FiPlus, FiFileText, FiBarChart2, FiClock, FiTrendingUp, FiArrowRight, FiActivity, FiZap, FiTarget, FiAward, FiMail, FiStar, FiDollarSign, FiShield } from 'react-icons/fi';

interface Listing {
  id: string;
  title: string;
  created_at: string;
}

interface Contract {
  id: string;
  title: string;
  created_at: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          return;
        }
        
        setUser(session.user);
        
        // Fetch user's listings
        const { data: listingsData, error: listingsError } = await supabase
          .from('listings')
          .select('id, title, created_at')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (listingsError) {
          console.error('Error fetching listings:', listingsError);
          console.log('User ID used for query:', session.user.id);
        } else {
          console.log('Listings fetched successfully:', listingsData);
          setListings(listingsData || []);
        }
        
        // Fetch user's contracts
        const { data: contractsData, error: contractsError } = await supabase
          .from('contracts')
          .select('id, title, created_at')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (contractsError) {
          console.error('Error fetching contracts:', contractsError);
          console.log('User ID used for query:', session.user.id);
        } else {
          console.log('Contracts fetched successfully:', contractsData);
          setContracts(contractsData || []);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
      {/* Hero Dashboard Header */}
      <div className="mb-12">
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black rounded-3xl shadow-2xl border border-gray-700 p-12 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_1px,transparent_1px)] [background-size:32px_32px]"></div>
          <div className="absolute top-4 right-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-4 left-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="lg:max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-emerald-400 text-sm font-medium uppercase tracking-wider">AI POWERED DASHBOARD</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                Welcome Back,
                <br />
                <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                  Deal Closer
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                Ready to close more deals today? Your AI-powered real estate command center is waiting.
              </p>
              
              <div className="flex items-center gap-6 text-gray-400 text-sm">
                <div className="flex items-center gap-2">
                  <FiZap className="h-4 w-4 text-emerald-400" />
                  <span>Lightning Fast</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiShield className="h-4 w-4 text-blue-400" />
                  <span>Bank-Grade Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiTarget className="h-4 w-4 text-purple-400" />
                  <span>99.9% Accuracy</span>
                </div>
              </div>
            </div>
            
            {/* Power User Actions */}
            <div className="flex flex-col gap-4 mt-8 lg:mt-0 lg:min-w-fit">
              <Link 
                href="/dashboard/property-valuation" 
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl shadow-emerald-500/25 group"
              >
                <FiTrendingUp className="h-5 w-5" />
                Get Instant Valuation
                <FiArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <div className="flex gap-3">
                <Link 
                  href="/dashboard/generate-listing" 
                  className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 flex items-center gap-2 hover:scale-105 border border-white/20"
                >
                  <FiPlus className="h-4 w-4" />
                  New Listing
                </Link>
                <Link 
                  href="/dashboard/contract-analysis" 
                  className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 flex items-center gap-2 hover:scale-105 border border-white/20"
                >
                  <FiFileText className="h-4 w-4" />
                  Analyze Contract
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Power Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FiBarChart2 className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center gap-1">
              <FiTrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-emerald-500 font-medium text-sm">+23%</span>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">AI Listings Generated</p>
          <p className="text-3xl font-bold text-gray-900">{listings.length}</p>
          <p className="text-gray-500 text-sm mt-1">Ready to publish</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FiFileText className="h-6 w-6 text-white" />
            </div>
                         <div className="flex items-center gap-1">
               <FiZap className="h-4 w-4 text-blue-500" />
               <span className="text-blue-500 font-medium text-sm">Instant</span>
             </div>
          </div>
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">Contracts Analyzed</p>
          <p className="text-3xl font-bold text-gray-900">{contracts.length}</p>
          <p className="text-gray-500 text-sm mt-1">Risk-free decisions</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FiDollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center gap-1">
              <FiAward className="h-4 w-4 text-purple-500" />
              <span className="text-purple-500 font-medium text-sm">Pro</span>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">Market Valuations</p>
          <p className="text-3xl font-bold text-gray-900">∞</p>
          <p className="text-gray-500 text-sm mt-1">Unlimited access</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FiActivity className="h-6 w-6 text-white" />
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">AI Status</p>
          <p className="text-3xl font-bold text-gray-900">LIVE</p>
          <p className="text-gray-500 text-sm mt-1">Real-time analysis</p>
        </div>
      </div>

      {/* Feature Showcase */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Your AI-Powered Arsenal
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to dominate your market, close deals faster, and earn more commissions
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contract Analysis Feature */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-3xl p-8 border border-blue-200 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <FiFileText className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Contract Analysis</h3>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Upload any contract and get instant AI analysis. Spot red flags, hidden clauses, and negotiate with confidence.
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiZap className="h-4 w-4 text-blue-500" />
                <span>3-second analysis time</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiShield className="h-4 w-4 text-blue-500" />
                <span>99.7% accuracy rate</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiTarget className="h-4 w-4 text-blue-500" />
                <span>Risk scoring included</span>
              </div>
            </div>
            <Link 
              href="/dashboard/contract-analysis"
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors group-hover:scale-105"
            >
              Try It Now
              <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          {/* Property Valuation Feature */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-3xl p-8 border border-emerald-200 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <FiTrendingUp className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Property Valuation</h3>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Get market-accurate property valuations with confidence scores, comparable sales, and market insights.
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiZap className="h-4 w-4 text-emerald-500" />
                <span>Real-time market data</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiShield className="h-4 w-4 text-emerald-500" />
                <span>Confidence scoring</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiTarget className="h-4 w-4 text-emerald-500" />
                <span>Comparable sales analysis</span>
              </div>
            </div>
            <Link 
              href="/dashboard/property-valuation"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors group-hover:scale-105"
            >
              Get Valuation
              <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          {/* Listing Generation Feature */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-3xl p-8 border border-purple-200 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <FiPlus className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Listing Generation</h3>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Create compelling, high-converting property listings that sell faster and for more money.
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiZap className="h-4 w-4 text-purple-500" />
                <span>SEO-optimized content</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiShield className="h-4 w-4 text-purple-500" />
                <span>Proven templates</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiTarget className="h-4 w-4 text-purple-500" />
                <span>Higher conversion rates</span>
              </div>
            </div>
            <Link 
              href="/dashboard/generate-listing"
              className="inline-flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors group-hover:scale-105"
            >
              Create Listing
              <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity & CTA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Listings */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Listings</h2>
            <Link 
              href="/dashboard/generate-listing" 
              className="text-emerald-600 hover:text-emerald-700 flex items-center gap-2 text-sm font-medium transition-colors group"
            >
              <FiPlus className="h-4 w-4" />
              New
              <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          
          {listings.length > 0 ? (
            <div className="space-y-4">
              {listings.map((listing) => (
                <div key={listing.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300">
                  <div>
                    <p className="font-medium text-gray-900">{listing.title}</p>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(listing.created_at)}</p>
                  </div>
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <FiArrowRight className="h-4 w-4 text-emerald-600" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiPlus className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="text-gray-600 mb-4">Create your first AI listing</p>
              <Link 
                href="/dashboard/generate-listing" 
                className="inline-flex items-center gap-2 text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
              >
                Get Started
                <FiArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Recent Contract Analysis */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Contract Analysis</h2>
            <Link 
              href="/dashboard/contract-analysis" 
              className="text-blue-600 hover:text-blue-700 flex items-center gap-2 text-sm font-medium transition-colors group"
            >
              <FiPlus className="h-4 w-4" />
              New
              <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          
          {contracts.length > 0 ? (
            <div className="space-y-4">
              {contracts.map((contract) => (
                <div key={contract.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300">
                  <div>
                    <p className="font-medium text-gray-900">{contract.title}</p>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(contract.created_at)}</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiArrowRight className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiFileText className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-gray-600 mb-4">Analyze your first contract</p>
              <Link 
                href="/dashboard/contract-analysis" 
                className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                Upload Contract
                <FiArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Expert Support CTA */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-8 text-white">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FiMail className="h-8 w-8 text-white" />
            </div>
            
            <h3 className="text-2xl font-bold mb-4">Need Expert Support?</h3>
            <p className="text-orange-100 mb-6 leading-relaxed">
              Get personalized guidance from our real estate AI experts. We're here to help you maximize your success.
            </p>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-center gap-2 text-orange-100">
                <FiStar className="h-4 w-4" />
                <span className="text-sm">24/7 Expert Support</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-orange-100">
                <FiZap className="h-4 w-4" />
                <span className="text-sm">Faster Response Times</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-orange-100">
                <FiTarget className="h-4 w-4" />
                <span className="text-sm">Custom Strategy Sessions</span>
              </div>
            </div>
            
            <a 
              href="mailto:tucker@carlileadvisors.com"
              className="inline-flex items-center gap-2 bg-white text-orange-600 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors hover:scale-105 transform duration-300 shadow-lg"
            >
              <FiMail className="h-4 w-4" />
              Contact Tucker
            </a>
            
            <p className="text-orange-200 text-sm mt-4">
              tucker@carlileadvisors.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
