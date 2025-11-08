import { Router } from 'express';

const redeemRouter = Router();

redeemRouter.get("/:reward_id", (req, res) => {
    // Placeholder logic for redeem endpoint
    // You need to do database stuff
    res.status(200).json({ success: true, message: "Redeem endpoint is working!" });
});

export default redeemRouter;