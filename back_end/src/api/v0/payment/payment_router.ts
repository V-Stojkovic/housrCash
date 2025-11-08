import { Router } from 'express';


const paymentRouter = Router();
/**
 * @route payment/:userID ..
 */
paymentRouter.get("/:userId?start_dt={}?end_dt{}",(req,res)=>{
    res.sendStatus(404);
})

paymentRouter.post("/http://localhost:4000/payment",(req,res)=>{
    const { userId, reference, amount } = req.body;
    console.log("Received payment data:", { userId, reference, amount });


}

export default paymentRouter;

