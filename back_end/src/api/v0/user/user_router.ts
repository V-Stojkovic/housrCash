import { Router } from 'express';
import * as userController from './user.controller';

const router = Router();

// This will eventually become /api/v0/user/create
router.post('/create', userController.createUser);
router.post('/login', userController.authUser);

// Other examples:
// router.get('/:id', userController.getUser);

export default router;