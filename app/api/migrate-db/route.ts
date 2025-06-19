import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('[DB Migration] Starting database migration...');

    // Read the schema SQL file
    const schemaSQL = `
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
        financing_type TEXT,
        down_payment_percent DECIMAL(5,2),
        loan_amount DECIMAL(12,2),
        
        -- Contingencies
        inspection_period INTEGER,
        appraisal_contingency TEXT,
        financing_contingency TEXT,
        sale_of_other_home_contingency BOOLEAN DEFAULT FALSE,
        
        -- Additional Terms
        key_deadlines TEXT[],
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
        property_type TEXT,
        
        -- Financial Terms
        listing_price DECIMAL(12,2),
        commission_rate DECIMAL(5,2),
        buyer_agent_commission DECIMAL(5,2),
        
        -- Agreement Terms
        listing_start_date DATE,
        listing_end_date DATE,
        exclusive_or_open TEXT,
        
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
        exclusions TEXT[],
        inclusions TEXT[],
        
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
        property_type TEXT,
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
        rent_due_date INTEGER,
        late_fee_amount DECIMAL(8,2),
        late_fee_grace_period INTEGER,
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
    `;

    // Execute table creation
    const { error: tableError } = await supabase.rpc('execute_sql', { sql: schemaSQL });
    
    if (tableError) {
      console.error('[DB Migration] Table creation failed:', tableError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create specialized tables',
        details: tableError.message
      }, { status: 500 });
    }

    console.log('[DB Migration] Specialized tables created successfully');

    // Enable RLS and create policies
    const rlsPolicies = `
      -- Enable RLS
      ALTER TABLE purchase_contracts ENABLE ROW LEVEL SECURITY;
      ALTER TABLE listing_agreements ENABLE ROW LEVEL SECURITY;
      ALTER TABLE lease_agreements ENABLE ROW LEVEL SECURITY;

      -- Purchase contracts policies
      CREATE POLICY IF NOT EXISTS "Users can view their own purchase contracts"
        ON purchase_contracts FOR SELECT
        USING (auth.uid() = user_id);

      CREATE POLICY IF NOT EXISTS "Users can insert their own purchase contracts"
        ON purchase_contracts FOR INSERT
        WITH CHECK (auth.uid() = user_id);

      CREATE POLICY IF NOT EXISTS "Users can update their own purchase contracts"
        ON purchase_contracts FOR UPDATE
        USING (auth.uid() = user_id);

      CREATE POLICY IF NOT EXISTS "Users can delete their own purchase contracts"
        ON purchase_contracts FOR DELETE
        USING (auth.uid() = user_id);

      -- Listing agreements policies
      CREATE POLICY IF NOT EXISTS "Users can view their own listing agreements"
        ON listing_agreements FOR SELECT
        USING (auth.uid() = user_id);

      CREATE POLICY IF NOT EXISTS "Users can insert their own listing agreements"
        ON listing_agreements FOR INSERT
        WITH CHECK (auth.uid() = user_id);

      CREATE POLICY IF NOT EXISTS "Users can update their own listing agreements"
        ON listing_agreements FOR UPDATE
        USING (auth.uid() = user_id);

      CREATE POLICY IF NOT EXISTS "Users can delete their own listing agreements"
        ON listing_agreements FOR DELETE
        USING (auth.uid() = user_id);

      -- Lease agreements policies
      CREATE POLICY IF NOT EXISTS "Users can view their own lease agreements"
        ON lease_agreements FOR SELECT
        USING (auth.uid() = user_id);

      CREATE POLICY IF NOT EXISTS "Users can insert their own lease agreements"
        ON lease_agreements FOR INSERT
        WITH CHECK (auth.uid() = user_id);

      CREATE POLICY IF NOT EXISTS "Users can update their own lease agreements"
        ON lease_agreements FOR UPDATE
        USING (auth.uid() = user_id);

      CREATE POLICY IF NOT EXISTS "Users can delete their own lease agreements"
        ON lease_agreements FOR DELETE
        USING (auth.uid() = user_id);
    `;

    const { error: rlsError } = await supabase.rpc('execute_sql', { sql: rlsPolicies });
    
    if (rlsError) {
      console.warn('[DB Migration] RLS policies creation had issues (might already exist):', rlsError);
    } else {
      console.log('[DB Migration] RLS policies created successfully');
    }

    // Create indexes
    const indexes = `
      -- Purchase contracts indexes
      CREATE INDEX IF NOT EXISTS purchase_contracts_user_id_idx ON purchase_contracts (user_id);
      CREATE INDEX IF NOT EXISTS purchase_contracts_contract_id_idx ON purchase_contracts (contract_id);
      CREATE INDEX IF NOT EXISTS purchase_contracts_property_address_idx ON purchase_contracts (property_address);
      CREATE INDEX IF NOT EXISTS purchase_contracts_purchase_price_idx ON purchase_contracts (purchase_price);
      CREATE INDEX IF NOT EXISTS purchase_contracts_closing_date_idx ON purchase_contracts (closing_date);
      CREATE INDEX IF NOT EXISTS purchase_contracts_created_at_idx ON purchase_contracts (created_at DESC);

      -- Listing agreements indexes
      CREATE INDEX IF NOT EXISTS listing_agreements_user_id_idx ON listing_agreements (user_id);
      CREATE INDEX IF NOT EXISTS listing_agreements_contract_id_idx ON listing_agreements (contract_id);
      CREATE INDEX IF NOT EXISTS listing_agreements_property_address_idx ON listing_agreements (property_address);
      CREATE INDEX IF NOT EXISTS listing_agreements_listing_price_idx ON listing_agreements (listing_price);
      CREATE INDEX IF NOT EXISTS listing_agreements_listing_end_date_idx ON listing_agreements (listing_end_date);
      CREATE INDEX IF NOT EXISTS listing_agreements_created_at_idx ON listing_agreements (created_at DESC);

      -- Lease agreements indexes
      CREATE INDEX IF NOT EXISTS lease_agreements_user_id_idx ON lease_agreements (user_id);
      CREATE INDEX IF NOT EXISTS lease_agreements_contract_id_idx ON lease_agreements (contract_id);
      CREATE INDEX IF NOT EXISTS lease_agreements_property_address_idx ON lease_agreements (property_address);
      CREATE INDEX IF NOT EXISTS lease_agreements_monthly_rent_idx ON lease_agreements (monthly_rent);
      CREATE INDEX IF NOT EXISTS lease_agreements_lease_end_date_idx ON lease_agreements (lease_end_date);
      CREATE INDEX IF NOT EXISTS lease_agreements_created_at_idx ON lease_agreements (created_at DESC);
    `;

    const { error: indexError } = await supabase.rpc('execute_sql', { sql: indexes });
    
    if (indexError) {
      console.warn('[DB Migration] Index creation had issues (might already exist):', indexError);
    } else {
      console.log('[DB Migration] Indexes created successfully');
    }

    // Test database connection and table structure
    const { data: testData, error: testError } = await supabase
      .from('purchase_contracts')
      .select('id')
      .limit(1);

    if (testError && !testError.message.includes('row-level security')) {
      console.error('[DB Migration] Database test failed:', testError);
      return NextResponse.json({
        success: false,
        error: 'Specialized tables migration failed',
        details: testError.message
      }, { status: 500 });
    }

    console.log('[DB Migration] Specialized contract tables migration completed successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Specialized contract tables created successfully',
      tablesCreated: ['purchase_contracts', 'listing_agreements', 'lease_agreements']
    });

  } catch (error: any) {
    console.error('[DB Migration] Migration error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Database migration failed',
      details: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Send a POST request to run database migration',
    endpoints: {
      migrate: 'POST /api/migrate-db'
    }
  });
} 