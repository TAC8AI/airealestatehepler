'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';
import { FiCopy, FiCheck, FiArrowLeft } from 'react-icons/fi';

interface PropertyDetails {
  title: string;
  address: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  squareFeet: string;
  yearBuilt: string;
  propertyType: string;
  features: string;
  description: string;
}

interface Listing {
  id: string;
  title: string;
  property_details: PropertyDetails;
  mls_description: string;
  facebook_content: string;
  instagram_content: string;
  linkedin_content: string;
  created_at: string;
}

export default function ListingDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState({
    mls: false,
    facebook: false,
    instagram: false,
    linkedin: false,
  });

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
          .eq('id', params.id)
          .single();
        
        if (error) {
          console.error('Error fetching listing:', error);
          setLoading(false);
          return;
        }
        
        if (!data) {
          console.error('Listing not found');
          setLoading(false);
          return;
        }
        
        console.log('Listing fetched successfully:', data);
        setListing(data);
      } catch (error) {
        console.error('Error fetching listing:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchListing();
  }, [params.id, router]);

  const handleCopy = (type: keyof typeof copied) => {
    if (!listing) return;
    
    let content = '';
    switch (type) {
      case 'mls':
        content = listing.mls_description;
        break;
      case 'facebook':
        content = listing.facebook_content;
        break;
      case 'instagram':
        content = listing.instagram_content;
        break;
      case 'linkedin':
        content = listing.linkedin_content;
        break;
    }
    
    navigator.clipboard.writeText(content);
    setCopied((prev) => ({ ...prev, [type]: true }));
    setTimeout(() => {
      setCopied((prev) => ({ ...prev, [type]: false }));
    }, 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold mb-4">Listing Not Found</h2>
        <p className="mb-4">The listing you're looking for doesn't exist or you don't have permission to view it.</p>
        <button 
          onClick={() => router.push('/dashboard')}
          className="btn-primary"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <button 
          onClick={() => router.push('/dashboard')}
          className="flex items-center text-primary-600 hover:text-primary-700"
        >
          <FiArrowLeft className="mr-2" /> Back to Dashboard
        </button>
      </div>
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{listing.title}</h1>
        <p className="text-secondary-600">Created on {formatDate(listing.created_at)}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h2 className="text-lg font-medium mb-4">Property Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-secondary-500 text-sm">Address</p>
              <p className="font-medium">{listing.property_details.address}</p>
            </div>
            <div>
              <p className="text-secondary-500 text-sm">Price</p>
              <p className="font-medium">{listing.property_details.price}</p>
            </div>
            <div>
              <p className="text-secondary-500 text-sm">Property Type</p>
              <p className="font-medium">{listing.property_details.propertyType}</p>
            </div>
            <div>
              <p className="text-secondary-500 text-sm">Year Built</p>
              <p className="font-medium">{listing.property_details.yearBuilt}</p>
            </div>
            <div>
              <p className="text-secondary-500 text-sm">Bedrooms</p>
              <p className="font-medium">{listing.property_details.bedrooms}</p>
            </div>
            <div>
              <p className="text-secondary-500 text-sm">Bathrooms</p>
              <p className="font-medium">{listing.property_details.bathrooms}</p>
            </div>
            <div>
              <p className="text-secondary-500 text-sm">Square Feet</p>
              <p className="font-medium">{listing.property_details.squareFeet}</p>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-secondary-500 text-sm">Key Features</p>
            <p className="mt-1">{listing.property_details.features}</p>
          </div>
          
          {listing.property_details.description && (
            <div className="mt-4">
              <p className="text-secondary-500 text-sm">Additional Description</p>
              <p className="mt-1">{listing.property_details.description}</p>
            </div>
          )}
        </div>
        
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">MLS Description</h2>
            <button
              onClick={() => handleCopy('mls')}
              className="text-primary-600 hover:text-primary-700 flex items-center text-sm"
            >
              {copied.mls ? (
                <>
                  <FiCheck className="mr-1" /> Copied
                </>
              ) : (
                <>
                  <FiCopy className="mr-1" /> Copy
                </>
              )}
            </button>
          </div>
          <div className="bg-secondary-50 p-4 rounded-md whitespace-pre-wrap">
            {listing.mls_description}
          </div>
        </div>
      </div>
      
      <h2 className="text-lg font-medium mb-4">Social Media Content</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Facebook */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Facebook</h3>
            <button
              onClick={() => handleCopy('facebook')}
              className="text-primary-600 hover:text-primary-700 flex items-center text-sm"
            >
              {copied.facebook ? (
                <>
                  <FiCheck className="mr-1" /> Copied
                </>
              ) : (
                <>
                  <FiCopy className="mr-1" /> Copy
                </>
              )}
            </button>
          </div>
          <div className="bg-secondary-50 p-4 rounded-md mb-4 h-64 overflow-y-auto whitespace-pre-wrap">
            {listing.facebook_content}
          </div>
        </div>
        
        {/* Instagram */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Instagram</h3>
            <button
              onClick={() => handleCopy('instagram')}
              className="text-primary-600 hover:text-primary-700 flex items-center text-sm"
            >
              {copied.instagram ? (
                <>
                  <FiCheck className="mr-1" /> Copied
                </>
              ) : (
                <>
                  <FiCopy className="mr-1" /> Copy
                </>
              )}
            </button>
          </div>
          <div className="bg-secondary-50 p-4 rounded-md mb-4 h-64 overflow-y-auto whitespace-pre-wrap">
            {listing.instagram_content}
          </div>
        </div>
        
        {/* LinkedIn */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">LinkedIn</h3>
            <button
              onClick={() => handleCopy('linkedin')}
              className="text-primary-600 hover:text-primary-700 flex items-center text-sm"
            >
              {copied.linkedin ? (
                <>
                  <FiCheck className="mr-1" /> Copied
                </>
              ) : (
                <>
                  <FiCopy className="mr-1" /> Copy
                </>
              )}
            </button>
          </div>
          <div className="bg-secondary-50 p-4 rounded-md mb-4 h-64 overflow-y-auto whitespace-pre-wrap">
            {listing.linkedin_content}
          </div>
        </div>
      </div>
    </div>
  );
}
