CREATE TABLE clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);


alter table lobbies  add COLUMN start_at TIMESTAMP; 
alter table lobbies  add COLUMN duration_minutes INT; 
alter table lobbies  add COLUMN club_id UUID; 
ALTER TABLE lobbies ADD COLUMN visibility TEXT;


ALTER TABLE lobbies ADD CONSTRAINT fk_club_id FOREIGN KEY (club_id) REFERENCES clubs(id);
