import React from 'react';
import ContractAnalysisCards from '@/components/ui/contract-analysis-cards';

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
  return (
    <ContractAnalysisCards 
      data={data} 
      contractType="purchase" 
    />
  );
} 