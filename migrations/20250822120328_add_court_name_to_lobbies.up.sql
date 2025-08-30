-- Add column as nullable first
ALTER TABLE lobbies ADD COLUMN court_name TEXT;

-- Set a default value for existing records
UPDATE lobbies SET court_name = 'Court 1' WHERE court_name IS NULL;

-- Make the column NOT NULL
ALTER TABLE lobbies ALTER COLUMN court_name SET NOT NULL;
