-- database/init.sql
CREATE DATABASE IF NOT EXISTS gofiber_db;
USE gofiber_db;

-- Create records table
CREATE TABLE IF NOT EXISTS records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO records (name, value) VALUES 
('Sample Record 1', 'This is a sample value 1'),
('Sample Record 2', 'This is a sample value 2'),
('Test Data', 'Testing the API functionality'),
('Demo Record', 'Demonstration data for the API');

-- Create user for the application
CREATE USER IF NOT EXISTS 'gofiber_user'@'%' IDENTIFIED BY 'gofiber_password';
GRANT ALL PRIVILEGES ON gofiber_db.* TO 'gofiber_user'@'%';
FLUSH PRIVILEGES;