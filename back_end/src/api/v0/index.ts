import { Router } from 'express';
import paymentRouter from './payment/payment_router';
import  userRouter  from './user/user_router';
import redeemRouter from './redeem/redeem_router';
import authRouter from './auth/auth.router';
import rewardRouter from './reward/reward_router';
import settingsRouter from './settings/settings_router';
import groupRouter from './group/group_router';

const v0Router = Router();

v0Router.use('/user', userRouter);
v0Router.use('/payment', paymentRouter);
v0Router.use('/redeem', redeemRouter);
v0Router.use('/auth', authRouter);
v0Router.use('/reward', rewardRouter);
v0Router.use('/settings', settingsRouter);
v0Router.use('/group', groupRouter);

export default v0Router;