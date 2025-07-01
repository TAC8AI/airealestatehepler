"use client";

import { cn } from "@/lib/utils";
import { 
  Home, 
  DollarSign, 
  Users, 
  Calendar, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  MapPin 
} from "lucide-react";

interface ContractCardProps {
  className?: string;
  title: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  priority?: 'high' | 'medium' | 'low';
}

function ContractCard({
  className,
  title,
  children,
  icon,
  priority = 'medium'
}: ContractCardProps) {
  const priorityStyles = {
    high: "border-blue-500/30 bg-blue-500/5 hover:border-blue-400/50 shadow-blue-500/10",
    medium: "border-white/10 bg-white/5 hover:border-white/20", 
    low: "border-gray-500/20 bg-gray-500/5 hover:border-gray-400/30"
  };

  return (
    <div
      className={cn(
        "relative rounded-xl border-2 backdrop-blur-sm px-6 py-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl",
        priorityStyles[priority],
        className
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

interface PropertyDetailsCardProps {
  address?: string;
  price?: string | number;
}

export function PropertyDetailsCard({ address, price }: PropertyDetailsCardProps) {
  const formatCurrency = (value?: string | number) => {
    if (!value) return 'Not specified';
    const stringValue = String(value);
    return stringValue.includes('$') ? stringValue : `$${stringValue}`;
  };

  return (
    <ContractCard
      title="Property Details"
      icon={<Home className="h-5 w-5 text-blue-400" />}
      priority="high"
      className="col-span-2"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm text-gray-400">Property Address</p>
            <p className="text-white font-medium text-lg">{address || 'Not specified'}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <DollarSign className="h-5 w-5 text-green-400 mt-0.5" />
          <div>
            <p className="text-sm text-gray-400">Purchase Price</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              {formatCurrency(price)}
            </p>
          </div>
        </div>
      </div>
    </ContractCard>
  );
}

interface PartiesCardProps {
  buyer?: string;
  seller?: string;
  buyerAgent?: string;
  sellerAgent?: string;
  titleCompany?: string;
  realEstateAgent?: string;
}

export function PartiesCard({ 
  buyer, 
  seller, 
  buyerAgent, 
  sellerAgent, 
  titleCompany,
  realEstateAgent
}: PartiesCardProps) {
  const parties = [
    { label: 'Buyer', value: buyer, icon: Users },
    { label: 'Seller', value: seller, icon: Users },
    { label: 'Buyer Agent', value: buyerAgent, icon: FileText },
    { label: 'Seller Agent', value: sellerAgent, icon: FileText },
    { label: 'Real Estate Agent', value: realEstateAgent, icon: FileText },
    { label: 'Title Company', value: titleCompany, icon: FileText }
  ].filter(party => party.value);

  return (
    <ContractCard
      title="Parties & Professionals"
      icon={<Users className="h-5 w-5 text-purple-400" />}
      priority="medium"
    >
      <div className="space-y-3">
        {parties.map((party, index) => {
          const Icon = party.icon;
          return (
            <div key={index} className="flex items-center gap-3">
              <Icon className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">{party.label}</p>
                <p className="text-white text-sm font-medium">{party.value}</p>
              </div>
            </div>
          );
        })}
        {parties.length === 0 && (
          <p className="text-gray-400 text-sm">No party information specified</p>
        )}
      </div>
    </ContractCard>
  );
}

interface FinancialDatesCardProps {
  earnestMoney?: string | number;
  downPayment?: string | number;
  financingType?: string;
  loanAmount?: string | number;
  closingDate?: string;
  possessionDate?: string;
  inspectionPeriod?: string;
}

export function FinancialDatesCard({
  earnestMoney,
  downPayment,
  financingType,
  loanAmount,
  closingDate,
  possessionDate,
  inspectionPeriod
}: FinancialDatesCardProps) {
  const formatCurrency = (value?: string | number) => {
    if (!value) return 'Not specified';
    const stringValue = String(value);
    return stringValue.includes('$') ? stringValue : `$${stringValue}`;
  };

  return (
    <ContractCard
      title="Financial & Important Dates"
      icon={<Calendar className="h-5 w-5 text-cyan-400" />}
      priority="medium"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-400">Earnest Money</p>
            <p className="text-green-400 font-semibold">{formatCurrency(earnestMoney)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Down Payment</p>
            <p className="text-white font-medium">{formatCurrency(downPayment)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Financing Type</p>
            <p className="text-white text-sm">{financingType || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Loan Amount</p>
            <p className="text-white text-sm">{formatCurrency(loanAmount)}</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-400">Closing Date</p>
            <p className="text-white font-medium">{closingDate || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Possession Date</p>
            <p className="text-white text-sm">{possessionDate || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Inspection Period</p>
            <p className="text-white text-sm">{inspectionPeriod || 'Not specified'}</p>
          </div>
        </div>
      </div>
    </ContractCard>
  );
}

interface ContingencyCardProps {
  financingContingency?: string;
  appraisalContingency?: string;
  saleContingency?: string;
  specialConditions?: string[] | string;
  homeWarranty?: string;
  closingCosts?: string;
  commissionRate?: string;
}

export function ContingencyCard({
  financingContingency,
  appraisalContingency, 
  saleContingency,
  specialConditions,
  homeWarranty,
  closingCosts,
  commissionRate
}: ContingencyCardProps) {
  const getContingencyStatus = (contingency?: string) => {
    if (!contingency) return { text: 'Not specified', color: 'gray', icon: AlertCircle };
    const stringValue = String(contingency);
    const lower = stringValue.toLowerCase();
    if (lower.includes('yes') || lower.includes('included') || lower.includes('required')) {
      return { text: stringValue, color: 'green', icon: CheckCircle };
    }
    if (lower.includes('no') || lower.includes('waived') || lower.includes('none')) {
      return { text: stringValue, color: 'red', icon: AlertCircle };
    }
    return { text: stringValue, color: 'blue', icon: CheckCircle };
  };

  const formatSpecialConditions = (conditions?: string[] | string) => {
    if (!conditions) return 'None specified';
    if (Array.isArray(conditions)) return conditions.join(', ');
    return conditions;
  };

  const contingencies = [
    { label: 'Financing', value: financingContingency },
    { label: 'Appraisal', value: appraisalContingency },
    { label: 'Sale', value: saleContingency }
  ];

  const additionalTerms = [
    { label: 'Home Warranty', value: homeWarranty },
    { label: 'Closing Costs', value: closingCosts },
    { label: 'Commission Rate', value: commissionRate }
  ].filter(term => term.value);

  return (
    <ContractCard
      title="Contingencies & Conditions"
      icon={<FileText className="h-5 w-5 text-yellow-400" />}
      priority="low"
      className="col-span-2"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {contingencies.map((contingency, index) => {
            const status = getContingencyStatus(contingency.value);
            const Icon = status.icon;
            return (
              <div 
                key={index} 
                className={`p-3 rounded-lg border ${
                  status.color === 'green' 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : status.color === 'red'
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-gray-500/10 border-gray-500/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`h-4 w-4 ${
                    status.color === 'green' 
                      ? 'text-green-400' 
                      : status.color === 'red'
                      ? 'text-red-400'
                      : 'text-gray-400'
                  }`} />
                  <p className="text-xs text-gray-400">{contingency.label}</p>
                </div>
                <p className="text-white text-sm">{status.text}</p>
              </div>
            );
          })}
        </div>
        
        {additionalTerms.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {additionalTerms.map((term, index) => (
              <div key={index} className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <p className="text-xs text-gray-400 mb-1">{term.label}</p>
                <p className="text-white text-sm">{term.value}</p>
              </div>
            ))}
          </div>
        )}
        
        <div>
          <p className="text-sm text-gray-400 mb-2">Special Conditions</p>
          <p className="text-white text-sm">{formatSpecialConditions(specialConditions)}</p>
        </div>
      </div>
    </ContractCard>
  );
}

interface ContractAnalysisCardsProps {
  data: any;
  contractType: 'purchase' | 'listing' | 'lease';
}

export default function ContractAnalysisCards({ data, contractType }: ContractAnalysisCardsProps) {
  if (contractType === 'purchase') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PropertyDetailsCard 
          address={data.property_address}
          price={data.purchase_price}
        />
        <PartiesCard
          buyer={data.buyer_name}
          seller={data.seller_name}
          buyerAgent={data.buyer_agent}
          sellerAgent={data.seller_agent}
          titleCompany={data.title_company}
          realEstateAgent={data.real_estate_agent}
        />
        <FinancialDatesCard
          earnestMoney={data.earnest_money}
          downPayment={data.down_payment}
          financingType={data.financing_type}
          loanAmount={data.loan_amount}
          closingDate={data.closing_date}
          possessionDate={data.possession_date}
          inspectionPeriod={data.inspection_period}
        />
        <ContingencyCard
          financingContingency={data.financing_contingency}
          appraisalContingency={data.appraisal_contingency}
          saleContingency={data.sale_contingency}
          specialConditions={data.special_conditions}
          homeWarranty={data.home_warranty}
          closingCosts={data.closing_costs_responsibility}
          commissionRate={data.commission_rate}
        />
      </div>
    );
  }

  if (contractType === 'listing') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PropertyDetailsCard 
          address={data.property_address}
          price={data.listing_price}
        />
        <ListingPartiesCard
          seller={data.seller_name}
          listingAgent={data.listing_agent}
          broker={data.broker_name}
        />
        <ListingFinancialDatesCard
          commissionRate={data.commission_rate}
          listingStartDate={data.listing_start_date}
          listingEndDate={data.listing_end_date}
          listingTerms={data.listing_terms}
          priceReductionTerms={data.price_reduction_terms}
        />
        <ListingAuthorizationsCard
          mlsAuthorization={data.mls_authorization}
          lockboxAuthorization={data.lockbox_authorization}
          signAuthorization={data.sign_authorization}
          internetMarketingAuthorization={data.internet_marketing_authorization}
          marketingTerms={data.marketing_terms}
          showingInstructions={data.showing_instructions}
          specialConditions={data.special_conditions}
        />
      </div>
    );
  }

  // For lease contracts and others
  return (
    <div className="text-white">
      Contract analysis cards for {contractType} contracts coming soon...
    </div>
  );
}

// Listing-specific card components
interface ListingPartiesCardProps {
  seller?: string;
  listingAgent?: string;
  broker?: string;
}

export function ListingPartiesCard({ 
  seller, 
  listingAgent, 
  broker
}: ListingPartiesCardProps) {
  const parties = [
    { label: 'Seller', value: seller, icon: Users },
    { label: 'Listing Agent', value: listingAgent, icon: FileText },
    { label: 'Broker', value: broker, icon: FileText }
  ].filter(party => party.value);

  return (
    <ContractCard
      title="Parties & Professionals"
      icon={<Users className="h-5 w-5 text-purple-400" />}
      priority="medium"
    >
      <div className="space-y-3">
        {parties.map((party, index) => {
          const Icon = party.icon;
          return (
            <div key={index} className="flex items-center gap-3">
              <Icon className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">{party.label}</p>
                <p className="text-white text-sm font-medium">{party.value}</p>
              </div>
            </div>
          );
        })}
        {parties.length === 0 && (
          <p className="text-gray-400 text-sm">No party information specified</p>
        )}
      </div>
    </ContractCard>
  );
}

interface ListingFinancialDatesCardProps {
  commissionRate?: string;
  listingStartDate?: string;
  listingEndDate?: string;
  listingTerms?: string;
  priceReductionTerms?: string;
}

export function ListingFinancialDatesCard({
  commissionRate,
  listingStartDate,
  listingEndDate,
  listingTerms,
  priceReductionTerms
}: ListingFinancialDatesCardProps) {
  return (
    <ContractCard
      title="Financial & Important Dates"
      icon={<Calendar className="h-5 w-5 text-cyan-400" />}
      priority="medium"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-400">Commission Rate</p>
            <p className="text-green-400 font-semibold text-xl">{commissionRate || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Listing Terms</p>
            <p className="text-white text-sm">{listingTerms || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Price Reduction Terms</p>
            <p className="text-white text-sm">{priceReductionTerms || 'Not specified'}</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-400">Start Date</p>
            <p className="text-white font-medium">{listingStartDate || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">End Date</p>
            <p className="text-white font-medium">{listingEndDate || 'Not specified'}</p>
          </div>
        </div>
      </div>
    </ContractCard>
  );
}

interface ListingAuthorizationsCardProps {
  mlsAuthorization?: string;
  lockboxAuthorization?: string;
  signAuthorization?: string;
  internetMarketingAuthorization?: string;
  marketingTerms?: string[] | string;
  showingInstructions?: string;
  specialConditions?: string[] | string;
}

export function ListingAuthorizationsCard({
  mlsAuthorization,
  lockboxAuthorization,
  signAuthorization,
  internetMarketingAuthorization,
  marketingTerms,
  showingInstructions,
  specialConditions
}: ListingAuthorizationsCardProps) {
  const getAuthorizationStatus = (authorization?: string) => {
    if (!authorization) return { text: 'Not specified', color: 'gray', icon: AlertCircle };
    const lower = authorization.toLowerCase();
    if (lower.includes('yes') || lower.includes('authorized') || lower.includes('allowed')) {
      return { text: 'Authorized', color: 'green', icon: CheckCircle };
    }
    if (lower.includes('no') || lower.includes('not authorized') || lower.includes('declined')) {
      return { text: 'Not Authorized', color: 'red', icon: AlertCircle };
    }
    return { text: authorization, color: 'blue', icon: CheckCircle };
  };

  const formatArray = (value?: string[] | string) => {
    if (!value) return 'None specified';
    if (Array.isArray(value)) return value.join(', ');
    return value;
  };

  const authorizations = [
    { label: 'MLS', value: mlsAuthorization },
    { label: 'Lockbox', value: lockboxAuthorization },
    { label: 'Sign', value: signAuthorization }
  ];

  return (
    <ContractCard
      title="Authorizations & Marketing"
      icon={<FileText className="h-5 w-5 text-yellow-400" />}
      priority="low"
      className="col-span-2"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {authorizations.map((auth, index) => {
            const status = getAuthorizationStatus(auth.value);
            const Icon = status.icon;
            return (
              <div 
                key={index} 
                className={`p-3 rounded-lg border ${
                  status.color === 'green' 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : status.color === 'red'
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-gray-500/10 border-gray-500/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`h-4 w-4 ${
                    status.color === 'green' 
                      ? 'text-green-400' 
                      : status.color === 'red'
                      ? 'text-red-400'
                      : 'text-gray-400'
                  }`} />
                  <p className="text-xs text-gray-400">{auth.label}</p>
                </div>
                <p className="text-white text-sm">{status.text}</p>
              </div>
            );
          })}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-400 mb-2">Marketing Terms</p>
            <p className="text-white text-sm">{formatArray(marketingTerms)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">Showing Instructions</p>
            <p className="text-white text-sm">{showingInstructions || 'Not specified'}</p>
          </div>
        </div>
        
        <div>
          <p className="text-sm text-gray-400 mb-2">Special Conditions</p>
          <p className="text-white text-sm">{formatArray(specialConditions)}</p>
        </div>
      </div>
    </ContractCard>
  );
} 