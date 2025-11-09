import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function initDB() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });

    try {
        console.log(' Initializing database...');

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
        console.log(`Database ${process.env.DB_NAME} checked/created.`);

        await connection.changeUser({ database: process.env.DB_NAME });

        // =========================================
        // DROP EXISTING TABLES (in reverse dependency order)
        // =========================================
        console.log('Dropping existing tables...');
        await connection.query('DROP TABLE IF EXISTS favourite_rewards;');
        await connection.query('DROP TABLE IF EXISTS redeemed_rewards;');
        await connection.query('DROP TABLE IF EXISTS payment;');
        await connection.query('DROP TABLE IF EXISTS group_payment_status;');
        await connection.query('DROP TABLE IF EXISTS group_transaction;');
        await connection.query('DROP TABLE IF EXISTS reward;');
        await connection.query('DROP TABLE IF EXISTS settings;');
        await connection.query('DROP TABLE IF EXISTS category;');
        await connection.query('DROP TABLE IF EXISTS user;');
        await connection.query('DROP TABLE IF EXISTS `groups`;');
        console.log('Existing tables dropped.');

        // =========================================
        // 1. CORE TABLES (No Foreign Key dependencies)
        // =========================================

        // Groups Table
        await connection.query(`
            CREATE TABLE \`groups\` (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                balance DECIMAL(10, 2) DEFAULT 0.00,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Table "groups" created.');

        // User Table
        await connection.query(`
            CREATE TABLE user (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(100) NOT NULL UNIQUE,
                googleId INT UNIQUE,
                firstName VARCHAR(100) NOT NULL,
                balance DECIMAL(10, 2) DEFAULT 0.00,
                password_hash VARCHAR(255) DEFAULT NULL,
                groupId INT DEFAULT NULL,
                group_spend DECIMAL(10, 2) DEFAULT 0.00,
                group_debt DECIMAL(10, 2) DEFAULT 0.00,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (groupId) REFERENCES \`groups\`(id) ON DELETE SET NULL
            );
        `);
        console.log('Table "user" created.');

        // Category Table (referenced by reward)
        await connection.query(`
            CREATE TABLE category (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE
            );
        `);
         console.log('Table "category" created.');

        // =========================================
        // 2. DEPENDENT TABLES (Has Foreign Keys)
        // =========================================

        // Reward Table
        await connection.query(`
            CREATE TABLE reward (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                cost INT NOT NULL,
                image_url VARCHAR(500),
                is_active BOOLEAN DEFAULT TRUE,
                redemptions INT DEFAULT 0,
                categoryId INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (categoryId) REFERENCES category(id) ON DELETE SET NULL
            );
        `);
        console.log(' Table "reward" created.');
        
        // Settings Table for cashback rate and other global settings
        await connection.query(`
            CREATE TABLE settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                setting_key VARCHAR(100) NOT NULL UNIQUE,
                setting_value VARCHAR(255) NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `);
        console.log('Table "settings" created.');
        
        // Insert default cashback rate if not exists
        await connection.query(`
            INSERT IGNORE INTO settings (setting_key, setting_value)
            VALUES ('cashback_rate', '1.0');
        `);
        console.log('Default settings initialized.');

        // Payment Table
        // NOTE: removed reference to missing 'payment_history' table for now.
        // If you need it, create 'payment_history' BEFORE this table.
        await connection.query(`
            CREATE TABLE payment (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT NOT NULL,
                date DATETIME DEFAULT CURRENT_TIMESTAMP,
                value INTEGER NOT NULL,
                paymentAmount DECIMAL(10, 2) NOT NULL,
                reference VARCHAR(255),
                FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
            );
        `);
        console.log('Table "payment" created.');

        // Redeemed Rewards
        await connection.query(`
            CREATE TABLE redeemed_rewards (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT NOT NULL,
                rewardId INT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
                FOREIGN KEY (rewardId) REFERENCES reward(id) ON DELETE CASCADE
            );
        `);
        console.log('Table "redeemed_rewards" created.');

        // Favourite Rewards
        // NOTE: Logic change - usually you favourite a 'reward', not a 'redeemed_reward'
        await connection.query(`
            CREATE TABLE favourite_rewards (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT NOT NULL,
                rewardId INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
                FOREIGN KEY (rewardId) REFERENCES reward(id) ON DELETE CASCADE,
                UNIQUE KEY unique_fav (userId, rewardId)
            );
        `);
        console.log('Table "favourite_rewards" created.');

        // Group Transactions Table
        await connection.query(`
            CREATE TABLE group_transaction (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT DEFAULT NULL,
                groupId INT NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                reference VARCHAR(255),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES user(id) ON DELETE SET NULL,
                FOREIGN KEY (groupId) REFERENCES \`groups\`(id) ON DELETE CASCADE
            );
        `);
        console.log('Table "group_transaction" created.');

        // Group Payment Status Table
        // Tracks which users have marked their portion as paid
        await connection.query(`
            CREATE TABLE group_payment_status (
                id INT AUTO_INCREMENT PRIMARY KEY,
                transactionId INT NOT NULL,
                userId INT NOT NULL,
                marked_paid BOOLEAN DEFAULT FALSE,
                marked_at TIMESTAMP NULL DEFAULT NULL,
                FOREIGN KEY (transactionId) REFERENCES group_transaction(id) ON DELETE CASCADE,
                FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
                UNIQUE KEY unique_payment_status (transactionId, userId)
            );
        `);
        console.log('Table "group_payment_status" created.');

        console.log('--- Database initialization complete! ---');
        process.exit(0);
    } catch (error) {
        console.error(' Error initializing database:', error);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

initDB();