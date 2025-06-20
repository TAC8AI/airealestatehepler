-- Create property_valuations table
CREATE TABLE IF NOT EXISTS property_valuations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    address TEXT NOT NULL,
    headline_range TEXT NOT NULL,
    reasoning TEXT NOT NULL,
    caution TEXT NOT NULL,
    confidence_score DECIMAL(3,2) DEFAULT 0.6,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_property_valuations_user_id ON property_valuations(user_id);

-- Create an index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_property_valuations_created_at ON property_valuations(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE property_valuations ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only see their own valuations
CREATE POLICY "Users can view their own valuations" ON property_valuations
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to insert their own valuations
CREATE POLICY "Users can insert their own valuations" ON property_valuations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own valuations
CREATE POLICY "Users can update their own valuations" ON property_valuations
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for users to delete their own valuations
CREATE POLICY "Users can delete their own valuations" ON property_valuations
    FOR DELETE USING (auth.uid() = user_id);

-- Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_property_valuations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_property_valuations_updated_at
    BEFORE UPDATE ON property_valuations
    FOR EACH ROW
    EXECUTE FUNCTION update_property_valuations_updated_at(); 