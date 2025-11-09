import { Router } from 'express';
import paymentRouter from './payment/payment_router';
import  userRouter  from './user/user_router';
import redeemRouter from './redeem/redeem_router';
import authRouter from './auth/auth.router';

const v0Router = Router();

v0Router.use('/user', userRouter);
v0Router.use('/payment', paymentRouter);
v0Router.use('/redeem', redeemRouter);
v0Router.use('/auth', authRouter);

export default v0Router;