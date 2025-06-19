-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  company TEXT,
  phone TEXT,
  email TEXT,
  notification_email BOOLEAN DEFAULT TRUE,
  notification_app BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  property_details JSONB NOT NULL,
  mls_description TEXT,
  facebook_content TEXT,
  instagram_content TEXT,
  linkedin_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  contract_type TEXT CHECK (contract_type IN ('purchase', 'listing', 'lease')) NOT NULL,
  original_content TEXT,
  summary TEXT,
  extracted_data JSONB,
  confidence_score FLOAT DEFAULT NULL,
  file_name TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create specialized contract tables

-- Purchase/Offer-to-Purchase Contracts
CREATE TABLE IF NOT EXISTS purchase_contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  
  -- Property Information
  property_address TEXT,
  
  -- Financial Terms
  purchase_price DECIMAL(12,2),
  earnest_money DECIMAL(12,2),
  
  -- Dates
  closing_date DATE,
  offer_date DATE,
  acceptance_deadline DATE,
  
  -- Parties
  buyer_name TEXT,
  seller_name TEXT,
  
  -- Financing
  financing_type TEXT, -- Cash, Conventional, FHA, VA, etc.
  down_payment_percent DECIMAL(5,2),
  loan_amount DECIMAL(12,2),
  
  -- Contingencies
  inspection_period INTEGER, -- days
  appraisal_contingency TEXT,
  financing_contingency TEXT,
  sale_of_other_home_contingency BOOLEAN DEFAULT FALSE,
  
  -- Additional Terms
  key_deadlines TEXT[], -- array of important dates
  special_conditions TEXT[],
  
  -- Agent Information
  buyer_agent TEXT,
  buyer_agent_contact TEXT,
  seller_agent TEXT,
  seller_agent_contact TEXT,
  buyer_brokerage TEXT,
  seller_brokerage TEXT,
  
  -- Disclosures
  seller_disclosures_attached BOOLEAN DEFAULT FALSE,
  
  -- Analysis Metadata
  confidence_score FLOAT DEFAULT NULL,
  analysis_method TEXT DEFAULT 'GPT-4o Files API',
  file_name TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listing Agreements
CREATE TABLE IF NOT EXISTS listing_agreements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  
  -- Property Information
  property_address TEXT,
  property_type TEXT, -- Single family, condo, townhouse, etc.
  
  -- Financial Terms
  listing_price DECIMAL(12,2),
  commission_rate DECIMAL(5,2), -- percentage
  buyer_agent_commission DECIMAL(5,2), -- co-op commission
  
  -- Agreement Terms
  listing_start_date DATE,
  listing_end_date DATE,
  exclusive_or_open TEXT, -- exclusive, open, etc.
  
  -- Parties
  seller_name TEXT,
  listing_agent TEXT,
  listing_agent_contact TEXT,
  brokerage_name TEXT,
  
  -- Marketing Terms
  mls_permission BOOLEAN DEFAULT TRUE,
  mls_info TEXT,
  marketing_terms TEXT[],
  
  -- Property Details
  exclusions TEXT[], -- items excluded from sale
  inclusions TEXT[], -- items included in sale
  
  -- Additional Terms
  special_conditions TEXT[],
  cancellation_terms TEXT,
  renewal_terms TEXT,
  
  -- Showing Instructions
  showing_instructions TEXT,
  lockbox_permission BOOLEAN DEFAULT FALSE,
  sign_permission BOOLEAN DEFAULT TRUE,
  
  -- Analysis Metadata
  confidence_score FLOAT DEFAULT NULL,
  analysis_method TEXT DEFAULT 'GPT-4o Files API',
  file_name TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lease/Rental Agreements
CREATE TABLE IF NOT EXISTS lease_agreements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  
  -- Property Information
  property_address TEXT,
  property_type TEXT, -- apartment, house, condo, etc.
  unit_number TEXT,
  
  -- Financial Terms
  monthly_rent DECIMAL(10,2),
  security_deposit DECIMAL(10,2),
  last_month_rent DECIMAL(10,2),
  pet_deposit DECIMAL(10,2),
  cleaning_deposit DECIMAL(10,2),
  
  -- Lease Terms
  lease_start_date DATE,
  lease_end_date DATE,
  lease_term_months INTEGER,
  
  -- Parties
  tenant_name TEXT,
  tenant_phone TEXT,
  tenant_email TEXT,
  landlord_name TEXT,
  landlord_phone TEXT,
  landlord_email TEXT,
  property_manager TEXT,
  property_manager_contact TEXT,
  
  -- Payment Terms
  rent_due_date INTEGER, -- day of month (1-31)
  late_fee_amount DECIMAL(8,2),
  late_fee_grace_period INTEGER, -- days
  payment_methods TEXT[],
  
  -- Utilities
  utilities_included TEXT[],
  utilities_tenant_responsible TEXT[],
  average_utility_cost DECIMAL(8,2),
  
  -- Pet Policy
  pets_allowed BOOLEAN DEFAULT FALSE,
  pet_policy TEXT,
  pet_fee_monthly DECIMAL(8,2),
  pet_fee_onetime DECIMAL(8,2),
  
  -- Maintenance Responsibilities
  tenant_maintenance_responsibilities TEXT[],
  landlord_maintenance_responsibilities TEXT[],
  emergency_maintenance_contact TEXT,
  
  -- Rules and Restrictions
  smoking_allowed BOOLEAN DEFAULT FALSE,
  noise_restrictions TEXT,
  guest_policy TEXT,
  parking_spaces INTEGER DEFAULT 0,
  parking_fee DECIMAL(8,2),
  
  -- Renewal and Termination
  renewal_options TEXT,
  termination_notice_days INTEGER DEFAULT 30,
  early_termination_fee DECIMAL(10,2),
  lease_break_conditions TEXT[],
  
  -- Additional Terms
  special_conditions TEXT[],
  addendums TEXT[],
  
  -- Analysis Metadata
  confidence_score FLOAT DEFAULT NULL,
  analysis_method TEXT DEFAULT 'GPT-4o Files API',
  file_name TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contract_extractions table for structured data
CREATE TABLE IF NOT EXISTS contract_extractions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE NOT NULL,
  contract_type TEXT NOT NULL,
  extracted_data JSONB NOT NULL,
  confidence_score FLOAT DEFAULT NULL,
  extraction_method TEXT DEFAULT 'llm',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable the pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create contract embeddings table for vector storage
CREATE TABLE IF NOT EXISTS contract_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_hash TEXT UNIQUE NOT NULL,
  chunk_text TEXT NOT NULL,
  section TEXT NOT NULL,
  importance_score FLOAT NOT NULL DEFAULT 1.0,
  embedding vector(1536), -- OpenAI text-embedding-3-small produces 1536-dimensional vectors
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on the embedding column for fast similarity search
CREATE INDEX IF NOT EXISTS contract_embeddings_embedding_idx ON contract_embeddings 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create an index on content_hash for fast lookups
CREATE INDEX IF NOT EXISTS contract_embeddings_content_hash_idx ON contract_embeddings (content_hash);

-- Create an index on user_id for user-specific queries
CREATE INDEX IF NOT EXISTS contract_embeddings_user_id_idx ON contract_embeddings (user_id);

-- Create an index on section for section-based filtering
CREATE INDEX IF NOT EXISTS contract_embeddings_section_idx ON contract_embeddings (section);

-- Function to search for similar embeddings using cosine similarity
CREATE OR REPLACE FUNCTION search_similar_embeddings(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  user_id_filter uuid DEFAULT NULL
)
RETURNS TABLE (
  content_hash text,
  chunk_text text,
  section text,
  importance_score float,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ce.content_hash,
    ce.chunk_text,
    ce.section,
    ce.importance_score,
    1 - (ce.embedding <=> query_embedding) as similarity
  FROM contract_embeddings ce
  WHERE 
    (user_id_filter IS NULL OR ce.user_id = user_id_filter)
    AND 1 - (ce.embedding <=> query_embedding) > match_threshold
  ORDER BY ce.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to get embedding statistics
CREATE OR REPLACE FUNCTION get_embedding_stats(user_id_filter uuid DEFAULT NULL)
RETURNS TABLE (
  total_embeddings bigint,
  unique_sections bigint,
  avg_importance float,
  storage_mb float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::bigint as total_embeddings,
    COUNT(DISTINCT section)::bigint as unique_sections,
    AVG(importance_score)::float as avg_importance,
    (SUM(LENGTH(chunk_text)) / 1024.0 / 1024.0)::float as storage_mb
  FROM contract_embeddings
  WHERE user_id_filter IS NULL OR user_id = user_id_filter;
END;
$$;

-- Create RLS policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create RLS policies for listings
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own listings"
  ON listings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own listings"
  ON listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings"
  ON listings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings"
  ON listings FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for contracts
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own contracts"
  ON contracts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contracts"
  ON contracts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contracts"
  ON contracts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contracts"
  ON contracts FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Create RLS policies for contract_embeddings
ALTER TABLE contract_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own embeddings"
  ON contract_embeddings FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own embeddings"
  ON contract_embeddings FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own embeddings"
  ON contract_embeddings FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own embeddings"
  ON contract_embeddings FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Create RLS policies for contract_extractions
ALTER TABLE contract_extractions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own contract extractions"
  ON contract_extractions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM contracts c 
      WHERE c.id = contract_extractions.contract_id 
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own contract extractions"
  ON contract_extractions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM contracts c 
      WHERE c.id = contract_extractions.contract_id 
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own contract extractions"
  ON contract_extractions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM contracts c 
      WHERE c.id = contract_extractions.contract_id 
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own contract extractions"
  ON contract_extractions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM contracts c 
      WHERE c.id = contract_extractions.contract_id 
      AND c.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS listings_user_id_idx ON listings (user_id);
CREATE INDEX IF NOT EXISTS contracts_user_id_idx ON contracts (user_id);
CREATE INDEX IF NOT EXISTS contracts_contract_type_idx ON contracts (contract_type);
CREATE INDEX IF NOT EXISTS contracts_created_at_idx ON contracts (created_at DESC);
CREATE INDEX IF NOT EXISTS contract_extractions_contract_id_idx ON contract_extractions (contract_id);
CREATE INDEX IF NOT EXISTS contract_extractions_contract_type_idx ON contract_extractions (contract_type);
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions (user_id);

-- Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to tables that need it
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contract_embeddings_updated_at BEFORE UPDATE ON contract_embeddings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies for purchase_contracts
ALTER TABLE purchase_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own purchase contracts"
  ON purchase_contracts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchase contracts"
  ON purchase_contracts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchase contracts"
  ON purchase_contracts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own purchase contracts"
  ON purchase_contracts FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for listing_agreements
ALTER TABLE listing_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own listing agreements"
  ON listing_agreements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own listing agreements"
  ON listing_agreements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listing agreements"
  ON listing_agreements FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listing agreements"
  ON listing_agreements FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for lease_agreements
ALTER TABLE lease_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own lease agreements"
  ON lease_agreements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lease agreements"
  ON lease_agreements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lease agreements"
  ON lease_agreements FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lease agreements"
  ON lease_agreements FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS purchase_contracts_user_id_idx ON purchase_contracts (user_id);
CREATE INDEX IF NOT EXISTS purchase_contracts_contract_id_idx ON purchase_contracts (contract_id);
CREATE INDEX IF NOT EXISTS purchase_contracts_property_address_idx ON purchase_contracts (property_address);
CREATE INDEX IF NOT EXISTS purchase_contracts_purchase_price_idx ON purchase_contracts (purchase_price);
CREATE INDEX IF NOT EXISTS purchase_contracts_closing_date_idx ON purchase_contracts (closing_date);
CREATE INDEX IF NOT EXISTS purchase_contracts_created_at_idx ON purchase_contracts (created_at DESC);

CREATE INDEX IF NOT EXISTS listing_agreements_user_id_idx ON listing_agreements (user_id);
CREATE INDEX IF NOT EXISTS listing_agreements_contract_id_idx ON listing_agreements (contract_id);
CREATE INDEX IF NOT EXISTS listing_agreements_property_address_idx ON listing_agreements (property_address);
CREATE INDEX IF NOT EXISTS listing_agreements_listing_price_idx ON listing_agreements (listing_price);
CREATE INDEX IF NOT EXISTS listing_agreements_listing_end_date_idx ON listing_agreements (listing_end_date);
CREATE INDEX IF NOT EXISTS listing_agreements_created_at_idx ON listing_agreements (created_at DESC);

CREATE INDEX IF NOT EXISTS lease_agreements_user_id_idx ON lease_agreements (user_id);
CREATE INDEX IF NOT EXISTS lease_agreements_contract_id_idx ON lease_agreements (contract_id);
CREATE INDEX IF NOT EXISTS lease_agreements_property_address_idx ON lease_agreements (property_address);
CREATE INDEX IF NOT EXISTS lease_agreements_monthly_rent_idx ON lease_agreements (monthly_rent);
CREATE INDEX IF NOT EXISTS lease_agreements_lease_end_date_idx ON lease_agreements (lease_end_date);
CREATE INDEX IF NOT EXISTS lease_agreements_created_at_idx ON lease_agreements (created_at DESC);

-- Apply the updated_at trigger to new tables
CREATE TRIGGER update_purchase_contracts_updated_at BEFORE UPDATE ON purchase_contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listing_agreements_updated_at BEFORE UPDATE ON listing_agreements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lease_agreements_updated_at BEFORE UPDATE ON lease_agreements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
