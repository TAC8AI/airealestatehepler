'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { FiPlus, FiFileText, FiBarChart2, FiClock } from 'react-icons/fi';

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
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
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
    <div className="min-h-screen bg-gradient-to-tr from-primary-50 via-white to-secondary-100 pb-16">
      <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-xl shadow-lg bg-white/80 border border-secondary-100">
        <div>
          <h1 className="text-3xl font-extrabold text-primary-800 drop-shadow-sm">Welcome to your Real Estate Dashboard</h1>
          <p className="text-secondary-600 mt-1 text-lg">Glad to see you back, <span className="font-semibold text-primary-700">{user?.email}</span></p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Link href="/dashboard/generate-listing" className="btn-primary flex items-center gap-2 shadow-md animate-pulse">
            <FiPlus /> New Listing
          </Link>
          <Link href="/dashboard/contract-analysis" className="btn-secondary flex items-center gap-2 shadow-md">
            <FiFileText /> New Analysis
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="card flex items-center shadow-lg hover:scale-105 transition-transform duration-200 bg-gradient-to-br from-primary-100/70 to-white">
          <div className="bg-primary-200 p-4 rounded-full mr-4 animate-bounce">
            <FiBarChart2 className="h-7 w-7 text-primary-600" />
          </div>
          <div>
            <p className="text-secondary-600 text-sm">Total Listings</p>
            <p className="text-3xl font-bold text-primary-800">{listings.length}</p>
          </div>
        </div>
        
        <div className="card flex items-center shadow-lg hover:scale-105 transition-transform duration-200 bg-gradient-to-br from-secondary-100/70 to-white">
          <div className="bg-secondary-200 p-4 rounded-full mr-4 animate-pulse">
            <FiFileText className="h-7 w-7 text-secondary-700" />
          </div>
          <div>
            <p className="text-secondary-600 text-sm">Total Contracts</p>
            <p className="text-3xl font-bold text-secondary-800">{contracts.length}</p>
          </div>
        </div>
        
        <div className="card flex items-center shadow-lg hover:scale-105 transition-transform duration-200 bg-gradient-to-br from-primary-50 to-secondary-50">
          <div className="bg-primary-100 p-4 rounded-full mr-4">
            <FiClock className="h-7 w-7 text-primary-400" />
          </div>
          <div>
            <p className="text-secondary-600 text-sm">Last Activity</p>
            <p className="text-2xl font-semibold text-primary-700">
              {listings.length > 0 || contracts.length > 0
                ? formatDate(
                    [...listings, ...contracts].sort(
                      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                    )[0]?.created_at || ''
                  )
                : 'N/A'}
            </p>
          </div>
        </div>
        
        <div className="card flex items-center shadow-lg hover:scale-105 transition-transform duration-200 bg-gradient-to-br from-secondary-50 to-primary-50">
          <div className="bg-secondary-100 p-4 rounded-full mr-4">
            <FiPlus className="h-7 w-7 text-secondary-600" />
          </div>
          <div>
            <p className="text-secondary-600 text-sm">Quick Actions</p>
            <div className="flex space-x-2 mt-1">
              <Link href="/dashboard/generate-listing" className="btn-primary px-2 py-1 text-xs">New Listing</Link>
              <Link href="/dashboard/contract-analysis" className="btn-secondary px-2 py-1 text-xs">New Analysis</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Listings */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Listings</h2>
            <Link href="/dashboard/generate-listing" className="text-primary-600 text-sm hover:underline flex items-center">
              <FiPlus className="mr-1" /> New Listing
            </Link>
          </div>
          
          {listings.length > 0 ? (
            <div className="space-y-4">
              {listings.map((listing) => (
                <div key={listing.id} className="flex items-center justify-between p-3 bg-white border border-secondary-200 rounded-md">
                  <div>
                    <p className="font-medium">{listing.title}</p>
                    <p className="text-sm text-secondary-500">{formatDate(listing.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-secondary-500">
              <p>No listings yet</p>
              <Link href="/dashboard/generate-listing" className="text-primary-600 hover:underline mt-2 inline-block">
                Create your first listing
              </Link>
            </div>
          )}
        </div>

        {/* Recent Contracts */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Contract Analysis</h2>
            <Link href="/dashboard/contract-analysis" className="text-primary-600 text-sm hover:underline flex items-center">
              <FiPlus className="mr-1" /> New Analysis
            </Link>
          </div>
          
          {contracts.length > 0 ? (
            <div className="space-y-4">
              {contracts.map((contract) => (
                <div key={contract.id} className="flex items-center justify-between p-3 bg-white border border-secondary-200 rounded-md">
                  <div>
                    <p className="font-medium">{contract.title}</p>
                    <p className="text-sm text-secondary-500">{formatDate(contract.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-secondary-500">
              <p>No contract analyses yet</p>
              <Link href="/dashboard/contract-analysis" className="text-primary-600 hover:underline mt-2 inline-block">
                Analyze your first contract
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
