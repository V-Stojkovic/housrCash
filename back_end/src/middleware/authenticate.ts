// src/middleware/authenticate.ts
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // Requires 'cookie-parser' middleware to be used in app.ts
  const token = req.cookies['auth-token'];

  if (!token) {
    return res.sendStatus(401); // Unauthorized
  }

  if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in .env");
      return res.sendStatus(500);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err: unknown, decoded: string | JwtPayload | undefined) => {
    if (err || !decoded || typeof decoded === 'string') {
      return res.sendStatus(403); // Forbidden
    }

    // Automatically typed correctly because of express.d.ts
    req.user = decoded as { userId: string };
    next();
  });
};