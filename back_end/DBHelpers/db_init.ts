// File: gen_rewards.ts
//
// This script gen_rewardss the database with dummy data for 'category' and 'reward'.
// It's designed to be run after 'initDB.ts' has created the tables.
//
// How to run:
// 1. Make sure your .env file is set up.
// 2. Run: npx ts-node gen_rewards.ts
//
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// =========================================
// DUMMY DATA DEFINITIONS
// =========================================

/**
 * Categories to be inserted.
 * We use INSERT IGNORE, so these will only be added if they don't exist.
 * We will assume their IDs are 1, 2, 3, 4 for the rewards data.
 */
const categories = [
    ['Gift Cards'],
    ['Merchandise'],
    ['Discounts'],
    ['Experiences'],
    ['Digital Goods']
];

/**
 * Rewards to be inserted.
 * Note: 'cost' is now an INT, representing points or cents (e.g., 1000 points).
 */
const rewards = [
  {
    title: '£10 Brewdog Gift Card',
    description: 'A $10 gift card for use on Brewdog.com. Code will be emailed upon redemption.',
    cost: 1000, // Assuming 1000 points
    image_url: 'https://via.placeholder.com/300x200.png?text=Brewdog+Card',
    is_active: true,
    redemptions: 55,
    categoryId: 1 // Matches 'Gift Cards'
  },
  {
    title: '£25 Papa Johns',
    description: '£25 Papa Johns voucher redeemable in-store or online.',
    cost: 2500,
    image_url: 'https://via.placeholder.com/300x200.png?text=Papa+Johns',
    is_active: true,
    redemptions: 120,
    categoryId: 2 // Matches 'Merchandise'
  },
  {
    title: 'MyProtein',
    description: '£50 voucher for MyProtein products, valid online only.',
    cost: 5000,
    image_url: 'https://via.placeholder.com/300x200.png?text=MyProtein',
    is_active: false, // Example of an inactive reward
    redemptions: 15,
    categoryId: 2 // Matches 'Merchandise'
  },
  {
    title: '15% Off Next Purchase at New Balance',
    description: 'A one-time-use coupon code for 15% off any single item at New Balance.',
    cost: 500,
    image_url: 'https://via.placeholder.com/300x200.png?text=15%25+Off+Coupon',
    is_active: true,
    redemptions: 250,
    categoryId: 3 // Matches 'Discounts'
  },
  {
    title: 'Spotify Premium - 1 Month Subscription',
    description: 'Enjoy ad-free music with a one-month subscription to Spotify Premium.',
    cost: 250,
    image_url: 'https://via.placeholder.com/300x200.png?text=Spotify+Premium',
    is_active: true,
    redemptions: 89,
    categoryId: 5 // Matches 'Digital Goods'
  },
  
];


// =========================================
// SEEDING FUNCTION
// =========================================

async function seedData() {
    let connection: mysql.Connection | null = null;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME // Connect directly to the DB
        });

        console.log('✅ Connected to database. Seeding data...');

        // --- 1. Seed Categories ---
        // We use 'INSERT IGNORE' so it doesn't fail if categories already exist.
        console.log('Seeding categories...');
        const categorySql = 'INSERT IGNORE INTO category (name) VALUES ?';
        await connection.query(categorySql, [categories]);
        console.log('Categories seeded (or already exist).');


        // --- 2. Seed Rewards ---
        // We TRUNCATE the table first for a clean seed.
        // We must disable foreign key checks to truncate.
        console.log('Truncating reward table for a clean seed...');
        await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
        await connection.query('TRUNCATE TABLE reward;');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
        console.log('Reward table truncated.');

        // Map the reward objects to an array of arrays for the query
        const rewardData = rewards.map(r => [
            r.title,
            r.description,
            r.cost,
            r.image_url,
            r.is_active,
            r.redemptions,
            r.categoryId
        ]);

        // Define the columns explicitly
        const rewardSql = `
            INSERT INTO reward 
                (title, description, cost, image_url, is_active, redemptions, categoryId) 
            VALUES ?
        `;
        
        console.log('Inserting new reward data...');
        const [result] = await connection.query(rewardSql, [rewardData]);
        console.log(`✅ Rewards seeded successfully.`);

    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Database connection closed.');
        }
        process.exit(0);
    }
}

seedData();