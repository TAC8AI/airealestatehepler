import React from 'react';
import { FiHome, FiDollarSign, FiUsers, FiCalendar, FiFileText, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

interface PurchaseData {
  property_address?: string;
  purchase_price?: string | number;
  earnest_money?: string | number;
  closing_date?: string;
  buyer_name?: string;
  seller_name?: string;
  financing_type?: string;
  down_payment?: string | number;
  loan_amount?: string | number;
  inspection_period?: string;
  appraisal_contingency?: string;
  financing_contingency?: string;
  sale_contingency?: string;
  closing_costs_responsibility?: string;
  home_warranty?: string;
  title_company?: string;
  real_estate_agent?: string;
  commission_rate?: string;
  possession_date?: string;
  special_conditions?: string[] | string;
}

interface PurchaseContractCardProps {
  data: PurchaseData;
  confidence?: number;
  fileName?: string;
}

export default function PurchaseContractCard({ data, confidence, fileName }: PurchaseContractCardProps) {
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

  const getContingencyStatus = (contingency?: string) => {
    if (!contingency) return { text: 'Not specified', color: 'gray' };
    const stringValue = String(contingency);
    const lower = stringValue.toLowerCase();
    if (lower.includes('yes') || lower.includes('included') || lower.includes('required')) {
      return { text: stringValue, color: 'green' };
    }
    if (lower.includes('no') || lower.includes('waived') || lower.includes('none')) {
      return { text: stringValue, color: 'red' };
    }
    return { text: stringValue, color: 'blue' };
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FiFileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Purchase Agreement Analysis</h3>
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
              <label className="text-sm font-medium text-gray-600">Purchase Price</label>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(data.purchase_price)}</p>
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
                <label className="text-sm font-medium text-gray-600">Earnest Money</label>
                <p className="text-lg font-semibold text-green-600">{formatCurrency(data.earnest_money)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Down Payment</label>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(data.down_payment)}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Financing Type</label>
              <p className="text-gray-900">{data.financing_type || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Loan Amount</label>
              <p className="text-gray-900">{formatCurrency(data.loan_amount)}</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
            <FiCalendar className="w-5 h-5 text-purple-500" />
            <span>Important Dates</span>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Closing Date</label>
              <p className="text-gray-900 font-medium">{data.closing_date || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Possession Date</label>
              <p className="text-gray-900">{data.possession_date || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Inspection Period</label>
              <p className="text-gray-900">{data.inspection_period || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Parties */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
            <FiUsers className="w-5 h-5 text-indigo-500" />
            <span>Parties & Professionals</span>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Buyer</label>
              <p className="text-gray-900 font-medium">{data.buyer_name || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Seller</label>
              <p className="text-gray-900 font-medium">{data.seller_name || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Real Estate Agent</label>
              <p className="text-gray-900">{data.real_estate_agent || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Title Company</label>
              <p className="text-gray-900">{data.title_company || 'Not specified'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contingencies */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-800">Contingencies & Conditions</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Financing Contingency', value: data.financing_contingency },
            { label: 'Appraisal Contingency', value: data.appraisal_contingency },
            { label: 'Sale Contingency', value: data.sale_contingency }
          ].map((contingency) => {
            const status = getContingencyStatus(contingency.value);
            return (
              <div key={contingency.label} className={`bg-${status.color}-50 rounded-lg p-4`}>
                <div className="flex items-center space-x-2">
                  <FiCheckCircle className={`w-4 h-4 text-${status.color}-600`} />
                  <label className={`text-sm font-medium text-${status.color}-800`}>{contingency.label}</label>
                </div>
                <p className={`text-${status.color}-900 mt-1`}>{status.text}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Terms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <label className="text-sm font-medium text-blue-800">Closing Costs Responsibility</label>
          <p className="text-blue-900">{data.closing_costs_responsibility || 'Not specified'}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <label className="text-sm font-medium text-green-800">Home Warranty</label>
          <p className="text-green-900">{data.home_warranty || 'Not specified'}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <label className="text-sm font-medium text-purple-800">Commission Rate</label>
          <p className="text-purple-900">{data.commission_rate || 'Not specified'}</p>
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