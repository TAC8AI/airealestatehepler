'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { FiPlus, FiSearch, FiArrowRight, FiCalendar, FiEye, FiFilter, FiHome } from 'react-icons/fi';

interface Listing {
  id: string;
  title: string;
  property_details: {
    address: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    yearBuilt: number;
    propertyType: string;
    features: string;
    highlights: string[];
  };
  mls_description: string;
  facebook_content: string;
  instagram_content: string;
  linkedin_content: string;
  created_at: string;
  updated_at: string;
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    filterAndSortListings();
  }, [listings, searchTerm, sortBy]);

  const fetchListings = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }
      
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching listings:', error);
      } else {
        setListings(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortListings = () => {
    let filtered = listings.filter(listing =>
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.mls_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.property_details?.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredListings(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleListingClick = (listingId: string) => {
    router.push(`/dashboard/listings/${listingId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-white/20 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">AI Listings</h1>
            <p className="text-gray-300">Manage all your AI-generated property listings</p>
          </div>
          <Link 
            href="/dashboard/generate-listing"
            className="bg-white hover:bg-gray-100 text-black px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 hover:scale-105"
          >
            <FiPlus className="h-4 w-4" />
            Create New Listing
          </Link>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8 shadow-xl">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search listings by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
            />
          </div>
          
          {/* Sort Filter */}
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-400 h-5 w-5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'title')}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
            >
              <option value="newest" className="bg-gray-800 text-white">Newest First</option>
              <option value="oldest" className="bg-gray-800 text-white">Oldest First</option>
              <option value="title" className="bg-gray-800 text-white">Title A-Z</option>
            </select>
          </div>
        </div>
        
        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-400">
          {filteredListings.length} of {listings.length} listings
        </div>
      </div>

      {/* Listings Grid */}
      {filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredListings.map((listing) => (
            <div
              key={listing.id}
              onClick={() => handleListingClick(listing.id)}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group shadow-lg hover:bg-white/10"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                    {listing.title}
                  </h3>
                  <p className="text-gray-300 line-clamp-3 mb-4">
                    {listing.property_details?.address || listing.mls_description || 'No description available'}
                  </p>
                </div>
                <div className="ml-4">
                  <div className="w-12 h-12 bg-white/10 group-hover:bg-white/20 rounded-xl flex items-center justify-center transition-all">
                    <FiArrowRight className="h-6 w-6 text-gray-300 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <FiCalendar className="h-4 w-4" />
                  Created {formatDate(listing.created_at)}
                </div>
                <div className="flex items-center gap-2">
                  <FiEye className="h-4 w-4" />
                  View Details
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <FiHome className="h-12 w-12 text-gray-400" />
          </div>
          
          {searchTerm ? (
            <>
              <h3 className="text-2xl font-bold text-white mb-4">No listings found</h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                No listings match your search "{searchTerm}". Try adjusting your search terms.
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
              >
                Clear Search
              </button>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-white mb-4">Create your first AI listing</h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Generate professional property listings in seconds with AI. Stand out from the competition.
              </p>
              <Link 
                href="/dashboard/generate-listing"
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-black px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
              >
                <FiPlus className="h-5 w-5" />
                Create Your First Listing
              </Link>
            </>
          )}
        </div>
      )}

      {/* View All from Features */}
      {filteredListings.length > 0 && (
        <div className="mt-16 text-center">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-4">Ready to create more?</h3>
            <p className="text-gray-400 mb-6">Generate another professional listing with AI</p>
            <Link 
              href="/dashboard/generate-listing"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-black px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <FiPlus className="h-4 w-4" />
              Generate New Listing
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 