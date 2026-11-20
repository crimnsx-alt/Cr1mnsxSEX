-- =============================================================================
-- PLAYSTATION 5 SYSTEM SHELL — SUPABASE DATABASE SCHEMA
-- TASK 10: REAL PSN TROPHY SYNC ARCHITECTURE
-- =============================================================================

-- 1. PSN Profiles Table
CREATE TABLE IF NOT EXISTS public.psn_profiles (
  online_id TEXT PRIMARY KEY,
  account_id TEXT,
  display_name TEXT,
  avatar_url TEXT,
  about_me TEXT,
  trophy_level INTEGER DEFAULT 1,
  level_tier INTEGER DEFAULT 1,
  level_progress INTEGER DEFAULT 0,
  total_trophies INTEGER DEFAULT 0,
  platinum INTEGER DEFAULT 0,
  gold INTEGER DEFAULT 0,
  silver INTEGER DEFAULT 0,
  bronze INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PSN Games Table
CREATE TABLE IF NOT EXISTS public.psn_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  online_id TEXT NOT NULL REFERENCES public.psn_profiles(online_id) ON DELETE CASCADE,
  np_communication_id TEXT NOT NULL,
  title_name TEXT NOT NULL,
  title_icon_url TEXT,
  title_platform TEXT DEFAULT 'PS5',
  progress INTEGER DEFAULT 0,
  platinum_earned BOOLEAN DEFAULT FALSE,
  trophy_count_total INTEGER DEFAULT 0,
  trophy_count_earned INTEGER DEFAULT 0,
  trophy_count_bronze INTEGER DEFAULT 0,
  trophy_count_silver INTEGER DEFAULT 0,
  trophy_count_gold INTEGER DEFAULT 0,
  trophy_count_platinum INTEGER DEFAULT 0,
  last_played_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (online_id, np_communication_id)
);

-- 3. PSN Individual Trophies Table
CREATE TABLE IF NOT EXISTS public.psn_trophies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  online_id TEXT NOT NULL REFERENCES public.psn_profiles(online_id) ON DELETE CASCADE,
  np_communication_id TEXT NOT NULL,
  trophy_id INTEGER NOT NULL,
  trophy_hidden BOOLEAN DEFAULT FALSE,
  trophy_type TEXT CHECK (trophy_type IN ('platinum', 'gold', 'silver', 'bronze')),
  trophy_name TEXT NOT NULL,
  trophy_detail TEXT,
  trophy_icon_url TEXT,
  trophy_rare INTEGER DEFAULT 0,
  trophy_earned BOOLEAN DEFAULT FALSE,
  earned_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (online_id, np_communication_id, trophy_id)
);

-- 4. PSN Synchronization History Log
CREATE TABLE IF NOT EXISTS public.psn_sync_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  online_id TEXT NOT NULL,
  sync_status TEXT CHECK (sync_status IN ('success', 'partial', 'failed')),
  sync_source TEXT NOT NULL, -- 'github_actions', 'edge_function', 'manual_import', 'client_sync'
  games_synced INTEGER DEFAULT 0,
  trophies_synced INTEGER DEFAULT 0,
  error_message TEXT,
  duration_ms INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_psn_games_online_id ON public.psn_games(online_id);
CREATE INDEX IF NOT EXISTS idx_psn_games_last_played ON public.psn_games(last_played_at DESC);
CREATE INDEX IF NOT EXISTS idx_psn_trophies_game ON public.psn_trophies(online_id, np_communication_id);
CREATE INDEX IF NOT EXISTS idx_psn_trophies_earned ON public.psn_trophies(trophy_earned, earned_at DESC);
CREATE INDEX IF NOT EXISTS idx_psn_sync_history_date ON public.psn_sync_history(created_at DESC);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

ALTER TABLE public.psn_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psn_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psn_trophies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psn_sync_history ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: Public can view profiles marked as public
DROP POLICY IF EXISTS "Public can view active PSN profiles" ON public.psn_profiles;
CREATE POLICY "Public can view active PSN profiles"
ON public.psn_profiles FOR SELECT
USING (is_public = true);

-- 2. Games: Public can view games of public profiles
DROP POLICY IF EXISTS "Public can view PSN games" ON public.psn_games;
CREATE POLICY "Public can view PSN games"
ON public.psn_games FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.psn_profiles 
    WHERE public.psn_profiles.online_id = public.psn_games.online_id 
    AND public.psn_profiles.is_public = true
  )
);

-- 3. Trophies: Public can view trophies of public profiles
DROP POLICY IF EXISTS "Public can view PSN trophies" ON public.psn_trophies;
CREATE POLICY "Public can view PSN trophies"
ON public.psn_trophies FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.psn_profiles 
    WHERE public.psn_profiles.online_id = public.psn_trophies.online_id 
    AND public.psn_profiles.is_public = true
  )
);

-- 4. Sync History: Public can view sync statuses
DROP POLICY IF EXISTS "Public can view PSN sync history" ON public.psn_sync_history;
CREATE POLICY "Public can view PSN sync history"
ON public.psn_sync_history FOR SELECT
USING (true);

-- 5. Service Role / Admin can insert/update all tables (enforced by Supabase service_role)
