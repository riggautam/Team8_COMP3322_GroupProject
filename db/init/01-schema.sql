CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NULL,          -- NULL for accounts that only use Google sign-in
  google_id VARCHAR(255) NULL UNIQUE,  -- Google's permanent user id ("sub"); NULL until linked
  display_name VARCHAR(100) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user', -- admins are promoted by hand with SQL, never by sign-up
  terms_accepted_at TIMESTAMP NULL,                   -- when they ticked "I agree" at sign-up
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Login sessions, managed by express-session through express-mysql-session.
CREATE TABLE IF NOT EXISTS sessions (
  session_id VARCHAR(128) COLLATE utf8mb4_bin NOT NULL PRIMARY KEY,
  expires INT UNSIGNED NOT NULL,
  data MEDIUMTEXT COLLATE utf8mb4_bin
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'General',
  author_id INT NULL,
  hidden BOOLEAN NOT NULL DEFAULT FALSE, -- hidden by reports or an admin; left out of public lists
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_blog_posts_category (category),
  -- Deleting an account keeps its posts, shown as Anonymous.
  CONSTRAINT fk_blog_posts_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS blog_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  author_id INT DEFAULT NULL,
  content TEXT NOT NULL,
  hidden BOOLEAN NOT NULL DEFAULT FALSE, -- hidden by reports or an admin
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Up and down votes on blog posts. value is 1 for an upvote and -1 for a downvote.
CREATE TABLE IF NOT EXISTS blog_votes (
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  value TINYINT NOT NULL,
  voted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- last time this vote was cast or changed
  PRIMARY KEY (post_id, user_id), -- one vote per user per post
  CONSTRAINT chk_blog_votes_value CHECK (value IN (-1, 1)),
  FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  starts_at DATETIME NOT NULL,          -- Hong Kong time
  location VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,            -- '' when the creator left it empty
  created_by INT NULL,                  -- NULL for the sample events, shown as "WEST"
  hidden BOOLEAN NOT NULL DEFAULT FALSE, -- hidden by reports or an admin; left out of public lists
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_events_title_start (title, starts_at),
  KEY idx_events_starts_at (starts_at),
  -- Deleting an account keeps its events. They then show as "WEST" and only an admin can change them.
  CONSTRAINT fk_events_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Events a student has saved (bookmarked) to see on their dashboard. One row per student per event.
CREATE TABLE IF NOT EXISTS saved_events (
  user_id INT NOT NULL,
  event_id INT NOT NULL,
  saved_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, event_id), -- saving the same event twice keeps one row
  KEY idx_saved_events_event (event_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS food_spots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE,
  cuisine VARCHAR(100) NOT NULL,
  walk_minutes SMALLINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- Each student's own checklist. New accounts get a starter list (see backend/starterChecklist.js).
CREATE TABLE IF NOT EXISTS checklist_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  label VARCHAR(150) NOT NULL,
  is_done BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_checklist_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Each student's planned course mappings and how far each has got.
CREATE TABLE IF NOT EXISTS course_mappings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  hku_code VARCHAR(30) NOT NULL,
  home_code VARCHAR(30) NOT NULL,
  home_url VARCHAR(2048) NULL, -- link to the home course page, when known
  credits DECIMAL(4,1) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_course_mappings_user (user_id),
  UNIQUE KEY uq_course_mappings_pair (user_id, hku_code, home_code), -- the same pair can't be saved twice
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
-- Reports from logged-in users about posts, comments and events. One table for every kind of
-- content: target_type says which table target_id points into. That means target_id can't be a
-- real foreign key, so the server checks the item exists before saving a report.
CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reporter_id INT NOT NULL,
  target_type ENUM('post', 'comment', 'event') NOT NULL,
  target_id INT NOT NULL,
  reason ENUM('spam', 'offensive', 'personal_info', 'misleading', 'other') NOT NULL,
  details VARCHAR(500) NULL,
  status ENUM('open', 'dismissed', 'actioned') NOT NULL DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  resolved_by INT NULL,
  UNIQUE KEY uq_reports_once (reporter_id, target_type, target_id), -- one report per person per item
  KEY idx_reports_target (target_type, target_id, status),
  FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
);
