import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('[DB Migration] Starting database migration...');

    // Check if we need to add missing columns
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_info', { table_name: 'contracts' });

    if (tableError) {
      console.log('[DB Migration] Could not check table info, proceeding with migration...');
    }

    // Try to add missing columns (this will fail silently if they already exist)
    const migrations = [
      'ALTER TABLE contracts ADD COLUMN IF NOT EXISTS extracted_data JSONB',
      'ALTER TABLE contracts ADD COLUMN IF NOT EXISTS confidence_score FLOAT DEFAULT NULL',
      'ALTER TABLE contracts ADD COLUMN IF NOT EXISTS contract_type TEXT'
    ];

    for (const migration of migrations) {
      try {
        const { error } = await supabase.rpc('execute_sql', { sql: migration });
        if (error) {
          console.log(`[DB Migration] Migration query failed (might already exist): ${error.message}`);
        } else {
          console.log(`[DB Migration] Successfully executed: ${migration}`);
        }
      } catch (err) {
        console.log(`[DB Migration] Migration error (continuing): ${err}`);
      }
    }

    // Test database connection and table structure
    const { data: testData, error: testError } = await supabase
      .from('contracts')
      .select('id, title, user_id, contract_type, extracted_data, confidence_score')
      .limit(1);

    if (testError) {
      console.error('[DB Migration] Database test failed:', testError);
      return NextResponse.json({
        success: false,
        error: 'Database migration failed',
        details: testError.message
      }, { status: 500 });
    }

    console.log('[DB Migration] Database migration completed successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Database migration completed successfully',
      tableStructure: 'All required columns are available'
    });

  } catch (error: any) {
    console.error('[DB Migration] Unexpected error:', error);
    return NextResponse.json({
      success: false,
      error: 'Migration failed',
      details: error.message
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