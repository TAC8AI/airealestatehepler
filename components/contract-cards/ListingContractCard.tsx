import React from 'react';
import { FiHome, FiDollarSign, FiUsers, FiCalendar, FiFileText, FiCheck, FiX, FiTrendingUp } from 'react-icons/fi';

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
    
    // Extract numeric value
    const numericValue = typeof value === 'string' 
      ? parseFloat(value.replace(/[$,]/g, '')) 
      : value;
    
    if (isNaN(numericValue)) return String(value);
    
    // Format with proper commas and dollar sign
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericValue);
  };

  const formatNumber = (value?: string | number) => {
    if (!value) return 'N/A';
    
    const numericValue = typeof value === 'string' 
      ? parseFloat(value.replace(/[,]/g, '')) 
      : value;
    
    if (isNaN(numericValue)) return String(value);
    
    return new Intl.NumberFormat('en-US').format(numericValue);
  };

  const formatArray = (value?: string[] | string) => {
    if (!value) return 'Not specified';
    if (Array.isArray(value)) return value.join(', ');
    return value;
  };

  const getAuthorizationStatus = (authorization?: string) => {
    if (!authorization) return { text: 'Not specified', authorized: null };
    const lower = authorization.toLowerCase();
    if (lower.includes('yes') || lower.includes('authorized') || lower.includes('allowed')) {
      return { text: 'Authorized', authorized: true };
    }
    if (lower.includes('no') || lower.includes('not authorized') || lower.includes('declined')) {
      return { text: 'Not Authorized', authorized: false };
    }
    return { text: authorization, authorized: null };
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <FiFileText className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Listing Agreement Analysis</h3>
              {fileName && <p className="text-sm text-gray-500 mt-1">{fileName}</p>}
            </div>
          </div>
          {confidence && (
            <div className="text-right">
              <div className="text-sm text-gray-500">Confidence</div>
              <div className="text-lg font-semibold text-gray-900">{confidence}%</div>
            </div>
          )}
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Property Information */}
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <FiHome className="w-4 h-4 text-gray-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Property Details</h4>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-2">Property Address</div>
                <div className="text-gray-900 font-medium">{data.property_address || 'Not specified'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 mb-2">Listing Price</div>
                <div className="text-3xl font-bold text-gray-900">{formatCurrency(data.listing_price)}</div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-2">Property Type</div>
                  <div className="text-gray-900">{data.property_type || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-2">Year Built</div>
                  <div className="text-gray-900">{data.year_built || 'Not specified'}</div>
                </div>
              </div>
            </div>

            {/* Financial Terms */}
            <div className="space-y-6">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-2">Commission Rate</div>
                <div className="text-2xl font-bold text-gray-900">{data.commission_rate || 'Not specified'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 mb-2">Listing Terms</div>
                <div className="text-gray-900">{data.listing_terms || 'Not specified'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 mb-2">Price Reduction Terms</div>
                <div className="text-gray-900">{data.price_reduction_terms || 'Not specified'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline and Parties */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Timeline */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <FiCalendar className="w-4 h-4 text-gray-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Listing Timeline</h4>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-2">Start Date</div>
                  <div className="text-gray-900 font-medium">{data.listing_start_date || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-2">End Date</div>
                  <div className="text-gray-900 font-medium">{data.listing_end_date || 'Not specified'}</div>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 mb-2">Duration</div>
                <div className="text-gray-900">{data.listing_duration || 'Not specified'}</div>
              </div>
            </div>
          </div>

          {/* Parties */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <FiUsers className="w-4 h-4 text-gray-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Parties</h4>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-2">Seller</div>
                <div className="text-gray-900 font-medium">{data.seller_name || 'Not specified'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 mb-2">Listing Agent</div>
                <div className="text-gray-900 font-medium">{data.listing_agent || 'Not specified'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 mb-2">Broker</div>
                <div className="text-gray-900">{data.broker_name || 'Not specified'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Property Features */}
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <FiTrendingUp className="w-4 h-4 text-gray-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Property Features</h4>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="text-sm font-medium text-gray-500 mb-2">Square Footage</div>
              <div className="text-xl font-bold text-gray-900">{formatNumber(data.square_footage)}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="text-sm font-medium text-gray-500 mb-2">Bedrooms</div>
              <div className="text-xl font-bold text-gray-900">{data.bedrooms || 'N/A'}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="text-sm font-medium text-gray-500 mb-2">Bathrooms</div>
              <div className="text-xl font-bold text-gray-900">{data.bathrooms || 'N/A'}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="text-sm font-medium text-gray-500 mb-2">Lot Size</div>
              <div className="text-xl font-bold text-gray-900">{data.lot_size || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Marketing Authorizations */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-6">Marketing Authorizations</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'MLS Listing', value: data.mls_authorization },
              { label: 'Lockbox', value: data.lockbox_authorization },
              { label: 'For Sale Sign', value: data.sign_authorization },
              { label: 'Internet Marketing', value: data.internet_marketing_authorization }
            ].map((auth) => {
              const status = getAuthorizationStatus(auth.value);
              return (
                <div key={auth.label} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-500">{auth.label}</div>
                      <div className="text-gray-900 font-medium mt-1">{status.text}</div>
                    </div>
                    <div className="ml-3">
                      {status.authorized === true && (
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <FiCheck className="w-3 h-3 text-green-600" />
                        </div>
                      )}
                      {status.authorized === false && (
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                          <FiX className="w-3 h-3 text-red-600" />
                        </div>
                      )}
                      {status.authorized === null && (
                        <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          {data.marketing_terms && (
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="text-sm font-medium text-gray-500 mb-2">Marketing Terms</div>
              <div className="text-gray-900">{formatArray(data.marketing_terms)}</div>
            </div>
          )}

          {data.showing_instructions && (
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="text-sm font-medium text-gray-500 mb-2">Showing Instructions</div>
              <div className="text-gray-900">{data.showing_instructions}</div>
            </div>
          )}

          {data.special_conditions && (
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="text-sm font-medium text-gray-500 mb-2">Special Conditions</div>
              <div className="text-gray-900">{formatArray(data.special_conditions)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 