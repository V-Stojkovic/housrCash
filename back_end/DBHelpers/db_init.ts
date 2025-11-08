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
        // 1. CORE TABLES (No Foreign Key dependencies)
        // =========================================

        // User Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS user (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL UNIQUE,
                firstName VARCHAR(100) NOT NULL,
                surname VARCHAR(100) NOT NULL,
                balance DECIMAL(10, 2) DEFAULT 0.00,
                password_hash VARCHAR(255) NOT NULL,
                salt VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Table "user" checked/created.');

        // Category Table (referenced by reward)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS category (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE
            );
        `);
         console.log('Table "category" checked/created.');

        // =========================================
        // 2. DEPENDENT TABLES (Has Foreign Keys)
        // =========================================

        // Reward Table (merged your two definitions)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS reward (
                id INT AUTO_INCREMENT PRIMARY KEY,
                type VARCHAR(100),
                cost DECIMAL(10, 2) NOT NULL,
                redemptions INT DEFAULT 0,
                active BOOLEAN DEFAULT TRUE,
                categoryId INT,
                FOREIGN KEY (categoryId) REFERENCES category(id) ON DELETE SET NULL
            );
        `);
        console.log(' Table "reward" checked/created.');

        // Payment Table
        // NOTE: removed reference to missing 'payment_history' table for now.
        // If you need it, create 'payment_history' BEFORE this table.
        await connection.query(`
            CREATE TABLE IF NOT EXISTS payment (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT NOT NULL,
                date DATETIME DEFAULT CURRENT_TIMESTAMP,
                value DECIMAL(10, 2) NOT NULL,
                paymentAmount DECIMAL(10, 2) NOT NULL,
                reference VARCHAR(255),
                FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
            );
        `);
        console.log('Table "payment" checked/created.');

        // Redeemed Rewards
        await connection.query(`
            CREATE TABLE IF NOT EXISTS redeemed_rewards (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT NOT NULL,
                rewardId INT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
                FOREIGN KEY (rewardId) REFERENCES reward(id) ON DELETE CASCADE
            );
        `);
        console.log('Table "redeemed_rewards" checked/created.');

        // Favourite Rewards
        // NOTE: Logic change - usually you favourite a 'reward', not a 'redeemed_reward'
        await connection.query(`
            CREATE TABLE IF NOT EXISTS favourite_rewards (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT NOT NULL,
                rewardId INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
                FOREIGN KEY (rewardId) REFERENCES reward(id) ON DELETE CASCADE,
                UNIQUE KEY unique_fav (userId, rewardId)
            );
        `);
        console.log('Table "favourite_rewards" checked/created.');

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