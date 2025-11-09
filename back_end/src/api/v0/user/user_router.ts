import { Router } from 'express';
import * as userController from './user.controller';

const userRouter = Router();

// This will eventually become /api/v0/user/create
userRouter.post('/create', userController.createUser);
userRouter.post('/signup', userController.createUser); // Alias for create
userRouter.post('/login', userController.authUser); // /api/v0/user/login
userRouter.post('/logout', userController.logoutUser); // /api/v0/user/logout

// Other examples:
// router.get('/:id', userController.getUser);
userRouter.get('/balance/:id', userController.getUserBalance); // /api/v0/user/balance/:id
export default userRouter;