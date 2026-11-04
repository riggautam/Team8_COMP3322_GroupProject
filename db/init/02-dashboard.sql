CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  starts_at DATETIME NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_events_title_start (title, starts_at),
  KEY idx_events_starts_at (starts_at)
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(120) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(100) NOT NULL,
  published_at DATETIME NOT NULL,
  read_time_minutes TINYINT UNSIGNED NOT NULL,
  category VARCHAR(50) NOT NULL,
  excerpt TEXT NOT NULL,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  tags JSON NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_blog_posts_published (is_published, published_at)
);

CREATE TABLE IF NOT EXISTS food_spots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE,
  cuisine VARCHAR(100) NOT NULL,
  walk_minutes SMALLINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT IGNORE INTO events (title, category, starts_at, location, description) VALUES
  ('Exchange Student Orientation', 'Academic', TIMESTAMP(CURDATE(), '10:00:00'), 'Main Building', 'Meet the exchange office and learn how registration and course add/drop work.'),
  ('Language Exchange Cafe', 'Social', TIMESTAMP(CURDATE(), '12:00:00'), 'Centennial Campus Cafe', 'Practice Cantonese, English and more over lunch.'),
  ('Street Food Tour: Sai Ying Pun', 'Food', TIMESTAMP(CURDATE(), '15:00:00'), 'Sai Ying Pun MTR Exit B2', 'Guided walk through local dim sum and tea spots near campus.'),
  ('Hong Kong Heritage Walk', 'Culture', TIMESTAMP(CURDATE(), '16:00:00'), 'Hong Kong Museum of Medical Sciences', 'Visit nearby heritage sites with student guides.'),
  ('Evening Badminton Meetup', 'Sports', TIMESTAMP(CURDATE(), '19:00:00'), 'Sports Centre', 'Casual doubles open to all levels. Rackets provided.');

INSERT IGNORE INTO blog_posts
  (slug, title, author, published_at, read_time_minutes, category, excerpt, featured, tags)
VALUES
  ('first-week-at-hku', 'My first week at HKU: what I wish I knew', 'Mia', DATE_SUB(NOW(), INTERVAL 1 DAY), 4, 'Academic', 'Navigating Main Campus, finding the best study spots in Main Library, and getting used to the steep hills and escalators!', TRUE, JSON_ARRAY('Orientation', 'Campus Life', 'Tips')),
  ('octopus-card-guide', 'How to get an Octopus card and top it up', 'Lucas', DATE_SUB(NOW(), INTERVAL 3 DAY), 3, 'Tips', 'A complete guide for exchange and international students to apply for Student Octopus and set up automatic top-ups.', FALSE, JSON_ARRAY('Transport', 'Essentials')),
  ('cheap-eats-kennedy-town', 'Cheap eats in Kennedy Town and Sai Ying Pun', 'Chloe', DATE_SUB(NOW(), INTERVAL 6 DAY), 5, 'Food', 'Budget-friendly dim sum, cart noodles, and cafes just a short MTR ride or walk away from Centennial Campus.', FALSE, JSON_ARRAY('Food', 'Budget')),
  ('weekend-hikes', 'Best weekend hikes starting near campus', 'Alex', DATE_SUB(NOW(), INTERVAL 10 DAY), 6, 'Lifestyle', 'From Lugard Road at Victoria Peak to Mount Davis – quick nature escapes when you need a study break.', FALSE, JSON_ARRAY('Outdoors', 'Hong Kong')),
  ('quiet-library-spots', 'Surviving midterm season: Quiet library spots', 'Ethan', DATE_SUB(NOW(), INTERVAL 14 DAY), 4, 'Academic', 'Hidden study nooks in Chi Wah Learning Commons, Knowles Building, and Fung Ping Shan Library.', FALSE, JSON_ARRAY('Study', 'HKU'));

INSERT IGNORE INTO food_spots (name, cuisine, walk_minutes) VALUES
  ('Main Building Canteen', 'Local set meals', 3),
  ('Sai Ying Pun Dim Sum House', 'Cantonese', 8),
  ('Centennial Campus Cafe', 'Cafe and sandwiches', 5);
