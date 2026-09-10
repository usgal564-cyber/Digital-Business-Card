-- Create database
CREATE DATABASE digital_card_db;

-- Connect to database
\c digital_card_db;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100),
    title VARCHAR(100),
    company VARCHAR(100),
    age INTEGER,
    gender VARCHAR(10) DEFAULT 'male',
    email VARCHAR(255),
    location VARCHAR(255),
    facebook VARCHAR(255),
    wiber VARCHAR(100),
    website VARCHAR(255),
    profile_image TEXT,
    background_image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create qr_designs table
CREATE TABLE qr_designs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    qr_color VARCHAR(7) DEFAULT '#1a1a2e',
    qr_bg_color VARCHAR(7) DEFAULT '#ffffff',
    qr_size INTEGER DEFAULT 150,
    qr_logo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sessions table for login
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_sessions_token ON sessions(token);

-- Insert sample user (optional)
INSERT INTO users (phone, name, title, company, email, location) 
VALUES ('+97688811988', 'U. Chingun', 'CEO', 'CIA SOLUTION', 'cybinon.cyb@gmail.com', 'Ulaanbaatar');