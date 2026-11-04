-- Sample data.

INSERT INTO events (title, category, starts_at, location, description) VALUES
  ('Exchange Student Orientation', 'Academic', TIMESTAMP(CURDATE(), '10:00:00'), 'Main Building', 'Meet the exchange office and learn how registration and course add/drop work.'),
  ('Language Exchange Cafe', 'Social', TIMESTAMP(CURDATE(), '12:00:00'), 'Centennial Campus Cafe', 'Practice Cantonese, English and more over lunch.'),
  ('Street Food Tour: Sai Ying Pun', 'Food', TIMESTAMP(CURDATE(), '15:00:00'), 'Sai Ying Pun MTR Exit B2', 'Guided walk through local dim sum and tea spots near campus.'),
  ('Hong Kong Heritage Walk', 'Culture', TIMESTAMP(CURDATE(), '16:00:00'), 'Hong Kong Museum of Medical Sciences', 'Visit nearby heritage sites with student guides.'),
  ('Evening Badminton Meetup', 'Sports', TIMESTAMP(CURDATE(), '19:00:00'), 'Sports Centre', 'Casual doubles open to all levels. Rackets provided.');

INSERT INTO blog_posts (title, content, created_at) VALUES
  ('My first week at HKU: what I wish I knew', 'Navigating Main Campus, finding the best study spots in Main Library, and getting used to the steep hills and escalators!', DATE_SUB(NOW(), INTERVAL 1 DAY)),
  ('How to get an Octopus card and top it up', 'A complete guide for exchange and international students to apply for Student Octopus and set up automatic top-ups.', DATE_SUB(NOW(), INTERVAL 3 DAY)),
  ('Cheap eats in Kennedy Town and Sai Ying Pun', 'Budget-friendly dim sum, cart noodles, and cafes just a short MTR ride or walk away from Centennial Campus.', DATE_SUB(NOW(), INTERVAL 6 DAY)),
  ('Best weekend hikes starting near campus', 'From Lugard Road at Victoria Peak to Mount Davis: quick nature escapes when you need a study break.', DATE_SUB(NOW(), INTERVAL 10 DAY)),
  ('Surviving midterm season: Quiet library spots', 'Hidden study nooks in Chi Wah Learning Commons, Knowles Building, and Fung Ping Shan Library.', DATE_SUB(NOW(), INTERVAL 14 DAY));

INSERT INTO food_spots (name, cuisine, walk_minutes) VALUES
  ('Main Building Canteen', 'Local set meals', 3),
  ('Sai Ying Pun Dim Sum House', 'Cantonese', 8),
  ('Centennial Campus Cafe', 'Cafe and sandwiches', 5);