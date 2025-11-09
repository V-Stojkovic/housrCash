import { Router } from 'express';
import * as userController from './user.controller';
import { authenticateToken } from '../../../middleware/authenticate';

const userRouter = Router();

// This will eventually become /api/v0/user/create
userRouter.post('/create', userController.createUser);
userRouter.post('/signup', userController.createUser); // Alias for create
userRouter.post('/login', userController.authUser); // /api/v0/user/login
userRouter.post('/logout', authenticateToken, userController.logoutUser);
userRouter.get('/balance', authenticateToken, userController.getUserBalance);// /api/v0/user/balance/:id
export default userRouter;