import { Router } from 'express';


const paymentRouter = Router();
/**
 * @route payment/:userID ..
 */
paymentRouter.get("/:userId?start_dt={}?end_dt{}",(req,res)=>{
    res.sendStatus(404);
})

export default paymentRouter;

