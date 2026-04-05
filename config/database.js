const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_PATH || './database/binly.db';
const dbDir = path.dirname(dbPath);

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        throw err;
    }
    console.log('✓ Connected to SQLite database');
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Initialize database tables
async function initDatabase() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Users table
            db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    phone VARCHAR(15) UNIQUE,
                    email VARCHAR(255) UNIQUE,
                    password_hash VARCHAR(255),
                    name VARCHAR(255) NOT NULL,
                    role TEXT CHECK(role IN ('citizen', 'collector', 'admin')) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    is_active BOOLEAN DEFAULT 1
                )
            `);

            // Households table
            db.run(`
                CREATE TABLE IF NOT EXISTS households (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    household_id VARCHAR(50) UNIQUE NOT NULL,
                    user_id INTEGER,
                    address TEXT NOT NULL,
                    area VARCHAR(100),
                    ward VARCHAR(50),
                    qr_code TEXT,
                    latitude DECIMAL(10, 8),
                    longitude DECIMAL(11, 8),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            `);

            // Waste pickups table
            db.run(`
                CREATE TABLE IF NOT EXISTS waste_pickups (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    household_id INTEGER NOT NULL,
                    collector_id INTEGER NOT NULL,
                    pickup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    wet_waste_kg DECIMAL(5, 2),
                    dry_waste_kg DECIMAL(5, 2),
                    recyclables_kg DECIMAL(5, 2),
                    ewaste_kg DECIMAL(5, 2),
                    quality_rating TEXT CHECK(quality_rating IN ('good', 'medium', 'poor')),
                    contamination_detected BOOLEAN DEFAULT 0,
                    credits_earned INTEGER,
                    collector_earnings DECIMAL(8, 2),
                    bonus_amount DECIMAL(8, 2),
                    photo_url TEXT,
                    FOREIGN KEY (household_id) REFERENCES households(id),
                    FOREIGN KEY (collector_id) REFERENCES users(id)
                )
            `);

            // Credits table
            db.run(`
                CREATE TABLE IF NOT EXISTS credits (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL UNIQUE,
                    balance INTEGER DEFAULT 0,
                    total_earned INTEGER DEFAULT 0,
                    total_redeemed INTEGER DEFAULT 0,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            `);

            // Credit transactions table
            db.run(`
                CREATE TABLE IF NOT EXISTS credit_transactions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    transaction_type TEXT CHECK(transaction_type IN ('earned', 'redeemed', 'bonus')),
                    amount INTEGER NOT NULL,
                    description TEXT,
                    reference_id INTEGER,
                    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            `);

            // Routes table
            db.run(`
                CREATE TABLE IF NOT EXISTS routes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    route_id VARCHAR(50) UNIQUE NOT NULL,
                    route_name VARCHAR(255),
                    collector_id INTEGER,
                    area VARCHAR(100),
                    household_count INTEGER,
                    distance_km DECIMAL(5, 2),
                    estimated_time_minutes INTEGER,
                    status TEXT CHECK(status IN ('active', 'completed', 'optimized')),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (collector_id) REFERENCES users(id)
                )
            `);

            // Analytics table
            db.run(`
                CREATE TABLE IF NOT EXISTS analytics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date DATE NOT NULL,
                    ward VARCHAR(50),
                    total_pickups INTEGER,
                    segregation_rate DECIMAL(5, 2),
                    contamination_rate DECIMAL(5, 2),
                    wet_waste_total DECIMAL(8, 2),
                    dry_waste_total DECIMAL(8, 2),
                    recyclables_total DECIMAL(8, 2),
                    credits_distributed INTEGER,
                    collector_payments DECIMAL(10, 2),
                    UNIQUE(date, ward)
                )
            `, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    });
}

// Helper function to run queries with promises
function runQuery(query, params = []) {
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, changes: this.changes });
        });
    });
}

// Helper function to get single row
function getOne(query, params = []) {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

// Helper function to get all rows
function getAll(query, params = []) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

module.exports = {
    db,
    initDatabase,
    runQuery,
    getOne,
    getAll
};