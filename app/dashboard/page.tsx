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
  file_name: string;
  created_at: string;
}

interface PropertyValuation {
  id: string;
  address: string;
  created_at: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
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
        
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (profileError) {
          console.error('Error fetching profile:', profileError);
        } else {
          setProfile(profileData);
        }
        
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
          .select('id, file_name, created_at')
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

  const handleContractClick = (contractId: string) => {
    // Navigate to individual contract detail page
    router.push(`/dashboard/contracts/${contractId}`);
  };

  // Function to get first name from full name
  const getFirstName = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ')[0];
    }
    return 'Deal Closer';
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
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
      {/* Subtle Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl animate-pulse transform -translate-x-1/2 -translate-y-1/2" />
      </div>
      
      <div className="relative z-10 text-white">
      {/* Clean Hero Header */}
      <div className="mb-16">
        <div className="bg-gradient-to-b from-black via-gray-900 to-black rounded-3xl shadow-2xl p-12 relative overflow-hidden border border-white/10">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="lg:max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-gray-300 text-sm font-medium uppercase tracking-wider">AI POWERED DASHBOARD</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight tracking-tight">
                Welcome Back,
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  {getFirstName()}
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
                className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:shadow-[0_20px_40px_rgba(59,130,246,0.4)] text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 shadow-xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                <FiTrendingUp className="h-5 w-5 relative z-10" />
                <span className="relative z-10">Get Instant Valuation</span>
                <FiArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform relative z-10" />
              </Link>
              
              <div className="flex gap-3">
                <Link 
                  href="/dashboard/generate-listing" 
                  className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 hover:scale-105"
                >
                  <FiPlus className="h-4 w-4" />
                  New Listing
                </Link>
                <Link 
                  href="/dashboard/contract-analysis" 
                  className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 hover:scale-105"
                >
                  <FiFileText className="h-4 w-4" />
                  Analyze Contract
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards - Premium Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <Link href="/dashboard/listings" className="group bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 hover:bg-white/10 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer">
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <FiBarChart2 className="h-8 w-8 text-blue-400" />
            </div>
            <FiArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-300" />
          </div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">AI Listings Generated</h3>
          <p className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">{listings.length}</p>
          <p className="text-gray-500">Ready to publish</p>
        </Link>
        
        <Link href="/dashboard/contracts" className="group bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 hover:bg-white/10 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer">
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <FiFileText className="h-8 w-8 text-purple-400" />
            </div>
            <FiArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all duration-300" />
          </div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Contracts Analyzed</h3>
          <p className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">{contracts.length}</p>
          <p className="text-gray-500">Risk-free decisions</p>
        </Link>

        <Link href="/dashboard/property-valuations" className="group bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 hover:bg-white/10 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer">
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <FiHome className="h-8 w-8 text-cyan-400" />
            </div>
            <FiArrowRight className="h-5 w-5 text-gray-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-300" />
          </div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Property Valuations</h3>
          <p className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">{valuations.length}</p>
          <p className="text-gray-500">Market insights</p>
        </Link>
      </div>

      {/* Premium Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Listings */}
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 hover:bg-white/10 transition-all duration-300">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white">Recent Listings</h2>
            <Link 
              href="/dashboard/generate-listing" 
              className="text-gray-400 hover:text-blue-400 flex items-center gap-2 text-sm font-medium transition-colors group"
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
                  className="flex items-center justify-between p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
                >
                  <div>
                    <p className="font-semibold text-white group-hover:text-blue-400 transition-colors">{listing.title}</p>
                    <p className="text-sm text-gray-400 mt-1">{formatDate(listing.created_at)}</p>
                  </div>
                  <div className="w-10 h-10 bg-white/10 group-hover:bg-blue-500/20 rounded-xl flex items-center justify-center transition-all border border-white/10">
                    <FiArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <FiPlus className="h-8 w-8 text-blue-400" />
              </div>
              <p className="text-gray-400 mb-6 text-lg">Create your first AI listing</p>
              <Link 
                href="/dashboard/generate-listing" 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-[0_20px_40px_rgba(59,130,246,0.4)] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Get Started
                <FiArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Recent Contracts */}
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 hover:bg-white/10 transition-all duration-300">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white">Recent Contracts</h2>
            <Link 
              href="/dashboard/contract-analysis" 
              className="text-gray-400 hover:text-purple-400 flex items-center gap-2 text-sm font-medium transition-colors group"
            >
              <FiPlus className="h-4 w-4" />
              New
              <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          
          {contracts.length > 0 ? (
            <div className="space-y-4">
              {contracts.map((contract) => (
                <div 
                  key={contract.id} 
                  onClick={() => handleContractClick(contract.id)}
                  className="flex items-center justify-between p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
                >
                  <div>
                    <p className="font-semibold text-white group-hover:text-purple-400 transition-colors">{contract.file_name}</p>
                    <p className="text-sm text-gray-400 mt-1">{formatDate(contract.created_at)}</p>
                  </div>
                  <div className="w-10 h-10 bg-white/10 group-hover:bg-purple-500/20 rounded-xl flex items-center justify-center transition-all border border-white/10">
                    <FiArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <FiFileText className="h-8 w-8 text-purple-400" />
              </div>
              <p className="text-gray-400 mb-6 text-lg">Analyze your first contract</p>
              <Link 
                href="/dashboard/contract-analysis" 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-[0_20px_40px_rgba(147,51,234,0.4)] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Get Started
                <FiArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
