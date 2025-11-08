import { Request, Response, NextFunction } from 'express';

// Just an example interface
interface CreateUserDTO {
    username: string;
    email: string;
}

export const createUser = async (req: Request<{}, {}, CreateUserDTO>, res: Response, next: NextFunction) => {
    try {
        const { username, email } = req.body;
        // ... logic to save user to DB ...
        
        res.status(201).json({
            success: true,
            data: { id: 123, username, email }
        });
    } catch (error) {
        next(error);
    }
};

// You can add more controller functions here, e.g., getUser, deleteUser