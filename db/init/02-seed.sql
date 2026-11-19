-- Sample data.

INSERT INTO events (title, category, starts_at, location, description) VALUES
  ('Exchange Student Orientation', 'Academic', TIMESTAMP(CURDATE(), '10:00:00'), 'Main Building', 'Meet the exchange office and learn how registration and course add/drop work.'),
  ('Language Exchange Cafe', 'Social', TIMESTAMP(CURDATE(), '12:00:00'), 'Centennial Campus Cafe', 'Practice Cantonese, English and more over lunch.'),
  ('Street Food Tour: Sai Ying Pun', 'Food', TIMESTAMP(CURDATE(), '15:00:00'), 'Sai Ying Pun MTR Exit B2', 'Guided walk through local dim sum and tea spots near campus.'),
  ('Hong Kong Heritage Walk', 'Culture', TIMESTAMP(CURDATE(), '16:00:00'), 'Hong Kong Museum of Medical Sciences', 'Visit nearby heritage sites with student guides.'),
  ('Evening Badminton Meetup', 'Sports', TIMESTAMP(CURDATE(), '19:00:00'), 'Sports Centre', 'Casual doubles open to all levels. Rackets provided.');

-- Upcoming sample events over the next 8 days, counted from the day the database is created,
-- so a fresh deployment always has something under "Upcoming". created_by is NULL: they show as "WEST".
INSERT INTO events (title, category, starts_at, location, description) VALUES
  ('Exam Study Skills Workshop', 'Academic', TIMESTAMP(CURDATE() + INTERVAL 1 DAY, '14:00:00'), 'Chi Wah Learning Commons', 'Plan your revision, take better notes and manage exam stress. Bring your timetable.'),
  ('Exchange Welcome Mixer', 'Social', TIMESTAMP(CURDATE() + INTERVAL 1 DAY, '18:30:00'), 'Sun Yat-sen Place', 'Meet other exchange students over snacks and music. Come alone or bring friends.'),
  ('Dragon''s Back Group Hike', 'Sports', TIMESTAMP(CURDATE() + INTERVAL 2 DAY, '09:00:00'), 'Shau Kei Wan MTR Exit A3', 'An easy half-day ridge hike ending at Big Wave Bay beach. Bring water and sunscreen.'),
  ('Tai O Fishing Village Day Trip', 'Culture', TIMESTAMP(CURDATE() + INTERVAL 3 DAY, '10:00:00'), 'Tung Chung MTR Exit B', 'See the stilt houses and try local snacks. We take the bus together from Tung Chung.'),
  ('Cantonese for Beginners: Ordering Food', 'Culture', TIMESTAMP(CURDATE() + INTERVAL 4 DAY, '17:00:00'), 'Run Run Shaw Tower', 'Learn the phrases you need at a cha chaan teng, then practise them with local students.'),
  ('Cha Chaan Teng Breakfast Meetup', 'Food', TIMESTAMP(CURDATE() + INTERVAL 5 DAY, '08:30:00'), 'Kennedy Town MTR Exit C', 'Milk tea, pineapple buns and macaroni soup before class.'),
  ('Table Tennis Drop-in', 'Sports', TIMESTAMP(CURDATE() + INTERVAL 5 DAY, '19:00:00'), 'Lindsay Ride Sports Centre', 'Friendly games for every level. Bats and balls provided.'),
  ('Credit Transfer Drop-in', 'Academic', TIMESTAMP(CURDATE() + INTERVAL 6 DAY, '11:00:00'), 'Main Building', 'Bring your study plan and ask how to get your HKU courses approved at home.'),
  ('International Potluck Dinner', 'Food', TIMESTAMP(CURDATE() + INTERVAL 7 DAY, '18:30:00'), 'Centennial Campus', 'Bring a dish from home and share it. Plates and drinks provided.'),
  ('Board Game Night', 'Social', TIMESTAMP(CURDATE() + INTERVAL 8 DAY, '19:00:00'), 'Main Library Learning Commons', 'A relaxed break before exams. Games provided, or bring your own.'),
  ('Temple Street Night Market Walk', 'Culture', TIMESTAMP(CURDATE() + INTERVAL 8 DAY, '20:00:00'), 'Jordan MTR Exit A', 'Walk the night market with student guides and try street food along the way.');

INSERT INTO blog_posts (title, content, category, created_at) VALUES
  ('My first week at HKU: what I wish I knew', 'Navigating Main Campus, finding the best study spots in Main Library, and getting used to the steep hills and escalators!', 'Campus Life', DATE_SUB(NOW(), INTERVAL 1 DAY)),
  ('How to get an Octopus card and top it up', 'A complete guide for exchange and international students to apply for Student Octopus and set up automatic top-ups.', 'Tips', DATE_SUB(NOW(), INTERVAL 3 DAY)),
  ('Cheap eats in Kennedy Town and Sai Ying Pun', 'Budget-friendly dim sum, cart noodles, and cafes just a short MTR ride or walk away from Centennial Campus.', 'Food', DATE_SUB(NOW(), INTERVAL 6 DAY)),
  ('Best weekend hikes starting near campus', 'From Lugard Road at Victoria Peak to Mount Davis: quick nature escapes when you need a study break.', 'Hong Kong', DATE_SUB(NOW(), INTERVAL 10 DAY)),
  ('Surviving midterm season: Quiet library spots', 'Hidden study nooks in Chi Wah Learning Commons, Knowles Building, and Fung Ping Shan Library.', 'Academic', DATE_SUB(NOW(), INTERVAL 14 DAY));

INSERT INTO food_spots (name, cuisine, walk_minutes) VALUES
  ('Main Building Canteen', 'Local set meals', 3),
  ('Sai Ying Pun Dim Sum House', 'Cantonese', 8),
  ('Centennial Campus Cafe', 'Cafe and sandwiches', 5);