-- St. Bhakita Catholic Youths Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(10),
    venue VARCHAR(200),
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Trip albums table
CREATE TABLE IF NOT EXISTS trip_albums (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    cover_photo VARCHAR(500),
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Photos table
CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    album_id INTEGER NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    caption TEXT,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (album_id) REFERENCES trip_albums(id) ON DELETE CASCADE
);

-- Sunday readings table
CREATE TABLE IF NOT EXISTS sunday_readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(200) NOT NULL,
    reading_text TEXT,
    pdf_path VARCHAR(500),
    sunday_date DATE NOT NULL,
    uploaded_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Daily quotes table (pre-populated with Bible verses)
CREATE TABLE IF NOT EXISTS daily_quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    verse TEXT NOT NULL,
    reference VARCHAR(100) NOT NULL,
    date_index INTEGER UNIQUE NOT NULL, -- Day of year (1-366)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bible books table
CREATE TABLE IF NOT EXISTS bible_books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL,
    testament VARCHAR(10) CHECK (testament IN ('old', 'new')) NOT NULL,
    book_order INTEGER NOT NULL,
    chapters INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bible verses table
CREATE TABLE IF NOT EXISTS bible_verses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES bible_books(id) ON DELETE CASCADE,
    UNIQUE(book_id, chapter, verse)
);

-- Rosary mysteries table
CREATE TABLE IF NOT EXISTS rosary_mysteries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type VARCHAR(20) CHECK (type IN ('joyful', 'sorrowful', 'glorious', 'luminous')) NOT NULL,
    title VARCHAR(200) NOT NULL,
    mystery_order INTEGER NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Auth tokens table (for session management)
CREATE TABLE IF NOT EXISTS auth_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_announcements_date ON announcements(date DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_created_by ON announcements(created_by);
CREATE INDEX IF NOT EXISTS idx_trip_albums_created_by ON trip_albums(created_by);
CREATE INDEX IF NOT EXISTS idx_photos_album_id ON photos(album_id);
CREATE INDEX IF NOT EXISTS idx_sunday_readings_date ON sunday_readings(sunday_date DESC);
CREATE INDEX IF NOT EXISTS idx_sunday_readings_uploaded_by ON sunday_readings(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_daily_quotes_date_index ON daily_quotes(date_index);
CREATE INDEX IF NOT EXISTS idx_bible_verses_book_chapter ON bible_verses(book_id, chapter);
CREATE INDEX IF NOT EXISTS idx_bible_verses_search ON bible_verses(text);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_token ON auth_tokens(token);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_user_id ON auth_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_expires ON auth_tokens(expires_at);

-- Create triggers for updated_at timestamps
CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
    AFTER UPDATE ON users
    BEGIN
        UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_announcements_timestamp 
    AFTER UPDATE ON announcements
    BEGIN
        UPDATE announcements SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_trip_albums_timestamp 
    AFTER UPDATE ON trip_albums
    BEGIN
        UPDATE trip_albums SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_sunday_readings_timestamp 
    AFTER UPDATE ON sunday_readings
    BEGIN
        UPDATE sunday_readings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
