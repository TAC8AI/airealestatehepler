import React from 'react';
import { FiHome, FiDollarSign, FiUsers, FiCalendar, FiFileText, FiAlertCircle, FiMapPin } from 'react-icons/fi';

interface LeaseData {
  property_address?: string;
  monthly_rent?: string | number;
  security_deposit?: string | number;
  lease_term_start?: string;
  lease_term_end?: string;
  tenant?: string;
  landlord?: string;
  utilities_responsibility?: string;
  pet_policy?: string;
  late_fee_policy?: string;
  maintenance_responsibility?: string;
  options_to_renew?: {
    has_option?: boolean;
    details?: string;
  };
}

interface LeaseContractCardProps {
  data: LeaseData;
  confidence?: number;
  fileName?: string;
}

// Helper function
const formatCurrency = (value?: string | number) => {
  if (!value) return 'Not specified';
  const stringValue = String(value);
  return stringValue.includes('$') ? stringValue : `$${stringValue}`;
};

// Property Details Card Component
const PropertyDetailsCard = ({ data }: { data: LeaseData }) => (
  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 ring-1 ring-blue-500/20 hover:ring-blue-500/40">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-blue-500/20 rounded-lg">
        <FiHome className="w-5 h-5 text-blue-400" />
      </div>
      <h3 className="text-lg font-bold text-white">Property Details</h3>
      <div className="ml-auto px-2 py-1 bg-blue-500/20 text-blue-300 text-xs font-medium rounded-full">
        HIGH PRIORITY
      </div>
    </div>
    
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <FiMapPin className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
        <div>
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Property Address</label>
          <p className="text-white font-medium text-lg leading-tight">
            {data.property_address || 'Address not specified'}
          </p>
        </div>
      </div>
      
      <div className="pt-4 border-t border-white/10">
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Monthly Rent</label>
        <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
          {formatCurrency(data.monthly_rent)}
        </p>
      </div>
    </div>
  </div>
);

// Parties Card Component  
const PartiesCard = ({ data }: { data: LeaseData }) => (
  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-purple-500/20 rounded-lg">
        <FiUsers className="w-5 h-5 text-purple-400" />
      </div>
      <h3 className="text-lg font-bold text-white">Parties</h3>
      <div className="ml-auto px-2 py-1 bg-gray-500/20 text-gray-300 text-xs font-medium rounded-full">
        MEDIUM PRIORITY
      </div>
    </div>
    
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
          <FiUsers className="w-4 h-4 text-green-400" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Tenant</label>
          <p className="text-white font-medium">{data.tenant || 'Not specified'}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
          <FiHome className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Landlord</label>
          <p className="text-white font-medium">{data.landlord || 'Not specified'}</p>
        </div>
      </div>
    </div>
  </div>
);

// Financial Terms and Timeline Card
const FinancialTimelineCard = ({ data }: { data: LeaseData }) => (
  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-green-500/20 rounded-lg">
        <FiDollarSign className="w-5 h-5 text-green-400" />
      </div>
      <h3 className="text-lg font-bold text-white">Financial & Timeline</h3>
      <div className="ml-auto px-2 py-1 bg-gray-500/20 text-gray-300 text-xs font-medium rounded-full">
        MEDIUM PRIORITY
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Security Deposit</label>
        <p className="text-white font-bold text-lg">{formatCurrency(data.security_deposit)}</p>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Late Fee Policy</label>
        <p className="text-gray-300 text-sm">{data.late_fee_policy || 'Not specified'}</p>
      </div>
    </div>
    
    <div className="pt-4 border-t border-white/10">
      <div className="flex items-center gap-3 mb-3">
        <FiCalendar className="w-4 h-4 text-purple-400" />
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Lease Term</label>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-500">Start Date</label>
          <p className="text-white font-medium">{data.lease_term_start || 'Not specified'}</p>
        </div>
        <div>
          <label className="text-xs text-gray-500">End Date</label>
          <p className="text-white font-medium">{data.lease_term_end || 'Not specified'}</p>
        </div>
      </div>
    </div>
  </div>
);

// Lease Conditions Card
const ConditionsCard = ({ data }: { data: LeaseData }) => (
  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-orange-500/20 rounded-lg">
        <FiFileText className="w-5 h-5 text-orange-400" />
      </div>
      <h3 className="text-lg font-bold text-white">Lease Conditions</h3>
      <div className="ml-auto px-2 py-1 bg-gray-600/20 text-gray-400 text-xs font-medium rounded-full">
        LOW PRIORITY
      </div>
    </div>
    
    <div className="space-y-3">
      <div className="bg-white/5 rounded-lg p-3">
        <label className="text-xs font-medium text-blue-400 uppercase tracking-wide">Utilities Responsibility</label>
        <p className="text-white text-sm mt-1">{data.utilities_responsibility || 'Not specified'}</p>
      </div>
      
      <div className="bg-white/5 rounded-lg p-3">
        <label className="text-xs font-medium text-green-400 uppercase tracking-wide">Pet Policy</label>
        <p className="text-white text-sm mt-1">{data.pet_policy || 'Not specified'}</p>
      </div>
      
      <div className="bg-white/5 rounded-lg p-3">
        <label className="text-xs font-medium text-purple-400 uppercase tracking-wide">Maintenance Responsibility</label>
        <p className="text-white text-sm mt-1">{data.maintenance_responsibility || 'Not specified'}</p>
      </div>
      
      <div className="bg-white/5 rounded-lg p-3">
        <label className="text-xs font-medium text-orange-400 uppercase tracking-wide">Renewal Option</label>
        <p className="text-white text-sm mt-1">
          {data.options_to_renew?.has_option ? (data.options_to_renew.details || 'Yes') : 'Not specified'}
        </p>
      </div>
    </div>
  </div>
);

export default function LeaseContractCard({ data, confidence, fileName }: LeaseContractCardProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl">
              <FiFileText className="w-7 h-7 text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Lease Agreement Analysis</h2>
              {fileName && <p className="text-gray-400">{fileName}</p>}
            </div>
          </div>
          {confidence && (
            <div className="flex items-center space-x-2 bg-green-500/20 px-4 py-2 rounded-full">
              <FiAlertCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-300">{confidence}% Confidence</span>
            </div>
          )}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PropertyDetailsCard data={data} />
        <PartiesCard data={data} />
        <FinancialTimelineCard data={data} />
        <ConditionsCard data={data} />
      </div>
    </div>
  );
} 