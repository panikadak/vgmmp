-- Secure admin access - only authorized wallet can modify games
-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can insert games" ON games;
DROP POLICY IF EXISTS "Authenticated users can update games" ON games;
DROP POLICY IF EXISTS "Authenticated users can delete games" ON games;

-- Create a function to check if the current user is the authorized admin
CREATE OR REPLACE FUNCTION is_authorized_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the current user's wallet address matches the authorized admin address
  -- The wallet address should be stored in auth.users.raw_user_meta_data->>'address'
  -- or in a custom way depending on your SIWE implementation
  RETURN (
    auth.jwt() ->> 'sub' = '0x702ba46435d1e55b18440100bc81eb055574875e'
    OR 
    LOWER(auth.jwt() ->> 'sub') = '0x702ba46435d1e55b18440100bc81eb055574875e'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create restrictive policies for games table
-- Only authorized admin can insert games
CREATE POLICY "Only authorized admin can insert games" ON games
    FOR INSERT 
    WITH CHECK (is_authorized_admin());

-- Only authorized admin can update games  
CREATE POLICY "Only authorized admin can update games" ON games
    FOR UPDATE 
    USING (is_authorized_admin());

-- Only authorized admin can delete games
CREATE POLICY "Only authorized admin can delete games" ON games
    FOR DELETE 
    USING (is_authorized_admin());

-- Keep public read access for everyone
-- (The existing "Games are viewable by everyone" policy remains active)

-- Create a table to store authorized admin addresses for future flexibility
CREATE TABLE IF NOT EXISTS authorized_admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS on authorized_admins table
ALTER TABLE authorized_admins ENABLE ROW LEVEL SECURITY;

-- Only allow reading authorized admins (no public write access)
CREATE POLICY "Authorized admins are viewable by authenticated users" ON authorized_admins
    FOR SELECT USING (auth.role() = 'authenticated');

-- Insert the authorized admin address
INSERT INTO authorized_admins (wallet_address) 
VALUES ('0x702ba46435d1e55b18440100bc81eb055574875e')
ON CONFLICT (wallet_address) DO NOTHING;

-- Create an improved function that checks against the authorized_admins table
CREATE OR REPLACE FUNCTION is_authorized_admin_v2()
RETURNS BOOLEAN AS $$
DECLARE
  user_address TEXT;
BEGIN
  -- Get the wallet address from JWT token
  user_address := LOWER(auth.jwt() ->> 'sub');
  
  -- Check if this address exists in authorized_admins table and is active
  RETURN EXISTS (
    SELECT 1 FROM authorized_admins 
    WHERE LOWER(wallet_address) = user_address 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update policies to use the new function
DROP POLICY IF EXISTS "Only authorized admin can insert games" ON games;
DROP POLICY IF EXISTS "Only authorized admin can update games" ON games;
DROP POLICY IF EXISTS "Only authorized admin can delete games" ON games;

CREATE POLICY "Only authorized admin can insert games" ON games
    FOR INSERT 
    WITH CHECK (is_authorized_admin_v2());

CREATE POLICY "Only authorized admin can update games" ON games
    FOR UPDATE 
    USING (is_authorized_admin_v2());

CREATE POLICY "Only authorized admin can delete games" ON games
    FOR DELETE 
    USING (is_authorized_admin_v2()); 