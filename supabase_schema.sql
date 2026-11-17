-- =============================================================================
-- CR1MNSX PS5 SYSTEM SHELL — SUPABASE DATABASE SCHEMA
-- REAL PLAYSTATION 5 FRIENDS & REQUESTS SYSTEM
-- =============================================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  steam TEXT,
  telegram TEXT,
  vk TEXT,
  discord TEXT,
  psn_id TEXT,
  other_platforms TEXT,
  consent_public_contacts BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Friend Requests Table
CREATE TABLE IF NOT EXISTS public.friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname TEXT NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  steam TEXT,
  telegram TEXT,
  vk TEXT,
  discord TEXT,
  psn_id TEXT,
  other_platforms TEXT,
  consent_public_contacts BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  reported BOOLEAN DEFAULT FALSE,
  report_reason TEXT,
  client_fingerprint TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- 3. Friendships (Confirmed Friends) Table
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.friend_requests(id) ON DELETE SET NULL,
  nickname TEXT NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'Online',
  current_game TEXT DEFAULT 'PlayStation®5 System',
  steam TEXT,
  telegram TEXT,
  vk TEXT,
  discord TEXT,
  psn_id TEXT,
  other_platforms TEXT,
  consent_public_contacts BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON public.friend_requests(status);
CREATE INDEX IF NOT EXISTS idx_friend_requests_nickname ON public.friend_requests(nickname);
CREATE INDEX IF NOT EXISTS idx_friendships_created ON public.friendships(created_at DESC);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- 1. Friendships: Any visitor can read the confirmed friends list
DROP POLICY IF EXISTS "Public can view confirmed friendships" ON public.friendships;
CREATE POLICY "Public can view confirmed friendships" 
ON public.friendships FOR SELECT 
USING (true);

-- 2. Friend Requests: Any visitor can insert a new request (Rate limiting enforced via fingerprint/triggers)
DROP POLICY IF EXISTS "Public can insert friend requests" ON public.friend_requests;
CREATE POLICY "Public can insert friend requests" 
ON public.friend_requests FOR INSERT 
WITH CHECK (
  length(trim(nickname)) >= 2 AND 
  length(trim(display_name)) >= 1 AND
  status = 'pending'
);

-- 3. Friend Requests: Visitors can check the status of requests
DROP POLICY IF EXISTS "Public can read friend request statuses" ON public.friend_requests;
CREATE POLICY "Public can read friend request statuses" 
ON public.friend_requests FOR SELECT 
USING (true);

-- 4. Storage Bucket Setup (For avatars)
-- Run in Supabase SQL editor:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public avatar access" ON storage.objects;
CREATE POLICY "Public avatar access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Public avatar upload" ON storage.objects;
CREATE POLICY "Public avatar upload" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars');
