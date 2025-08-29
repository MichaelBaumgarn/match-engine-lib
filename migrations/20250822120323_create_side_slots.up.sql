CREATE TABLE side_slots (
  id SERIAL PRIMARY KEY,
  player_id UUID NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('left', 'right')),
  lobby_id UUID NOT NULL REFERENCES lobbies(id) ON DELETE CASCADE
);
