import { Router } from 'express';
import { addCredit, addPayment, cashbackRateTest, getCashBackRate, getId, getPayments } from '../../../../DBHelpers/db_helpers';
import { authenticateToken } from '../../../middleware/authenticate';
const dbHelpers: any = require('../../../../DBHelpers/db_helpers'); // dynamic require to avoid changing top imports



const paymentRouter = Router();



paymentRouter.post("/", async (req, res) => {
    const { user_id, reference, amount,  value} = req.body;
    console.log("Received payment data:", { user_id, reference, amount });
    if (!user_id || !reference || !amount) {
        return res.status(400).json({ success: false, message: "Missing required payment fields" });
    }

    try {
        // Try to detect and use a DB transaction if the DB helper exports a knex/db instance.
        // This keeps both operations atomic: if addCredit fails, the payment insert is rolled back.
        const rate: number = await cashbackRateTest();
        // console.log("Table:", table);
        const knexInstance = dbHelpers.knex || dbHelpers.db || dbHelpers.default?.knex || dbHelpers.default?.db || null;
        // const rate = await Number(getCashBackRate());
        console.log("Cashback rate:", rate);
        const transaction_gain = amount * rate!;
        if (knexInstance && typeof knexInstance.transaction === 'function') {
            const data = await knexInstance.transaction(async (trx: any) => {
                // assume addPayment/addCredit accept an optional trx parameter

                const payment = await addPayment({ userId: user_id, reference, paymentAmount: amount, value: rate }, trx);

                await addCredit({ userId: user_id, amount: transaction_gain }, trx);
                return payment;
            });

            return res.status(200).json({ success: true, data, user_id, reference, amount });
        } else {
            // Fallback: perform operations sequentially and attempt a compensating rollback if credit fails.
            const payment = await addPayment({ userId: user_id, reference, paymentAmount: amount, value: rate });

            try {
                await addCredit({ userId: user_id, amount: transaction_gain });
                return res.status(200).json({ success: true, data: payment, user_id, reference, amount });
            } catch (creditError) {
                console.error("addCredit failed, attempting to rollback payment:", creditError);

                // Attempt to roll back the created payment if a delete/rollback helper exists.
                // This is best-effort; log failures but surface original error to caller.
                try {
                    if (typeof dbHelpers.deletePayment === 'function') {
                        // try to determine payment id from returned result shape
                        const paymentId = payment?.id ?? payment?.insertId ?? payment?.[0]?.id;
                        if (paymentId) {
                            await dbHelpers.deletePayment(paymentId);
                        } else {
                            // if no delete helper or id, try generic rollback function
                            if (typeof dbHelpers.rollbackPayment === 'function') {
                                await dbHelpers.rollbackPayment(payment);
                            }
                        }
                    }
                } catch (rollbackErr) {
                    console.error("Rollback attempt failed:", rollbackErr);
                }

                return res.status(500).json({
                    success: false,
                    message: "Server error occurred while crediting user. Payment has been rolled back if possible.",
                    error: creditError instanceof Error ? creditError.message : creditError
                });
            }
        }
    } catch (error) {
        console.error("Error processing payment:", error);
        return res.status(500).json({
            success: false,
            message: "Server error occurred",
            error: error instanceof Error ? error.message : error
        });
    }
});
// GET /api/v0/payment/get - Get all payments or filtered by userId
paymentRouter.get("/paid",authenticateToken, async (req, res) => {
    try {
        const userId = (req as any).user.userId;
        const payments = await getPayments(userId);
        res.json({ success: true, payments });
    } catch (error) {
        console.error("Error fetching payments:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch payments",
            error: error instanceof Error ? error.message : error
        });
    }
});

export default paymentRouter;