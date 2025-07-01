-- Kreels Database Initialization Script
-- This script will be executed when the PostgreSQL container starts

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- Create indexes for better performance (will be added after Prisma migration)
-- These are commented out since Prisma will handle the schema creation
-- We can add custom indexes here later if needed

-- Insert initial data
-- This will be handled by the seed script instead

-- Set timezone
ALTER DATABASE kreels SET timezone TO 'UTC';

-- Create a function for updating updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Note: Triggers will be added by Prisma, but this function can be used if needed
