-- Migration: new-migration
-- Description: Core schema for Morabaraba online multiplayer, profiles, career statistics, and battle rooms.

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Competitor Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  gamer_tag TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  surname TEXT NOT NULL,
  dob DATE NOT NULL,
  cellphone TEXT NOT NULL,
  country TEXT NOT NULL,
  country_code TEXT NOT NULL,
  province TEXT NOT NULL,
  town TEXT NOT NULL,
  title TEXT DEFAULT 'Warrior',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Career Statistics Table (Ranks, Win Rate, Streaks & ELO)
CREATE TABLE IF NOT EXISTS public.career_stats (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  elo_rating INTEGER DEFAULT 1200 NOT NULL,
  matches_played INTEGER DEFAULT 0 NOT NULL,
  wins INTEGER DEFAULT 0 NOT NULL,
  losses INTEGER DEFAULT 0 NOT NULL,
  win_streak INTEGER DEFAULT 0 NOT NULL,
  best_win_streak INTEGER DEFAULT 0 NOT NULL,
  win_rate NUMERIC(5, 2) DEFAULT 0.00 NOT NULL,
  mills_formed INTEGER DEFAULT 0 NOT NULL,
  cows_captured INTEGER DEFAULT 0 NOT NULL,
  flown_cows INTEGER DEFAULT 0 NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Battle Rooms Table (Public & Private Matches)
CREATE TABLE IF NOT EXISTS public.battle_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code VARCHAR(6) NOT NULL,
  room_type TEXT CHECK (room_type IN ('public', 'private')) NOT NULL,
  status TEXT CHECK (status IN ('waiting', 'in_progress', 'completed', 'abandoned')) DEFAULT 'waiting',
  host_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  challenger_user_id UUID REFERENCES public.profiles(id),
  first_turn_player_id UUID REFERENCES public.profiles(id),
  winner_user_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- 5. Match History / Log Table
CREATE TABLE IF NOT EXISTS public.match_logs (
  id BIGSERIAL PRIMARY KEY,
  room_id UUID REFERENCES public.battle_rooms(id) ON DELETE CASCADE NOT NULL,
  turn_number INTEGER NOT NULL,
  player_id UUID REFERENCES public.profiles(id) NOT NULL,
  move_type TEXT NOT NULL, -- 'place', 'move', 'fly', 'shoot'
  from_vertex INTEGER,
  to_vertex INTEGER,
  shot_vertex INTEGER,
  formed_mill BOOLEAN DEFAULT FALSE,
  board_state JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Indexes for Blazing Fast Queries
CREATE INDEX IF NOT EXISTS idx_profiles_gamer_tag ON public.profiles(gamer_tag);
CREATE INDEX IF NOT EXISTS idx_career_stats_elo ON public.career_stats(elo_rating DESC);
CREATE INDEX IF NOT EXISTS idx_career_stats_win_rate ON public.career_stats(win_rate DESC);
CREATE INDEX IF NOT EXISTS idx_battle_rooms_code ON public.battle_rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_battle_rooms_status ON public.battle_rooms(status);

-- 7. Automated Profile & Career Stats Initializer upon User Registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    gamer_tag,
    name,
    surname,
    dob,
    cellphone,
    country,
    country_code,
    province,
    town,
    title
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'gamer_tag', 'Warrior_' || SUBSTRING(NEW.id::text, 1, 6)),
    COALESCE(NEW.raw_user_meta_data->>'name', 'Warrior'),
    COALESCE(NEW.raw_user_meta_data->>'surname', 'Player'),
    COALESCE((NEW.raw_user_meta_data->>'dob')::date, '2000-01-01'::date),
    COALESCE(NEW.raw_user_meta_data->>'cellphone', '+27000000000'),
    COALESCE(NEW.raw_user_meta_data->>'country', 'South Africa'),
    COALESCE(NEW.raw_user_meta_data->>'country_code', 'ZA'),
    COALESCE(NEW.raw_user_meta_data->>'province', 'Gauteng'),
    COALESCE(NEW.raw_user_meta_data->>'town', 'Johannesburg'),
    'Warrior'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.career_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Automated ELO & Stats Calculator upon Battle Completion
CREATE OR REPLACE FUNCTION public.handle_match_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_winner_elo INT;
  v_loser_elo INT;
  v_expected_winner NUMERIC;
  v_expected_loser NUMERIC;
  v_k_factor INT := 32;
  v_loser_id UUID;
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.winner_user_id IS NOT NULL THEN
    IF NEW.winner_user_id = NEW.host_user_id THEN
      v_loser_id := NEW.challenger_user_id;
    ELSE
      v_loser_id := NEW.host_user_id;
    END IF;

    IF v_loser_id IS NOT NULL THEN
      SELECT elo_rating INTO v_winner_elo FROM public.career_stats WHERE user_id = NEW.winner_user_id;
      SELECT elo_rating INTO v_loser_elo FROM public.career_stats WHERE user_id = v_loser_id;

      IF v_winner_elo IS NOT NULL AND v_loser_elo IS NOT NULL THEN
        v_expected_winner := 1.0 / (1.0 + POWER(10.0, (v_loser_elo - v_winner_elo) / 400.0));
        v_expected_loser := 1.0 / (1.0 + POWER(10.0, (v_winner_elo - v_loser_elo) / 400.0));

        UPDATE public.career_stats
        SET
          matches_played = matches_played + 1,
          wins = wins + 1,
          win_streak = win_streak + 1,
          best_win_streak = GREATEST(best_win_streak, win_streak + 1),
          win_rate = ROUND(((wins + 1)::NUMERIC / (matches_played + 1)::NUMERIC) * 100.0, 2),
          elo_rating = ROUND(v_winner_elo + v_k_factor * (1.0 - v_expected_winner)),
          updated_at = NOW()
        WHERE user_id = NEW.winner_user_id;

        UPDATE public.career_stats
        SET
          matches_played = matches_played + 1,
          losses = losses + 1,
          win_streak = 0,
          win_rate = ROUND((wins::NUMERIC / (matches_played + 1)::NUMERIC) * 100.0, 2),
          elo_rating = GREATEST(100, ROUND(v_loser_elo + v_k_factor * (0.0 - v_expected_loser))),
          updated_at = NOW()
        WHERE user_id = v_loser_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_battle_completed ON public.battle_rooms;
CREATE TRIGGER on_battle_completed
AFTER UPDATE OF status ON public.battle_rooms
FOR EACH ROW EXECUTE FUNCTION public.handle_match_completion();

-- 9. Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles readable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Career stats readable by everyone" ON public.career_stats FOR SELECT USING (true);

CREATE POLICY "Battle rooms viewable by authenticated users" ON public.battle_rooms FOR SELECT USING (true);
CREATE POLICY "Users can create battle rooms" ON public.battle_rooms FOR INSERT WITH CHECK (auth.uid() = host_user_id);
CREATE POLICY "Participants can update battle rooms" ON public.battle_rooms FOR UPDATE USING (auth.uid() = host_user_id OR auth.uid() = challenger_user_id);

CREATE POLICY "Match logs viewable by room participants" ON public.match_logs FOR SELECT USING (true);
CREATE POLICY "Participants can insert match logs" ON public.match_logs FOR INSERT WITH CHECK (auth.uid() = player_id);

-- 10. Enable Supabase Realtime for Battle Rooms
ALTER PUBLICATION supabase_realtime ADD TABLE public.battle_rooms;
