-- Drop all tables and data completely
-- Drop in dependency order (most dependent first)

-- Drop side_slots table first (depends on lobbies and players)
DROP TABLE IF EXISTS side_slots CASCADE;

-- Drop foreign key constraints before dropping tables
ALTER TABLE lobbies DROP CONSTRAINT IF EXISTS fk_club_id CASCADE;

-- Drop main tables
DROP TABLE IF EXISTS lobbies CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS clubs CASCADE;

-- Ensure all sequences are also dropped
DROP SEQUENCE IF EXISTS side_slots_id_seq CASCADE;
