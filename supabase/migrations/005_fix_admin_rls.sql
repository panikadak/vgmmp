-- Fix admin RLS policies to work with Supabase JWT tokens
-- The authenticated user's wallet address is stored in user_metadata

-- Create improved function that checks authenticated user's wallet address
CREATE OR REPLACE FUNCTION is_authorized_admin_v3()
RETURNS BOOLEAN AS $$
DECLARE
  user_wallet_address TEXT;
BEGIN
  -- Get the wallet address from authenticated user's metadata
  user_wallet_address := LOWER(auth.jwt() ->> 'wallet_address');
  
  -- If not in JWT, try user metadata
  IF user_wallet_address IS NULL THEN
    user_wallet_address := LOWER((auth.jwt() -> 'user_metadata' ->> 'wallet_address'));
  END IF;
  
  -- If still null, user is not authenticated with wallet
  IF user_wallet_address IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if this address exists in authorized_admins table and is active
  RETURN EXISTS (
    SELECT 1 FROM authorized_admins 
    WHERE LOWER(wallet_address) = user_wallet_address 
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
    WITH CHECK (is_authorized_admin_v3());

CREATE POLICY "Only authorized admin can update games" ON games
    FOR UPDATE 
    USING (is_authorized_admin_v3());

CREATE POLICY "Only authorized admin can delete games" ON games
    FOR DELETE 
    USING (is_authorized_admin_v3());

-- Test the function with debug info
CREATE OR REPLACE FUNCTION debug_admin_auth()
RETURNS TABLE(
  jwt_sub TEXT,
  jwt_wallet TEXT,
  user_metadata_wallet TEXT,
  is_admin BOOLEAN
) AS $$
BEGIN
  RETURN QUERY SELECT
    auth.jwt() ->> 'sub' as jwt_sub,
    auth.jwt() ->> 'wallet_address' as jwt_wallet,
    auth.jwt() -> 'user_metadata' ->> 'wallet_address' as user_metadata_wallet,
    is_authorized_admin_v3() as is_admin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 