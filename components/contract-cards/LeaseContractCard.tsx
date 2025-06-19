import React from 'react';
import { FiHome, FiDollarSign, FiUsers, FiCalendar, FiFileText, FiAlertCircle } from 'react-icons/fi';

interface LeaseData {
  property_address?: string;
  monthly_rent?: string;
  security_deposit?: string;
  lease_start_date?: string;
  lease_end_date?: string;
  tenant_name?: string;
  landlord_name?: string;
  utilities_included?: string[] | string;
  pet_policy?: string;
  parking_included?: string;
  lease_term_months?: string;
  late_fee?: string;
  renewal_option?: string;
  maintenance_responsibility?: string;
  early_termination_clause?: string;
  special_conditions?: string[] | string;
}

interface LeaseContractCardProps {
  data: LeaseData;
  confidence?: number;
  fileName?: string;
}

export default function LeaseContractCard({ data, confidence, fileName }: LeaseContractCardProps) {
  const formatCurrency = (value?: string) => {
    if (!value) return 'Not specified';
    return value.includes('$') ? value : `$${value}`;
  };

  const formatArray = (value?: string[] | string) => {
    if (!value) return 'Not specified';
    if (Array.isArray(value)) return value.join(', ');
    return value;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <FiFileText className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Lease Agreement Analysis</h3>
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
              <label className="text-sm font-medium text-gray-600">Parking</label>
              <p className="text-gray-900">{data.parking_included || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Financial Terms */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
            <FiDollarSign className="w-5 h-5 text-green-500" />
            <span>Financial Terms</span>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Monthly Rent</label>
                <p className="text-xl font-bold text-green-600">{formatCurrency(data.monthly_rent)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Security Deposit</label>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(data.security_deposit)}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Late Fee</label>
              <p className="text-gray-900">{formatCurrency(data.late_fee)}</p>
            </div>
          </div>
        </div>

        {/* Lease Timeline */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
            <FiCalendar className="w-5 h-5 text-purple-500" />
            <span>Lease Timeline</span>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Start Date</label>
                <p className="text-gray-900 font-medium">{data.lease_start_date || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">End Date</label>
                <p className="text-gray-900 font-medium">{data.lease_end_date || 'Not specified'}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Lease Term</label>
              <p className="text-gray-900">{data.lease_term_months ? `${data.lease_term_months} months` : 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Renewal Option</label>
              <p className="text-gray-900">{data.renewal_option || 'Not specified'}</p>
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
              <label className="text-sm font-medium text-gray-600">Tenant</label>
              <p className="text-gray-900 font-medium">{data.tenant_name || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Landlord</label>
              <p className="text-gray-900 font-medium">{data.landlord_name || 'Not specified'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Terms */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-800">Lease Conditions & Policies</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <label className="text-sm font-medium text-blue-800">Utilities Included</label>
            <p className="text-blue-900">{formatArray(data.utilities_included)}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <label className="text-sm font-medium text-orange-800">Pet Policy</label>
            <p className="text-orange-900">{data.pet_policy || 'Not specified'}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <label className="text-sm font-medium text-purple-800">Maintenance Responsibility</label>
            <p className="text-purple-900">{data.maintenance_responsibility || 'Not specified'}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <label className="text-sm font-medium text-red-800">Early Termination</label>
            <p className="text-red-900">{data.early_termination_clause || 'Not specified'}</p>
          </div>
        </div>
      </div>

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