import { Router } from 'express';
import userRouter from './user/user_router';

const v0Router = Router();

v0Router.use('/user',userRouter)


export default v0Router;