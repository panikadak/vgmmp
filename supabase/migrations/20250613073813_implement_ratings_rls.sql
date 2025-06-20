-- Implement Row Level Security for Ratings Tables
-- This migration secures the ratings and rating_sessions tables

-- Enable RLS on ratings and rating_sessions tables
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rating_sessions ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Anyone can view ratings" ON ratings;
DROP POLICY IF EXISTS "Anyone can submit ratings" ON ratings;
DROP POLICY IF EXISTS "Anyone can create rating sessions" ON rating_sessions;
DROP POLICY IF EXISTS "Users can view their own sessions" ON rating_sessions;

-- Ratings policies
-- Policy 1: Anyone can view ratings (public read access)
CREATE POLICY "Anyone can view ratings" ON ratings 
    FOR SELECT 
    USING (true);

-- Policy 2: Anyone can submit ratings (but prevent manipulation with other constraints)
CREATE POLICY "Anyone can submit ratings" ON ratings 
    FOR INSERT 
    WITH CHECK (true);

-- Policy 3: Ratings cannot be updated (prevents manipulation)
CREATE POLICY "Ratings cannot be updated" ON ratings 
    FOR UPDATE 
    USING (false);

-- Policy 4: Ratings cannot be deleted by users (prevents manipulation)
CREATE POLICY "Ratings cannot be deleted by users" ON ratings 
    FOR DELETE 
    USING (false);

-- Policy 5: Admins can moderate ratings (update/delete for content moderation)
CREATE POLICY "Admins can moderate ratings" ON ratings 
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

-- Rating sessions policies
-- Policy 1: Anyone can create rating sessions
CREATE POLICY "Anyone can create rating sessions" ON rating_sessions 
    FOR INSERT 
    WITH CHECK (true);

-- Policy 2: Anyone can view rating sessions (needed for rate limiting)
CREATE POLICY "Anyone can view rating sessions" ON rating_sessions 
    FOR SELECT 
    USING (true);

-- Policy 3: Rating sessions cannot be updated
CREATE POLICY "Rating sessions cannot be updated" ON rating_sessions 
    FOR UPDATE 
    USING (false);

-- Policy 4: Rating sessions cannot be deleted by users
CREATE POLICY "Rating sessions cannot be deleted by users" ON rating_sessions 
    FOR DELETE 
    USING (false);

-- Policy 5: Admins can moderate rating sessions
CREATE POLICY "Admins can moderate rating sessions" ON rating_sessions 
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM authorized_admins 
            WHERE LOWER(wallet_address) = LOWER(auth.jwt() ->> 'sub') 
            AND is_active = true
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ratings_session_id ON ratings(session_id);
CREATE INDEX IF NOT EXISTS idx_ratings_game_session ON ratings(game_id, session_id);
CREATE INDEX IF NOT EXISTS idx_rating_sessions_session_id ON rating_sessions(session_id);

-- Add comments to track this migration
COMMENT ON TABLE ratings IS 'Ratings table with RLS policies - public read, immutable after creation, admin moderation';
COMMENT ON TABLE rating_sessions IS 'Rating sessions table with RLS policies - public read, immutable after creation, admin moderation';

-- Test notification
DO $$
BEGIN
    RAISE NOTICE 'RLS policies for ratings and rating_sessions tables have been successfully implemented';
    RAISE NOTICE 'Policies: public read, immutable after creation, admin moderation';
END $$;
