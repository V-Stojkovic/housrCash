import { Router } from 'express';
import * as userController from './user.controller';

const userRouter = Router();

// This will eventually become /api/v0/user/create
userRouter.post('/create', userController.createUser);
userRouter.post('/login', userController.authUser);

// Other examples:
// router.get('/:id', userController.getUser);

export default userRouter;