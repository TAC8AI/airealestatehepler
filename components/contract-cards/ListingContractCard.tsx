import React from 'react';
import ContractAnalysisCards from '@/components/ui/contract-analysis-cards';

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
  return (
    <ContractAnalysisCards 
      data={data} 
      contractType="listing" 
    />
  );
} 