import React from 'react';
import { FiHome, FiDollarSign, FiUsers, FiCalendar, FiFileText, FiAlertCircle, FiTrendingUp } from 'react-icons/fi';

interface ListingData {
  property_address?: string;
  listing_price?: string | number;
  commission_rate?: string;
  listing_agent?: string;
  listing_start_date?: string;
  listing_end_date?: string;
  listing_duration?: string;
  seller_name?: string;
  property_type?: string;
  square_footage?: string;
  bedrooms?: string;
  bathrooms?: string;
  lot_size?: string;
  year_built?: string;
  marketing_terms?: string[] | string;
  showing_instructions?: string;
  lockbox_authorization?: string;
  sign_authorization?: string;
  mls_authorization?: string;
  internet_marketing_authorization?: string;
  broker_name?: string;
  listing_terms?: string;
  price_reduction_terms?: string;
  special_conditions?: string[] | string;
}

interface ListingContractCardProps {
  data: ListingData;
  confidence?: number;
  fileName?: string;
}

export default function ListingContractCard({ data, confidence, fileName }: ListingContractCardProps) {
  const formatCurrency = (value?: string | number) => {
    if (!value) return 'Not specified';
    const stringValue = String(value);
    return stringValue.includes('$') ? stringValue : `$${stringValue}`;
  };

  const formatArray = (value?: string[] | string) => {
    if (!value) return 'Not specified';
    if (Array.isArray(value)) return value.join(', ');
    return value;
  };

  const getAuthorizationStatus = (authorization?: string) => {
    if (!authorization) return { text: 'Not specified', color: 'gray' };
    const lower = authorization.toLowerCase();
    if (lower.includes('yes') || lower.includes('authorized') || lower.includes('allowed')) {
      return { text: 'Authorized', color: 'green' };
    }
    if (lower.includes('no') || lower.includes('not authorized') || lower.includes('declined')) {
      return { text: 'Not Authorized', color: 'red' };
    }
    return { text: authorization, color: 'blue' };
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <FiFileText className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Listing Agreement Analysis</h3>
            {fileName && <p className="text-sm text-gray-500">{fileName}</p>}
          </div>
        </div>
        {confidence && (
          <div className="flex items-center space-x-2">
            <FiAlertCircle className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-600">{confidence}% Confidence</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property Information */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
            <FiHome className="w-5 h-5 text-blue-500" />
            <span>Property Details</span>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Property Address</label>
              <p className="text-gray-900 font-medium">{data.property_address || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Listing Price</label>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(data.listing_price)}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Property Type</label>
                <p className="text-gray-900">{data.property_type || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Year Built</label>
                <p className="text-gray-900">{data.year_built || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Commission */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
            <FiDollarSign className="w-5 h-5 text-green-500" />
            <span>Financial Terms</span>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Commission Rate</label>
              <p className="text-xl font-bold text-green-600">{data.commission_rate || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Listing Terms</label>
              <p className="text-gray-900">{data.listing_terms || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Price Reduction Terms</label>
              <p className="text-gray-900">{data.price_reduction_terms || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
            <FiCalendar className="w-5 h-5 text-purple-500" />
            <span>Listing Timeline</span>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Start Date</label>
                <p className="text-gray-900 font-medium">{data.listing_start_date || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">End Date</label>
                <p className="text-gray-900 font-medium">{data.listing_end_date || 'Not specified'}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Duration</label>
              <p className="text-gray-900">{data.listing_duration || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Parties */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
            <FiUsers className="w-5 h-5 text-indigo-500" />
            <span>Parties</span>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Seller</label>
              <p className="text-gray-900 font-medium">{data.seller_name || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Listing Agent</label>
              <p className="text-gray-900 font-medium">{data.listing_agent || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Broker</label>
              <p className="text-gray-900">{data.broker_name || 'Not specified'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Property Features */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
          <FiTrendingUp className="w-5 h-5 text-blue-500" />
          <span>Property Features</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <label className="text-sm font-medium text-blue-800">Square Footage</label>
            <p className="text-lg font-bold text-blue-900">{data.square_footage || 'N/A'}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <label className="text-sm font-medium text-green-800">Bedrooms</label>
            <p className="text-lg font-bold text-green-900">{data.bedrooms || 'N/A'}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <label className="text-sm font-medium text-purple-800">Bathrooms</label>
            <p className="text-lg font-bold text-purple-900">{data.bathrooms || 'N/A'}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <label className="text-sm font-medium text-orange-800">Lot Size</label>
            <p className="text-lg font-bold text-orange-900">{data.lot_size || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Marketing Authorizations */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-800">Marketing Authorizations</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'MLS Listing', value: data.mls_authorization },
            { label: 'Lockbox', value: data.lockbox_authorization },
            { label: 'For Sale Sign', value: data.sign_authorization },
            { label: 'Internet Marketing', value: data.internet_marketing_authorization }
          ].map((auth) => {
            const status = getAuthorizationStatus(auth.value);
            return (
              <div key={auth.label} className={`bg-${status.color}-50 rounded-lg p-4`}>
                <label className={`text-sm font-medium text-${status.color}-800`}>{auth.label}</label>
                <p className={`text-${status.color}-900 font-medium`}>{status.text}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Marketing Terms */}
      {data.marketing_terms && (
        <div className="bg-blue-50 rounded-lg p-4">
          <label className="text-sm font-medium text-blue-800">Marketing Terms</label>
          <p className="text-blue-900 mt-1">{formatArray(data.marketing_terms)}</p>
        </div>
      )}

      {/* Showing Instructions */}
      {data.showing_instructions && (
        <div className="bg-green-50 rounded-lg p-4">
          <label className="text-sm font-medium text-green-800">Showing Instructions</label>
          <p className="text-green-900 mt-1">{data.showing_instructions}</p>
        </div>
      )}

      {/* Special Conditions */}
      {data.special_conditions && (
        <div className="bg-yellow-50 rounded-lg p-4">
          <label className="text-sm font-medium text-yellow-800">Special Conditions</label>
          <p className="text-yellow-900 mt-1">{formatArray(data.special_conditions)}</p>
        </div>
      )}
    </div>
  );
} 