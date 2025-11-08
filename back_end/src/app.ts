import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import apiRouter from './api'; // This imports from src/api/index.ts

const app: Application = express();

// =======================
// 1. Global Middleware
// =======================
app.use(helmet());      // Security headers
app.use(cors());        // Enable CORS for all routes (configure as needed for production)
app.use(morgan('dev')); // Request logging
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// =======================
// 2. API Route Mounts
// =======================
// Mounts all versioned routes under /api
// e.g., /api/v0/user/create
app.use('/api', apiRouter);

// Basic health check route (optional but useful)
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});


// 404 Handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});


// 4. Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err.stack); // Log the error for debugging

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        message: message,
        // Only include stack trace in development mode for security
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

export default app;