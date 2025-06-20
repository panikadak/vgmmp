-- Implement Row Level Security for Comments Table
-- This migration ensures users can only modify their own comments

-- First, ensure RLS is enabled on comments table
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON comments;
DROP POLICY IF EXISTS "Users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;

-- Policy 1: Anyone can view comments (public read access)
CREATE POLICY "Comments are viewable by everyone" ON comments
    FOR SELECT 
    USING (true);

-- Policy 2: Authenticated users can create comments
-- The wallet_address must match the authenticated user's address
CREATE POLICY "Authenticated users can create comments" ON comments
    FOR INSERT 
    WITH CHECK (
        auth.role() = 'authenticated' 
        AND wallet_address = LOWER(auth.jwt() ->> 'sub')
    );

-- Policy 3: Users can only update their own comments
CREATE POLICY "Users can update their own comments" ON comments
    FOR UPDATE 
    USING (
        auth.role() = 'authenticated' 
        AND wallet_address = LOWER(auth.jwt() ->> 'sub')
    )
    WITH CHECK (
        auth.role() = 'authenticated' 
        AND wallet_address = LOWER(auth.jwt() ->> 'sub')
    );

-- Policy 4: Users can only delete their own comments
CREATE POLICY "Users can delete their own comments" ON comments
    FOR DELETE 
    USING (
        auth.role() = 'authenticated' 
        AND wallet_address = LOWER(auth.jwt() ->> 'sub')
    );

-- Policy 5: Admins can moderate any comment (update/delete)
-- This allows authorized admins to moderate content
CREATE POLICY "Admins can moderate any comment" ON comments
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM authorized_admins 
            WHERE LOWER(wallet_address) = LOWER(auth.jwt() ->> 'sub') 
            AND is_active = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM authorized_admins 
            WHERE LOWER(wallet_address) = LOWER(auth.jwt() ->> 'sub') 
            AND is_active = true
        )
    );

-- Create index for better performance on wallet_address lookups
CREATE INDEX IF NOT EXISTS idx_comments_wallet_address ON comments(wallet_address);
CREATE INDEX IF NOT EXISTS idx_comments_game_wallet ON comments(game_id, wallet_address);

-- Add comment to track this migration
COMMENT ON TABLE comments IS 'Comments table with RLS policies implemented for user privacy and admin moderation';

-- Test the policies (these will be rolled back)
DO $$
BEGIN
    -- This is just for validation, actual testing should be done in application
    RAISE NOTICE 'RLS policies for comments table have been successfully implemented';
    RAISE NOTICE 'Policies created: public read, authenticated create, owner update/delete, admin moderation';
END $$;
