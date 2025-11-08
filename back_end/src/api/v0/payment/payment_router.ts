import { Router } from 'express';


const paymentRouter = Router();

paymentRouter.post("/",(req,res)=>{
    const { user_id, reference, amount } = req.body;
    console.log("Received payment data:", { user_id, reference, amount });
    if (!user_id || !reference || !amount) {
        return res.status(400).json({ success: false, message: "Missing required payment fields" });
    }
    else {
        res.status(200).json({ success: true, user_id, reference, amount });
    }
});

export default paymentRouter;

