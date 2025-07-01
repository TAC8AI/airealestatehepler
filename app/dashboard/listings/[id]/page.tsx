'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';
import { FiArrowLeft, FiEdit3, FiShare2, FiCopy, FiCheck, FiHome, FiDollarSign, FiMapPin, FiCalendar, FiTrendingUp } from 'react-icons/fi';

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
  user_id: string;
}

export default function ListingDetail() {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const listingId = params.id;

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/login');
          return;
        }

        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('id', listingId)
          .eq('user_id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching listing:', error);
          router.push('/dashboard');
          return;
        }

        setListing(data);
      } catch (error) {
        console.error('Error:', error);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (listingId) {
      fetchListing();
    }
  }, [listingId, router]);

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
      month: 'short',
      day: 'numeric', 
      year: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatSqft = (sqft: number) => {
    return new Intl.NumberFormat('en-US').format(sqft);
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

  if (!listing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Listing not found</h1>
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Professional Header */}
      <div className="bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          {/* Main Header Row */}
          <div className="flex items-center justify-between py-6">
            {/* Left: Back + Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <FiArrowLeft className="h-5 w-5 text-white" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <FiHome className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{listing.title}</h1>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-gray-400">Created {formatDate(listing.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                <FiShare2 className="h-4 w-4" />
                Share
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-gray-100 rounded-xl transition-all font-medium">
                <FiEdit3 className="h-4 w-4" />
                Edit Listing
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Property Hero Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8 shadow-xl">
          <div className="flex items-start justify-between mb-8">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-4">{listing.title}</h2>
              <div className="flex items-center gap-2 text-gray-300 mb-6">
                <FiMapPin className="h-5 w-5 text-blue-400" />
                <span className="text-lg">{listing.property_details?.address}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  {formatPrice(listing.property_details?.price || 0)}
                </span>
              </div>
              <p className="text-gray-400">List Price</p>
            </div>
          </div>

          {/* Property Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiHome className="h-6 w-6 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">{listing.property_details?.bedrooms}</p>
              <p className="text-gray-400">Bedrooms</p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiHome className="h-6 w-6 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-white">{listing.property_details?.bathrooms}</p>
              <p className="text-gray-400">Bathrooms</p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiTrendingUp className="h-6 w-6 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">{listing.property_details?.sqft ? formatSqft(listing.property_details.sqft) : 'N/A'}</p>
              <p className="text-gray-400">Sq Ft</p>
            </div>
          </div>
        </div>

        {/* MLS Description */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">MLS Description</h3>
            <button
              onClick={() => copyToClipboard(listing.mls_description, 'mls')}
              className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              {copiedField === 'mls' ? (
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
          <div className="prose max-w-none">
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{listing.mls_description}</p>
          </div>
        </div>

        {/* Social Media Posts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Facebook Post */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Facebook Post</h3>
              <button
                onClick={() => copyToClipboard(listing.facebook_content, 'facebook')}
                className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                {copiedField === 'facebook' ? (
                  <FiCheck className="h-4 w-4 text-green-400" />
                ) : (
                  <FiCopy className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{listing.facebook_content}</p>
            </div>
          </div>

          {/* Instagram Post */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Instagram Post</h3>
              <button
                onClick={() => copyToClipboard(listing.instagram_content, 'instagram')}
                className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                {copiedField === 'instagram' ? (
                  <FiCheck className="h-4 w-4 text-green-400" />
                ) : (
                  <FiCopy className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="bg-pink-500/10 border border-pink-500/20 rounded-2xl p-4">
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{listing.instagram_content}</p>
            </div>
          </div>

          {/* Twitter Post */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">LinkedIn Post</h3>
              <button
                onClick={() => copyToClipboard(listing.linkedin_content, 'linkedin')}
                className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                {copiedField === 'linkedin' ? (
                  <FiCheck className="h-4 w-4 text-green-400" />
                ) : (
                  <FiCopy className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{listing.linkedin_content}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Link
            href="/dashboard/generate-listing"
            className="flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-gray-100 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
          >
            <FiHome className="h-4 w-4" />
            Create New Listing
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-6 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl font-semibold transition-all"
          >
            <FiArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
} 