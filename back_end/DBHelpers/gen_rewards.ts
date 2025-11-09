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
    title: '$10 Amazon Gift Card',
    description: 'A $10 gift card for use on Amazon.com. Code will be emailed upon redemption.',
    cost: 1000, // Assuming 1000 points
    image_url: 'https://via.placeholder.com/300x200.png?text=Amazon+Card',
    is_active: true,
    redemptions: 55,
    categoryId: 1 // Matches 'Gift Cards'
  },
  {
    title: 'Company Logo T-Shirt',
    description: 'A high-quality 100% cotton t-shirt with the company logo. Available in S, M, L, XL.',
    cost: 2500,
    image_url: 'https://via.placeholder.com/300x200.png?text=Company+T-Shirt',
    is_active: true,
    redemptions: 120,
    categoryId: 2 // Matches 'Merchandise'
  },
  {
    title: 'Limited Edition Poster (Sold Out)',
    description: 'A 24x36 poster from our 2023 convention. This item is no longer available.',
    cost: 5000,
    image_url: 'https://via.placeholder.com/300x200.png?text=Sold+Out+Poster',
    is_active: false, // Example of an inactive reward
    redemptions: 15,
    categoryId: 2 // Matches 'Merchandise'
  },
  {
    title: '15% Off Next Purchase',
    description: 'A one-time-use coupon code for 15% off any single item in our store.',
    cost: 500,
    image_url: 'https://via.placeholder.com/300x200.png?text=15%25+Off+Coupon',
    is_active: true,
    redemptions: 250,
    categoryId: 3 // Matches 'Discounts'
  },
  {
    title: 'Exclusive Wallpaper Pack',
    description: 'A pack of 5 exclusive digital wallpapers for your desktop and mobile devices.',
    cost: 250,
    image_url: 'https://via.placeholder.com/300x200.png?text=Wallpapers',
    is_active: true,
    redemptions: 89,
    categoryId: 5 // Matches 'Digital Goods'
  },
  {
    title: 'One-Hour Expert Consultation',
    description: 'A one-hour virtual consultation with one of our top-tier experts.',
    cost: 10000,
    image_url: 'https://via.placeholder.com/300x200.png?text=Consultation',
    is_active: true,
    redemptions: 8,
    categoryId: 4 // Matches 'Experiences'
  },
  {
    title: 'Logo Sticker Pack (Uncategorized)',
    description: 'A pack of 10 high-quality vinyl logo stickers. Ships free.',
    cost: 300,
    image_url: 'https://via.placeholder.com/300x200.png?text=Stickers',
    is_active: true,
    redemptions: 42,
    categoryId: null // Example of an uncategorized item
  }
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