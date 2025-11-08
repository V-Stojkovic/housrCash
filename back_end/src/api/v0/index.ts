import { Router } from 'express';
import paymentRouter from './payment/payment_router';
import  userRouter  from './user/user_router';

const v0Router = Router();

v0Router.use('/user', userRouter);
v0Router.use('/payment', paymentRouter);


export default v0Router;