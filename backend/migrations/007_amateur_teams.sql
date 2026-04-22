CREATE TABLE IF NOT EXISTS amateur_teams (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

INSERT INTO amateur_teams (name) VALUES
  ('7 Холмов'), ('Велопрактика'), ('Велоспорт'), ('Горные Вершины'),
  ('Клуб Любителей'), ('Магадан CT'), ('Мангазея'), ('МГФСО'), ('МСК'),
  ('ПРОФИКИЛЮБИТЕЛИ'), ('ПЫХteam'), ('ЯБайк'), ('Alex Team'), ('BC Club'),
  ('Black Sea cycling team'), ('Class Team'), ('Cyclica'), ('Desperados cycling'),
  ('Essentuki CT'), ('Etalon Team'), ('Gazprom Triathlon Team'), ('HBFS'),
  ('HotLine'), ('I Love Cycling'), ('Impulse Team'), ('Lazy Riders'),
  ('Legion CC'), ('MIB Club'), ('Mosgorbike Team'), ('Olympo Team'),
  ('OTTO Superbike'), ('Performance racers'), ('Queenz'), ('Ralan'), ('RCA'),
  ('Rébellion'), ('Serpantin'), ('Skill Up'), ('Slow Flow'), ('Time NEXT'),
  ('TOP (Team Of Power)'), ('U238'), ('Vellstore'), ('VeloStar'),
  ('VeterOK SBR Club'), ('Volga Union'), ('Voronezh CT'), ('WEONSPORT'),
  ('X-Team'), ('Zubov Team')
ON CONFLICT (name) DO NOTHING;
