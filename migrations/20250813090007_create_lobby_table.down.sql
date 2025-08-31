-- Drop tables in dependency order (most dependent first)
DROP TABLE IF EXISTS side_slots;
-- Drop foreign key constraints before dropping tables
ALTER TABLE lobbies DROP CONSTRAINT IF EXISTS fk_club_id;
DROP TABLE IF EXISTS lobbies;
DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS clubs;
