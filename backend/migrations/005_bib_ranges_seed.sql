-- Seed: диапазоны номеров для GRAND TOUR
-- Вставляем для каждой дистанции GRAND TOUR

-- GRAND TOUR - Мужчины
INSERT INTO bib_number_ranges (event_distance_id, category_code, gender, min_age, max_age, range_start, range_end, reserved_count, is_group_a)
SELECT ed.id, 'A', 'male', 18, NULL, 1, 50, 19, true
FROM event_distances ed JOIN events e ON ed.event_id = e.id
WHERE e.name ILIKE '%grand%' AND ed.name ILIKE '%мужчин%'
ON CONFLICT (event_distance_id, category_code) DO NOTHING;

INSERT INTO bib_number_ranges (event_distance_id, category_code, gender, min_age, max_age, range_start, range_end, reserved_count, is_group_a)
SELECT ed.id, 'M1', 'male', 18, 29, 101, 199, 22, false
FROM event_distances ed JOIN events e ON ed.event_id = e.id
WHERE e.name ILIKE '%grand%' AND ed.name ILIKE '%мужчин%'
ON CONFLICT (event_distance_id, category_code) DO NOTHING;

INSERT INTO bib_number_ranges (event_distance_id, category_code, gender, min_age, max_age, range_start, range_end, reserved_count, is_group_a)
SELECT ed.id, 'M2', 'male', 30, 39, 301, 399, 20, false
FROM event_distances ed JOIN events e ON ed.event_id = e.id
WHERE e.name ILIKE '%grand%' AND ed.name ILIKE '%мужчин%'
ON CONFLICT (event_distance_id, category_code) DO NOTHING;

INSERT INTO bib_number_ranges (event_distance_id, category_code, gender, min_age, max_age, range_start, range_end, reserved_count, is_group_a)
SELECT ed.id, 'M3', 'male', 40, 49, 401, 499, 20, false
FROM event_distances ed JOIN events e ON ed.event_id = e.id
WHERE e.name ILIKE '%grand%' AND ed.name ILIKE '%мужчин%'
ON CONFLICT (event_distance_id, category_code) DO NOTHING;

INSERT INTO bib_number_ranges (event_distance_id, category_code, gender, min_age, max_age, range_start, range_end, reserved_count, is_group_a)
SELECT ed.id, 'M4', 'male', 50, 59, 501, 599, 20, false
FROM event_distances ed JOIN events e ON ed.event_id = e.id
WHERE e.name ILIKE '%grand%' AND ed.name ILIKE '%мужчин%'
ON CONFLICT (event_distance_id, category_code) DO NOTHING;

INSERT INTO bib_number_ranges (event_distance_id, category_code, gender, min_age, max_age, range_start, range_end, reserved_count, is_group_a)
SELECT ed.id, 'M5', 'male', 60, NULL, 601, 630, 6, false
FROM event_distances ed JOIN events e ON ed.event_id = e.id
WHERE e.name ILIKE '%grand%' AND ed.name ILIKE '%мужчин%'
ON CONFLICT (event_distance_id, category_code) DO NOTHING;

-- GRAND TOUR - Женщины
INSERT INTO bib_number_ranges (event_distance_id, category_code, gender, min_age, max_age, range_start, range_end, reserved_count, is_group_a)
SELECT ed.id, 'FA', 'female', 18, NULL, 701, 749, 11, true
FROM event_distances ed JOIN events e ON ed.event_id = e.id
WHERE e.name ILIKE '%grand%' AND ed.name ILIKE '%женщин%'
ON CONFLICT (event_distance_id, category_code) DO NOTHING;

INSERT INTO bib_number_ranges (event_distance_id, category_code, gender, min_age, max_age, range_start, range_end, reserved_count, is_group_a)
SELECT ed.id, 'F1', 'female', 18, 29, 751, 799, 11, false
FROM event_distances ed JOIN events e ON ed.event_id = e.id
WHERE e.name ILIKE '%grand%' AND ed.name ILIKE '%женщин%'
ON CONFLICT (event_distance_id, category_code) DO NOTHING;

INSERT INTO bib_number_ranges (event_distance_id, category_code, gender, min_age, max_age, range_start, range_end, reserved_count, is_group_a)
SELECT ed.id, 'F2', 'female', 30, 39, 801, 849, 11, false
FROM event_distances ed JOIN events e ON ed.event_id = e.id
WHERE e.name ILIKE '%grand%' AND ed.name ILIKE '%женщин%'
ON CONFLICT (event_distance_id, category_code) DO NOTHING;

INSERT INTO bib_number_ranges (event_distance_id, category_code, gender, min_age, max_age, range_start, range_end, reserved_count, is_group_a)
SELECT ed.id, 'F3', 'female', 40, 54, 851, 899, 11, false
FROM event_distances ed JOIN events e ON ed.event_id = e.id
WHERE e.name ILIKE '%grand%' AND ed.name ILIKE '%женщин%'
ON CONFLICT (event_distance_id, category_code) DO NOTHING;

INSERT INTO bib_number_ranges (event_distance_id, category_code, gender, min_age, max_age, range_start, range_end, reserved_count, is_group_a)
SELECT ed.id, 'F4', 'female', 55, NULL, 901, 949, 11, false
FROM event_distances ed JOIN events e ON ed.event_id = e.id
WHERE e.name ILIKE '%grand%' AND ed.name ILIKE '%женщин%'
ON CONFLICT (event_distance_id, category_code) DO NOTHING;

-- MEDIAN TOUR
INSERT INTO bib_number_ranges (event_distance_id, category_code, gender, min_age, max_age, range_start, range_end, reserved_count, is_group_a)
SELECT ed.id, 'MM', 'male', 18, NULL, 1001, 1499, 22, false
FROM event_distances ed JOIN events e ON ed.event_id = e.id
WHERE e.name ILIKE '%median%' AND ed.name ILIKE '%мужчин%'
ON CONFLICT (event_distance_id, category_code) DO NOTHING;

INSERT INTO bib_number_ranges (event_distance_id, category_code, gender, min_age, max_age, range_start, range_end, reserved_count, is_group_a)
SELECT ed.id, 'MF', 'female', 18, NULL, 1501, 1999, 20, false
FROM event_distances ed JOIN events e ON ed.event_id = e.id
WHERE e.name ILIKE '%median%' AND ed.name ILIKE '%женщин%'
ON CONFLICT (event_distance_id, category_code) DO NOTHING;

-- INTRO TOUR
INSERT INTO bib_number_ranges (event_distance_id, category_code, gender, min_age, max_age, range_start, range_end, reserved_count, is_group_a)
SELECT ed.id, 'IM', 'male', 18, NULL, 2001, 2499, 22, false
FROM event_distances ed JOIN events e ON ed.event_id = e.id
WHERE e.name ILIKE '%intro%' AND ed.name ILIKE '%мужчин%'
ON CONFLICT (event_distance_id, category_code) DO NOTHING;

INSERT INTO bib_number_ranges (event_distance_id, category_code, gender, min_age, max_age, range_start, range_end, reserved_count, is_group_a)
SELECT ed.id, 'IF', 'female', 18, NULL, 2501, 2999, 20, false
FROM event_distances ed JOIN events e ON ed.event_id = e.id
WHERE e.name ILIKE '%intro%' AND ed.name ILIKE '%женщин%'
ON CONFLICT (event_distance_id, category_code) DO NOTHING;
