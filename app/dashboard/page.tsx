'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { FiPlus, FiFileText, FiBarChart2, FiTrendingUp, FiArrowRight, FiMail, FiHome } from 'react-icons/fi';

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

interface PropertyValuation {
  id: string;
  address: string;
  created_at: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [valuations, setValuations] = useState<PropertyValuation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
        } else {
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
        } else {
          setContracts(contractsData || []);
        }

        // Fetch user's property valuations
        const { data: valuationsData, error: valuationsError } = await supabase
          .from('property_valuations')
          .select('id, address, created_at')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (valuationsError) {
          console.error('Error fetching valuations:', valuationsError);
        } else {
          setValuations(valuationsData || []);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  const handleListingClick = (listingId: string) => {
    router.push(`/dashboard/listings/${listingId}`);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Clean Hero Header */}
      <div className="mb-16">
        <div className="bg-gradient-to-b from-black via-gray-900 to-black rounded-3xl shadow-2xl p-12 relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="lg:max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-gray-300 text-sm font-medium uppercase tracking-wider">AI POWERED DASHBOARD</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight tracking-tight">
                Welcome Back,
                <br />
                <span className="text-white">
                  Deal Closer
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Ready to close more deals today? Your AI-powered real estate command center is waiting.
              </p>
            </div>
            
            {/* Clean Action Buttons */}
            <div className="flex flex-col gap-4 mt-8 lg:mt-0 lg:min-w-fit">
              <Link 
                href="/dashboard/property-valuation" 
                className="bg-white hover:bg-gray-100 text-black px-8 py-4 rounded-2xl font-semibold text-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 shadow-xl group"
              >
                <FiTrendingUp className="h-5 w-5" />
                Get Instant Valuation
                <FiArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <div className="flex gap-3">
                <Link 
                  href="/dashboard/generate-listing" 
                  className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 hover:scale-105"
                >
                  <FiPlus className="h-4 w-4" />
                  New Listing
                </Link>
                <Link 
                  href="/dashboard/contract-analysis" 
                  className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 hover:scale-105"
                >
                  <FiFileText className="h-4 w-4" />
                  Analyze Contract
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards - Now 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FiBarChart2 className="h-8 w-8 text-black" />
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">AI Listings Generated</h3>
          <p className="text-4xl font-bold text-gray-900 mb-2">{listings.length}</p>
          <p className="text-gray-500">Ready to publish</p>
        </div>
        
        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FiFileText className="h-8 w-8 text-black" />
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Contracts Analyzed</h3>
          <p className="text-4xl font-bold text-gray-900 mb-2">{contracts.length}</p>
          <p className="text-gray-500">Risk-free decisions</p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FiHome className="h-8 w-8 text-black" />
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Property Valuations</h3>
          <p className="text-4xl font-bold text-gray-900 mb-2">{valuations.length}</p>
          <p className="text-gray-500">Market insights</p>
        </div>
      </div>

      {/* Clean Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Listings - Now Clickable */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Recent Listings</h2>
            <Link 
              href="/dashboard/generate-listing" 
              className="text-gray-600 hover:text-black flex items-center gap-2 text-sm font-medium transition-colors group"
            >
              <FiPlus className="h-4 w-4" />
              New
              <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          
          {listings.length > 0 ? (
            <div className="space-y-4">
              {listings.map((listing) => (
                <div 
                  key={listing.id} 
                  onClick={() => handleListingClick(listing.id)}
                  className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
                >
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-black transition-colors">{listing.title}</p>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(listing.created_at)}</p>
                  </div>
                  <div className="w-10 h-10 bg-gray-200 group-hover:bg-gray-300 rounded-xl flex items-center justify-center transition-all">
                    <FiArrowRight className="h-5 w-5 text-gray-600 group-hover:text-black group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <FiPlus className="h-8 w-8 text-gray-600" />
              </div>
              <p className="text-gray-600 mb-6 text-lg">Create your first AI listing</p>
              <Link 
                href="/dashboard/generate-listing" 
                className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Get Started
                <FiArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Recent Contract Analysis */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Contract Analysis</h2>
            <Link 
              href="/dashboard/contract-analysis" 
              className="text-gray-600 hover:text-black flex items-center gap-2 text-sm font-medium transition-colors group"
            >
              <FiPlus className="h-4 w-4" />
              New
              <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          
          {contracts.length > 0 ? (
            <div className="space-y-4">
              {contracts.map((contract) => (
                <div key={contract.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors duration-300 hover:scale-[1.02]">
                  <div>
                    <p className="font-semibold text-gray-900">{contract.title}</p>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(contract.created_at)}</p>
                  </div>
                  <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center">
                    <FiArrowRight className="h-5 w-5 text-gray-600" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <FiFileText className="h-8 w-8 text-gray-600" />
              </div>
              <p className="text-gray-600 mb-6 text-lg">Analyze your first contract</p>
              <Link 
                href="/dashboard/contract-analysis" 
                className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Upload Contract
                <FiArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Clean Expert Support CTA */}
      <div className="mt-16 bg-black rounded-3xl shadow-2xl p-12 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <FiMail className="h-10 w-10 text-white" />
          </div>
          
          <h3 className="text-3xl font-bold text-white mb-4">Need Expert Support?</h3>
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            Get personalized guidance from our real estate AI experts. We're here to help you maximize your success.
          </p>
          
          <a 
            href="mailto:tucker@carlileadvisors.com"
            className="inline-flex items-center gap-3 bg-white hover:bg-gray-100 text-black px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
          >
            <FiMail className="h-5 w-5" />
            Contact Tucker
          </a>
          
          <p className="text-gray-400 text-sm mt-6">
            tucker@carlileadvisors.com
          </p>
        </div>
      </div>
    </div>
  );
}
