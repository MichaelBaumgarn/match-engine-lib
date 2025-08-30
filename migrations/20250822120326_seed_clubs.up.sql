INSERT INTO clubs (slug, name, address, city) VALUES
  ('beachmitte-berlin', 'BeachMitte', 'Caroline-Michaelis-Straße 8, 10115 Berlin', 'Berlin'),
  ('beach61-berlin', 'Beach 61 (Park am Gleisdreieck)', 'Möckernstraße 26, 10963 Berlin', 'Berlin'),
  ('southbeach-berlin', 'South Beach (AREA 85)', 'Schnellerstraße 137, 12439 Berlin-Lankwitz', 'Berlin'),
  ('east61-berlin', 'East 61', 'Fritz-Wildung-Straße 9, 14199 Berlin-Schöneberg', 'Berlin'),
  ('beachzone-lichtenberg', 'Beach Zone', 'Siegerstraße 33-37, 10365 Berlin-Lichtenberg', 'Berlin'),
  ('spok-pankow', 'SPOK (Sport Kultur Pankow)', 'Nordendstraße 56, 13156 Berlin-Pankow', 'Berlin'),
  ('volkspark-friedrichshain', 'Volkspark Friedrichshain Courts', 'Am Friedrichshain 1, 10407 Berlin', 'Berlin')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  city = EXCLUDED.city;
