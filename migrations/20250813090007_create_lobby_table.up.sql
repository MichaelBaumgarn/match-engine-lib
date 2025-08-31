CREATE TABLE lobbies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'confirmed')),
  max_players_by_side INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  start_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  visibility TEXT CHECK (visibility IN ('public', 'invite', 'private')),
  court_name TEXT,
  club_id UUID
);

CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  skill_level TEXT,
  profile_picture TEXT,
  city TEXT,
  supabase_id TEXT UNIQUE,
  email TEXT UNIQUE
);

CREATE TABLE clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  slug TEXT UNIQUE
);

CREATE TABLE side_slots (
  id SERIAL PRIMARY KEY,
  player_id UUID NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('left', 'right')),
  lobby_id UUID NOT NULL REFERENCES lobbies(id) ON DELETE CASCADE
);

-- Add foreign key constraints
ALTER TABLE lobbies ADD CONSTRAINT fk_club_id FOREIGN KEY (club_id) REFERENCES clubs(id);
ALTER TABLE side_slots ADD CONSTRAINT fk_player_id FOREIGN KEY (player_id) REFERENCES players(id);
