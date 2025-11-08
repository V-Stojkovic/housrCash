import mysql, { Pool, PoolOptions } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config(); // Ensure env vars are loaded

const access: PoolOptions = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10, // Max concurrent connections
    queueLimit: 0 // Unlimited queueing of requests
};

// Create the pool
const pool: Pool = mysql.createPool(access);

// Optional: Test connection on startup
pool.getConnection()
    .then(connection => {
        console.log('✅ MySQL Database connected successfully');
        connection.release(); // Always release the connection back to the pool!
    })
    .catch(err => {
        console.error('❌ MySQL Connection Error:', err.message);
    });

export default pool;