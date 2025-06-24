'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { FiPlus, FiFileText, FiBarChart2, FiClock, FiTrendingUp, FiArrowRight, FiActivity } from 'react-icons/fi';

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
          <div className="w-16 h-16 border-4 border-gray-800 border-t-transparent rounded-full animate-spin absolute top-0"></div>
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
    <div className="min-h-screen bg-gray-50">
      {/* Premium Header */}
      <div className="mb-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-semibold text-gray-900 mb-2">
                Welcome to your Real Estate
                <br />
                <span className="text-gray-600">Dashboard</span>
              </h1>
              <p className="text-lg text-gray-600">
                Glad to see you back, <span className="font-medium text-gray-900">{user?.email}</span>
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex gap-4 mt-8 lg:mt-0">
              <Link 
                href="/dashboard/generate-listing" 
                className="bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-all duration-300 flex items-center gap-2 hover:scale-105 shadow-lg"
              >
                <FiPlus className="h-4 w-4" />
                New Listing
              </Link>
              <Link 
                href="/dashboard/contract-analysis" 
                className="bg-gray-100 text-gray-900 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all duration-300 flex items-center gap-2 hover:scale-105"
              >
                <FiFileText className="h-4 w-4" />
                New Analysis
              </Link>
              <Link 
                href="/dashboard/property-valuation" 
                className="bg-gray-100 text-gray-900 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all duration-300 flex items-center gap-2 hover:scale-105"
              >
                <FiTrendingUp className="h-4 w-4" />
                Valuation
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
              <FiBarChart2 className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Listings</p>
              <p className="text-3xl font-semibold text-gray-900 mt-1">{listings.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
              <FiFileText className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Contracts</p>
              <p className="text-3xl font-semibold text-gray-900 mt-1">{contracts.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
              <FiClock className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Last Activity</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {listings.length > 0 || contracts.length > 0
                  ? formatDate(
                      [...listings, ...contracts].sort(
                        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                      )[0]?.created_at || ''
                    )
                  : 'Jun 23, 2025'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
              <FiActivity className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Quick Actions</p>
              <div className="flex gap-2 mt-2">
                <Link href="/dashboard/generate-listing" className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors">New Listing</Link>
                <Link href="/dashboard/contract-analysis" className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors">Analysis</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Listings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Recent Listings</h2>
            <Link 
              href="/dashboard/generate-listing" 
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2 text-sm font-medium transition-colors group"
            >
              <FiPlus className="h-4 w-4" />
              New Listing
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
                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                    <FiArrowRight className="h-4 w-4 text-gray-600" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiPlus className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-4">No listings yet</p>
              <Link 
                href="/dashboard/generate-listing" 
                className="inline-flex items-center gap-2 text-gray-900 font-medium hover:text-gray-700 transition-colors"
              >
                Create your first listing
                <FiArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Recent Contract Analysis */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Recent Contract Analysis</h2>
            <Link 
              href="/dashboard/contract-analysis" 
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2 text-sm font-medium transition-colors group"
            >
              <FiPlus className="h-4 w-4" />
              New Analysis
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
                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                    <FiArrowRight className="h-4 w-4 text-gray-600" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiFileText className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-4">No contract analysis yet</p>
              <Link 
                href="/dashboard/contract-analysis" 
                className="inline-flex items-center gap-2 text-gray-900 font-medium hover:text-gray-700 transition-colors"
              >
                Analyze your first contract
                <FiArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
