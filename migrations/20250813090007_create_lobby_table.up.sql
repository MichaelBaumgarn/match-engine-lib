CREATE TABLE lobbies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'confirmed')),
  max_players_by_side INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE players (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL
  -- optionally add rank, rating, etc.
);

CREATE TABLE lobby_players (
  lobby_id UUID REFERENCES lobbies(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  side TEXT NOT NULL CHECK (side IN ('left', 'right')),
  PRIMARY KEY (lobby_id, player_id)
);
