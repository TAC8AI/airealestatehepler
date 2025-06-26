'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';
import { FiArrowLeft, FiEdit3, FiShare2, FiCopy, FiCheck, FiHome, FiDollarSign, FiMapPin, FiCalendar } from 'react-icons/fi';

interface Listing {
  id: string;
  title: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  mls_description: string;
  facebook_post: string;
  instagram_post: string;
  twitter_post: string;
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Listing not found</h1>
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <FiArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
                <p className="text-gray-500 flex items-center gap-2 mt-1">
                  <FiCalendar className="h-4 w-4" />
                  Created {formatDate(listing.created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all">
                <FiShare2 className="h-4 w-4" />
                Share
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-xl transition-all">
                <FiEdit3 className="h-4 w-4" />
                Edit Listing
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Property Details Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{listing.title}</h2>
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <FiMapPin className="h-5 w-5" />
                <span className="text-lg">{listing.address}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-3xl font-bold text-gray-900 mb-2">
                <FiDollarSign className="h-8 w-8" />
                {formatPrice(listing.price)}
              </div>
              <p className="text-gray-500">List Price</p>
            </div>
          </div>

          {/* Property Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiHome className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{listing.bedrooms}</p>
              <p className="text-gray-500">Bedrooms</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiHome className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{listing.bathrooms}</p>
              <p className="text-gray-500">Bathrooms</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiHome className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatSqft(listing.sqft)}</p>
              <p className="text-gray-500">Sq Ft</p>
            </div>
          </div>
        </div>

        {/* MLS Description */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">MLS Description</h3>
            <button
              onClick={() => copyToClipboard(listing.mls_description, 'mls')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
            >
              {copiedField === 'mls' ? (
                <>
                  <FiCheck className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">Copied!</span>
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
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{listing.mls_description}</p>
          </div>
        </div>

        {/* Social Media Posts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Facebook Post */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Facebook Post</h3>
              <button
                onClick={() => copyToClipboard(listing.facebook_post, 'facebook')}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                {copiedField === 'facebook' ? (
                  <FiCheck className="h-4 w-4 text-green-600" />
                ) : (
                  <FiCopy className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="bg-blue-50 rounded-2xl p-4">
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{listing.facebook_post}</p>
            </div>
          </div>

          {/* Instagram Post */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Instagram Post</h3>
              <button
                onClick={() => copyToClipboard(listing.instagram_post, 'instagram')}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                {copiedField === 'instagram' ? (
                  <FiCheck className="h-4 w-4 text-green-600" />
                ) : (
                  <FiCopy className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="bg-pink-50 rounded-2xl p-4">
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{listing.instagram_post}</p>
            </div>
          </div>

          {/* Twitter Post */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Twitter Post</h3>
              <button
                onClick={() => copyToClipboard(listing.twitter_post, 'twitter')}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                {copiedField === 'twitter' ? (
                  <FiCheck className="h-4 w-4 text-green-600" />
                ) : (
                  <FiCopy className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="bg-blue-50 rounded-2xl p-4">
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{listing.twitter_post}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-12">
          <Link
            href="/dashboard/generate-listing"
            className="flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-gray-800 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
          >
            <FiHome className="h-4 w-4" />
            Create New Listing
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl font-semibold transition-all"
          >
            <FiArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
} 